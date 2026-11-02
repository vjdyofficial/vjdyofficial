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
// MEDIUM quality pitch shifter: two-tap granular delay line with waveform
// alignment (SOLA). Worklet code below is NOT called in this file: its source
// text is sent to the audio thread, so it must be fully self-contained.
//
// Why it has no CPU spikes / buffer problems:
//  - no FFT and no FIFO frames: the cost per sample is constant (two
//    interpolated reads per channel);
//  - the only periodic work is a small alignment search once every half grain
//    (~30k multiply-adds, independent of channel count);
//  - all buffers are allocated up front, nothing is allocated in process();
//  - every read position is clamped, so it can never read unwritten data or
//    wrap into stale samples, even if the pitch is changed abruptly.
//
// Channels share ONE set of grain positions/delays, so every channel is
// delayed and resampled identically: polarity and inter-channel phase (e.g.
// an inverted side signal) are preserved exactly.
// ---------------------------------------------------------------------------
function workletMain() {
  // 4-point Hermite interpolation
  function hermite(ym1, y0, y1, y2, t) {
    const c1 = 0.5 * (y1 - ym1);
    const c2 = ym1 - 2.5 * y0 + 2 * y1 - 0.5 * y2;
    const c3 = 0.5 * (y2 - ym1) + 1.5 * (y0 - y1);
    return ((c3 * t + c2) * t + c1) * t + y0;
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
      const o = options.processorOptions;
      this.G = o.grain; // grain length (samples, even)
      this.H = o.grain / 2; // hop = half grain
      this.S = o.search; // alignment search range (+/- samples)
      this.K = o.compareCount; // points compared per candidate
      this.stride = o.compareStride; // spacing of compared points
      this.C0 = o.latency; // nominal delay at the centre of a grain
      this.maxRatio = o.maxRatio;
      this.size = o.bufferSize;
      this.mask = o.bufferSize - 1;
      this.maxD = o.maxDelay; // largest allowed delay

      // periodic Hann: win[n] + win[n + H] === 1 (constant-gain crossfade)
      this.win = new Float32Array(this.G);
      for (let i = 0; i < this.G; i++) {
        this.win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / this.G);
      }

      // All memory allocated up front
      this.bufs = [];
      for (let c = 0; c < o.maxChannels; c++) {
        this.bufs.push(new Float32Array(this.size));
      }
      this.refA = new Float32Array(this.K);
      this.refIdx = new Int32Array(this.K);
      this.rj = new Float64Array(this.K);

      // Two taps, half a grain apart
      this.w = 0;
      this.n = [0, this.H]; // position inside each tap's grain
      this.d = [this.C0, this.C0]; // current delay of each tap
      this.nActive = 0;
      this.started = false;
    }

    _score(buf, a, s0, dl, r) {
      const dA = s0 + dl;
      if (dA < 4 || dA > this.maxD) return -Infinity;
      const { K, mask, rj } = this;
      const pos0 = this.w - dA + 0.5;
      let dot = 0;
      let eb = 0;
      for (let k = 0; k < K; k++) {
        const v = buf[Math.floor(pos0 + rj[k]) & mask];
        dot += a[k] * v;
        eb += v * v;
      }
      return dot / Math.sqrt(eb + 1e-9);
    }

    // Called when tap t starts a new grain: choose its starting delay so that
    // its waveform lines up with the tap that is currently playing.
    _startGrain(t, r) {
      const { K, stride, S, G, C0, mask, bufs, nActive, refA, refIdx, rj } = this;
      const o = t ^ 1;
      const s0 = C0 + (r - 1) * (G / 2); // nominal start delay
      this.d[t] = s0;

      // The other tap's recent output (it sits at the centre of its grain, so
      // the last K*stride samples all belong to its current grain).
      const baseB = this.w - this.d[o] + 0.5;
      for (let k = 0; k < K; k++) {
        rj[k] = r * (k - K) * stride;
        refIdx[k] = Math.floor(baseB + rj[k]) & mask;
      }

      // Align on the loudest channel (costs the same for 2 or 8 channels)
      let ref = 0;
      let eRef = -1;
      for (let ch = 0; ch < nActive; ch++) {
        const b = bufs[ch];
        let e = 0;
        for (let k = 0; k < K; k++) {
          const v = b[refIdx[k]];
          e += v * v;
        }
        if (e > eRef) {
          eRef = e;
          ref = ch;
        }
      }
      if (eRef < 1e-9) return; // silence: nothing to align

      const buf = bufs[ref];
      for (let k = 0; k < K; k++) refA[k] = buf[refIdx[k]];

      // coarse search, then refine around the best candidate
      let best = -Infinity;
      let bestDl = 0;
      for (let dl = -S; dl <= S; dl += 3) {
        const sc = this._score(buf, refA, s0, dl, r);
        if (sc > best) {
          best = sc;
          bestDl = dl;
        }
      }
      const centre = bestDl;
      for (let dl = centre - 2; dl <= centre + 2; dl++) {
        if (dl === centre) continue;
        const sc = this._score(buf, refA, s0, dl, r);
        if (sc > best) {
          best = sc;
          bestDl = dl;
        }
      }
      if (best > -Infinity) this.d[t] = s0 + bestDl;
    }

    process(inputs, outputs, parameters) {
      const out = outputs[0];
      if (!out.length) return true;
      const inp = inputs[0];

      let r = parameters.pitch[0];
      if (!(r > 0)) r = 1;
      const maxR = this.maxRatio;
      if (r > maxR) r = maxR;
      else if (r < 1 / maxR) r = 1 / maxR;

      const nch = out.length;
      while (this.bufs.length < nch) {
        this.bufs.push(new Float32Array(this.size)); // rare: >maxChannels
      }
      this.nActive = nch;

      const { win, mask, G, maxD, bufs } = this;
      const bufs0 = bufs;
      const len = out[0].length;
      const dd = 1 - r;

      // first block: place both taps for the current pitch
      if (!this.started) {
        this.started = true;
        const H = this.H;
        this.d[0] = this.C0 + (r - 1) * (H - this.n[0]);
        this.d[1] = this.C0 + (r - 1) * (H - this.n[1]);
      }

      let w = this.w;
      let n0 = this.n[0];
      let n1 = this.n[1];
      let d0 = this.d[0];
      let d1 = this.d[1];

      for (let i = 0; i < len; i++) {
        for (let ch = 0; ch < nch; ch++) {
          const x = inp[ch];
          bufs0[ch][w] = x ? x[i] : 0;
        }

        // positions of both taps (shared by every channel)
        const e0 = d0 < 4 ? 4 : d0 > maxD ? maxD : d0;
        const e1 = d1 < 4 ? 4 : d1 > maxD ? maxD : d1;
        const f0 = w - e0;
        const f1 = w - e1;
        const j0 = Math.floor(f0);
        const j1 = Math.floor(f1);
        const t0 = f0 - j0;
        const t1 = f1 - j1;
        const a0 = (j0 - 1) & mask;
        const b0 = j0 & mask;
        const c0 = (j0 + 1) & mask;
        const g0 = (j0 + 2) & mask;
        const a1 = (j1 - 1) & mask;
        const b1 = j1 & mask;
        const c1 = (j1 + 1) & mask;
        const g1 = (j1 + 2) & mask;
        const wt0 = win[n0];
        const wt1 = win[n1];

        for (let ch = 0; ch < nch; ch++) {
          const b = bufs0[ch];
          out[ch][i] =
            wt0 * hermite(b[a0], b[b0], b[c0], b[g0], t0) +
            wt1 * hermite(b[a1], b[b1], b[c1], b[g1], t1);
        }

        d0 += dd;
        d1 += dd;
        n0++;
        n1++;
        w = (w + 1) & mask;

        if (n0 >= G) {
          n0 = 0;
          this.w = w;
          this.d[0] = d0;
          this.d[1] = d1;
          this._startGrain(0, r);
          d0 = this.d[0];
        } else if (n1 >= G) {
          n1 = 0;
          this.w = w;
          this.d[0] = d0;
          this.d[1] = d1;
          this._startGrain(1, r);
          d1 = this.d[1];
        }
      }

      this.w = w;
      this.n[0] = n0;
      this.n[1] = n1;
      this.d[0] = d0;
      this.d[1] = d1;
      return true;
    }
  }

  registerProcessor("pitch-shift-processor-medium", PitchShiftProcessor);
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

const nextPow2 = (v) => 2 ** Math.ceil(Math.log2(v));

/**
 * Medium-quality pitch shifter (granular + waveform alignment, AudioWorklet).
 * Synchronous: returns a usable node immediately; the shifter is attached as
 * soon as the worklet module has loaded (until then wet is silent).
 *
 * Channel count is automatic: every channel that arrives is shifted with the
 * same grain positions and comes out on the same channel index, nothing is
 * downmixed, so channel polarity is never summed away by the routing.
 *
 *   const node = PitchShift(ctx);
 *   node.transpose = 3;   // semitones; safe to set before it's ready
 *   await node.ready;     // optional
 */
function PitchShift(audioContext, options = {}) {
  const {
    grain = 0.032, // seconds. longer = smoother, more latency
    search = 0.006, // seconds, alignment search range (+/-)
    compare = 0.012, // seconds of audio compared when aligning
    maxSemitones = 12, // pitch range is +/- this many semitones
    maxChannels = 8, // buffers preallocated for this many channels
    ramp = 0.02, // seconds, smoothing for transpose changes
  } = options;

  const sr = audioContext.sampleRate;
  const maxRatio = Math.pow(2, maxSemitones / 12);
  const G = 2 * Math.round((grain * sr) / 2);
  const H = G / 2;
  const S = Math.max(3, Math.round(search * sr));
  const stride = 4;
  const M = Math.min(H, Math.round(compare * sr));
  const K = Math.max(8, Math.floor(M / stride));
  const reach = Math.ceil(maxRatio * K * stride); // how far back a compare reads

  // delay at the centre of each grain; large enough that the sweeping delay
  // can never reach the write head at the extreme pitch
  const latencySamples = Math.ceil((maxRatio - 1) * H + S + 8);
  const bufferSize = nextPow2(latencySamples + (maxRatio - 1) * H + S + reach + 32);
  const maxDelay = bufferSize - reach - 16;

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

  // Match the dry path to the shifter's latency
  const latency = latencySamples / sr;
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

  // Attach the shifter once the worklet module is loaded
  Object.defineProperty(node, "ready", {
    value: loadWorklet(audioContext).then(() => {
      const shifter = new AudioWorkletNode(
        audioContext,
        "pitch-shift-processor-medium",
        {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          channelCountMode: "max",
          channelInterpretation: "discrete",
          processorOptions: {
            grain: G,
            search: S,
            compareCount: K,
            compareStride: stride,
            latency: latencySamples,
            maxRatio,
            bufferSize,
            maxDelay,
            maxChannels,
          },
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
