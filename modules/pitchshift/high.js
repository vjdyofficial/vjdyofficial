// ---------------------------------------------------------------------------
// Tiny replacement for the "custom-audio-node" package. Turns `input` into
// the public node: whatever connects INTO it feeds the graph, and whatever it
// connects TO is fed from `output`. `params` are exposed as properties.
// ---------------------------------------------------------------------------
function createAudioNode(input, output, params) {
  input.connect = (...args) => output.connect(...args);
  input.disconnect = (...args) => output.disconnect(...args);
  for (const name of Object.keys(params)) {
    Object.defineProperty(input, name, {
      value: params[name],
      enumerable: true,
    });
  }
  return input;
}

// ---------------------------------------------------------------------------
// Worklet code. This function is NOT called in this file: its source text is
// sent to the audio thread, so it must be fully self-contained (no references
// to anything outside the function).
// ---------------------------------------------------------------------------
function workletMain() {
  const TWO_PI = Math.PI * 2;

  function makeFFT(n) {
    const levels = Math.log2(n) | 0;
    const cos = new Float64Array(n / 2);
    const sin = new Float64Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
      cos[i] = Math.cos((TWO_PI * i) / n);
      sin[i] = Math.sin((TWO_PI * i) / n);
    }
    const rev = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      let r = 0;
      for (let b = 0; b < levels; b++) r |= ((i >> b) & 1) << (levels - 1 - b);
      rev[i] = r;
    }
    return function fft(re, im) {
      for (let i = 0; i < n; i++) {
        const j = rev[i];
        if (j > i) {
          let t = re[i]; re[i] = re[j]; re[j] = t;
          t = im[i]; im[i] = im[j]; im[j] = t;
        }
      }
      for (let size = 2; size <= n; size <<= 1) {
        const half = size >> 1;
        const step = n / size;
        for (let i = 0; i < n; i += size) {
          for (let j = i, k = 0; j < i + half; j++, k += step) {
            const l = j + half;
            const tr = re[l] * cos[k] + im[l] * sin[k];
            const ti = im[l] * cos[k] - re[l] * sin[k];
            re[l] = re[j] - tr;
            im[l] = im[j] - ti;
            re[j] += tr;
            im[j] += ti;
          }
        }
      }
    };
  }

  class ChannelState {
    constructor(N, hop) {
      const bins = N / 2 + 1;
      this.inFifo = new Float32Array(N);
      this.snap = new Float32Array(N); // frame waiting to be analysed
      this.outFifo = new Float32Array(hop); // hop being played out
      this.nextOut = new Float32Array(hop); // hop being computed
      this.accum = new Float32Array(N * 2);
      this.anaMagn = new Float64Array(bins);
      this.anaPhase = new Float64Array(bins);
      this.re = new Float64Array(N);
      this.im = new Float64Array(N);
      this.pending = false;
      this.fno = 0; // frame number (same for all channels)
    }
  }

  class PitchShiftProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
      return [
        {
          name: "pitch", // frequency ratio (2 = +1 octave)
          defaultValue: 1,
          minValue: 0.25,
          maxValue: 4,
          automationRate: "k-rate",
        },
      ];
    }

    constructor(options) {
      super();
      const o = (options && options.processorOptions) || {};
      this.N = o.fftSize || 2048;
      this.osamp = o.overlap || 4;
      this.hop = this.N / this.osamp;
      this.half = this.N / 2;
      this.latencyIn = this.N - this.hop;
      this.expct = TWO_PI / this.osamp;
      this.fft = makeFFT(this.N);
      this.win = new Float64Array(this.N);
      for (let i = 0; i < this.N; i++) {
        this.win[i] = 0.5 - 0.5 * Math.cos((TWO_PI * i) / this.N);
      }
      this.channels = [];
      this.nActive = 0;
      this.fno = 0;
      // One frame position shared by ALL channels, so every channel is
      // analysed at exactly the same instant.
      this.rover = this.latencyIn;
      // Frames waiting to be computed; the work is spread over the next few
      // audio blocks instead of all landing in one block.
      this.queue = [];

      // Shared "reference" phase track. Every channel's output phase is the
      // reference phase plus that channel's own phase offset from the
      // reference, so phase relationships between channels survive the shift
      // (an inverted side signal stays inverted, identical channels stay
      // identical).
      const bins = this.half + 1;
      this.ref = {
        fno: -1,
        ratio: 1,
        magn: new Float64Array(bins),
        phase: new Float64Array(bins),
        freq: new Float64Array(bins),
        lastPhase: new Float64Array(bins),
        sumPhase: new Float64Array(bins),
        ksrc: new Int32Array(bins), // source bin feeding each output bin
        bestMag: new Float64Array(bins),
        re: new Float64Array(this.N),
        im: new Float64Array(this.N),
      };
    }

    _computeRef(fno, ratio) {
      const { N, half, osamp, win, expct, fft, ref } = this;

      // Use the loudest channel as the reference (robust to silent/inverted
      // channels; the reference only supplies frequencies, never the level).
      let best = 0;
      let bestE = -1;
      for (let ch = 0; ch < this.nActive; ch++) {
        const s = this.channels[ch].snap;
        let e = 0;
        for (let i = 0; i < N; i++) e += s[i] * s[i];
        if (e > bestE) {
          bestE = e;
          best = ch;
        }
      }
      const s = this.channels[best].snap;
      const { re, im } = ref;
      for (let i = 0; i < N; i++) {
        re[i] = s[i] * win[i];
        im[i] = 0;
      }
      fft(re, im);

      for (let k = 0; k <= half; k++) {
        const r = re[k];
        const m = im[k];
        ref.magn[k] = 2 * Math.sqrt(r * r + m * m);
        const phase = Math.atan2(m, r);
        let d = phase - ref.lastPhase[k] - k * expct;
        ref.lastPhase[k] = phase;
        d -= TWO_PI * Math.round(d / TWO_PI);
        ref.freq[k] = k + (osamp * d) / TWO_PI;
        ref.phase[k] = phase;
      }

      // Each output bin takes the strongest source bin that maps onto it
      ref.ksrc.fill(-1);
      ref.bestMag.fill(-1);
      for (let k = 0; k <= half; k++) {
        const idx = Math.round(k * ratio);
        if (idx <= half && ref.magn[k] > ref.bestMag[idx]) {
          ref.bestMag[idx] = ref.magn[k];
          ref.ksrc[idx] = k;
        }
      }

      // Advance the shared synthesis phase
      for (let idx = 0; idx <= half; idx++) {
        const k = ref.ksrc[idx];
        const f = k >= 0 ? ref.freq[k] * ratio : idx;
        let p = ref.sumPhase[idx] + (TWO_PI * (f - idx)) / osamp + idx * expct;
        p -= TWO_PI * Math.floor(p / TWO_PI);
        ref.sumPhase[idx] = p;
      }
      ref.fno = fno;
      ref.ratio = ratio;
    }

    _frame(c, ratio) {
      const { N, hop, half, osamp, win, fft, ref } = this;
      if (ref.fno !== c.fno) this._computeRef(c.fno, ratio);
      const { re, im, anaMagn, anaPhase } = c;

      // Analysis of this channel
      for (let i = 0; i < N; i++) {
        re[i] = c.snap[i] * win[i];
        im[i] = 0;
      }
      fft(re, im);
      for (let k = 0; k <= half; k++) {
        const r = re[k];
        const m = im[k];
        anaMagn[k] = 2 * Math.sqrt(r * r + m * m);
        anaPhase[k] = Math.atan2(m, r);
      }

      // Synthesis: shared reference phase + this channel's offset from it
      for (let idx = 0; idx <= half; idx++) {
        const k = ref.ksrc[idx];
        if (k < 0) {
          re[idx] = 0;
          im[idx] = 0;
          continue;
        }
        const mag = anaMagn[k];
        const p = ref.sumPhase[idx] + (anaPhase[k] - ref.phase[k]);
        re[idx] = mag * Math.cos(p);
        im[idx] = -mag * Math.sin(p); // conjugate: forward FFT acts as inverse
      }
      for (let k = half + 1; k < N; k++) {
        re[k] = 0;
        im[k] = 0;
      }
      fft(re, im);

      const scale = 2 / (half * osamp);
      for (let i = 0; i < N; i++) c.accum[i] += win[i] * re[i] * scale;

      c.nextOut.set(c.accum.subarray(0, hop));
      c.accum.copyWithin(0, hop);
      c.accum.fill(0, c.accum.length - hop);
      c.pending = false;
    }

    // Called when a channel has collected a full frame.
    _boundary(c, ratio) {
      if (c.pending) this._frame(c, ratio); // safety: never fall behind
      const t = c.outFifo; // play the hop computed during the last hop
      c.outFifo = c.nextOut;
      c.nextOut = t;
      c.fno++;
      c.snap.set(c.inFifo); // queue this frame for analysis
      c.inFifo.copyWithin(0, this.hop);
      c.pending = true;
      this.queue.push(c);
    }

    process(inputs, outputs, parameters) {
      const inp = inputs[0];
      const out = outputs[0];
      const ratio = parameters.pitch[0];
      if (!out.length) return true;

      const N = this.N;
      for (let ch = 0; ch < out.length; ch++) {
        if (!this.channels[ch]) {
          const c = new ChannelState(N, this.hop);
          c.fno = this.fno;
          this.channels[ch] = c;
        }
      }
      this.nActive = out.length;

      // Spread queued FFT work: enough per block to finish within one hop.
      let budget = Math.max(1, Math.ceil(out.length / Math.max(1, this.hop / 128)));
      while (budget-- > 0 && this.queue.length) {
        const c = this.queue.shift();
        if (c.pending) this._frame(c, ratio);
      }

      const lat = this.latencyIn;
      let r = this.rover;

      for (let ch = 0; ch < out.length; ch++) {
        const c = this.channels[ch];
        const x = inp[ch];
        const y = out[ch];
        r = this.rover; // every channel walks the same positions
        for (let i = 0; i < y.length; i++) {
          c.inFifo[r] = x ? x[i] : 0;
          y[i] = c.outFifo[r - lat];
          if (++r >= N) {
            r = lat;
            this._boundary(c, ratio);
          }
        }
      }
      this.rover = r;
      this.fno = this.channels[0].fno;
      return true;
    }
  }

  registerProcessor("pitch-shift-processor", PitchShiftProcessor);
}

// ---------------------------------------------------------------------------
// Loading: one addModule per AudioContext. Registering the same processor name
// twice throws, so cache the promise per context.
// ---------------------------------------------------------------------------
const loaded = new WeakMap();

function loadWorklet(audioContext) {
  let p = loaded.get(audioContext);
  if (!p) {
    const source = `(${workletMain.toString()})();`;
    const url = URL.createObjectURL(
      new Blob([source], { type: "text/javascript" }),
    );
    p = audioContext.audioWorklet
      .addModule(url)
      .finally(() => URL.revokeObjectURL(url));
    loaded.set(audioContext, p);
  }
  return p;
}

/**
 * High-quality pitch shifter (phase vocoder in an AudioWorklet).
 * Synchronous: returns a usable node immediately; the vocoder is attached as
 * soon as the worklet module has loaded (until then wet is silent).
 *
 * Channel count is automatic: every channel that arrives is pitch-shifted
 * independently and comes out on the same channel index (2, 6, 8, ...).
 * Nothing is downmixed, so channel polarity (e.g. an inverted side signal)
 * is never summed away by the routing.
 *
 *   const node = PitchShift(ctx);
 *   node.transpose = 3;   // semitones; safe to set before it's ready
 *   await node.ready;     // optional
 */
function PitchShift(audioContext, options = {}) {
  const {
    fftSize = 2048, // 4096 = smoother, more latency
    overlap = 4, // 8 = cleaner, 2x CPU
    ramp = 0.02, // seconds, smoothing for transpose changes
  } = options;

  // "max" count mode + "discrete" interpretation: the node takes as many
  // channels as are connected, and channel N always stays channel N
  // (no speaker-layout up/down-mixing).
  const passThrough = (n) => {
    n.channelCountMode = "max";
    n.channelInterpretation = "discrete";
    return n;
  };

  const input = passThrough(audioContext.createGain());
  const output = passThrough(audioContext.createGain());
  const wet = passThrough(audioContext.createGain());
  const dry = passThrough(audioContext.createGain());
  dry.gain.value = 0;

  // Match the dry path to the vocoder's latency (fftSize + one hop)
  const latency = (fftSize + fftSize / overlap) / audioContext.sampleRate;
  const dryDelay = passThrough(audioContext.createDelay(1));
  dryDelay.delayTime.value = latency;

  input.connect(wet);
  input.connect(dry);
  dry.connect(dryDelay);
  dryDelay.connect(output);

  const node = createAudioNode(input, output, {
    dry: dry.gain, // AudioParams, default 0
    wet: wet.gain, // default 1
  });

  let semitones = 0;
  let pitchParam = null;

  Object.defineProperty(node, "transpose", {
    set(value) {
      semitones = value;
      if (pitchParam) {
        pitchParam.setTargetAtTime(
          Math.pow(2, value / 12),
          audioContext.currentTime,
          ramp,
        );
      }
    },
    get() {
      return semitones;
    },
  });

  Object.defineProperty(node, "latency", { get: () => latency });

  // Attach the vocoder once the worklet module is loaded
  Object.defineProperty(node, "ready", {
    value: loadWorklet(audioContext).then(() => {
      // No outputChannelCount: with one input and one output, the output
      // automatically gets the same channel count as the input.
      const shifter = new AudioWorkletNode(
        audioContext,
        "pitch-shift-processor",
        {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          channelCountMode: "max",
          channelInterpretation: "discrete",
          processorOptions: { fftSize, overlap },
        },
      );
      pitchParam = shifter.parameters.get("pitch");
      pitchParam.setValueAtTime(
        Math.pow(2, semitones / 12),
        audioContext.currentTime,
      );
      wet.connect(shifter);
      shifter.connect(output);
    }),
  });

  return node;
}

export default PitchShift;
