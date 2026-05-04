// =========================
// UTILITIES
// =========================

function clamp(v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
}

// =========================
// HEX ↔ RGB
// =========================

function hexToRgb(hex) {
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map(x => x + x).join("");
    const num = parseInt(h, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function rgbToHex({ r, g, b }) {
    return "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0");
}

// =========================
// SRGB / LINEAR
// =========================

function srgbToLinear(v) {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v) {
    return v <= 0.0031308
        ? 12.92 * v * 255
        : (1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255;
}

// =========================
// RGB ↔ XYZ
// =========================

function rgbToXyz(c) {
    const r = srgbToLinear(c.r);
    const g = srgbToLinear(c.g);
    const b = srgbToLinear(c.b);

    return {
        x: r * 0.4124 + g * 0.3576 + b * 0.1805,
        y: r * 0.2126 + g * 0.7152 + b * 0.0722,
        z: r * 0.0193 + g * 0.1192 + b * 0.9505
    };
}

function xyzToRgb(v) {
    let r = 3.2406 * v.x - 1.5372 * v.y - 0.4986 * v.z;
    let g = -0.9689 * v.x + 1.8758 * v.y + 0.0415 * v.z;
    let b = 0.0557 * v.x - 0.2040 * v.y + 1.0570 * v.z;

    return {
        r: Math.round(clamp(linearToSrgb(r), 0, 255)),
        g: Math.round(clamp(linearToSrgb(g), 0, 255)),
        b: Math.round(clamp(linearToSrgb(b), 0, 255))
    };
}

// =========================
// LAB
// =========================

function labF(t) {
    return t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
}

function labInv(t) {
    const t3 = t * t * t;
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
}

function xyzToLab(v) {
    const x = labF(v.x / 0.95047);
    const y = labF(v.y / 1.00000);
    const z = labF(v.z / 1.08883);

    return {
        L: 116 * y - 16,
        a: 500 * (x - y),
        b: 200 * (y - z)
    };
}

function labToXyz(l) {
    const fy = (l.L + 16) / 116;
    const fx = fy + l.a / 500;
    const fz = fy - l.b / 200;

    return {
        x: labInv(fx) * 0.95047,
        y: labInv(fy),
        z: labInv(fz) * 1.08883
    };
}

// =========================
// HCT (LAB-based)
// =========================

function rgbToHct(c) {
    const lab = xyzToLab(rgbToXyz(c));
    let h = Math.atan2(lab.b, lab.a) * 180 / Math.PI;
    if (h < 0) h += 360;

    const ch = Math.sqrt(lab.a * lab.a + lab.b * lab.b);

    return { h, c: ch, t: lab.L };
}

function hctToRgb(hct) {
    const a = Math.cos(hct.h * Math.PI / 180) * hct.c;
    const b = Math.sin(hct.h * Math.PI / 180) * hct.c;

    return xyzToRgb(labToXyz({ L: hct.t, a, b }));
}

function deriveHct(base, hueOffset, chromaScale) {
    return {
        h: (base.h + hueOffset + 360) % 360,
        c: base.c * chromaScale,
        t: base.t
    };
}

// =========================
// PALETTES
// =========================

function generateTonalPaletteHCT(baseRgb) {
    const palette = [];
    const hct = rgbToHct(baseRgb);

    for (let i = 0; i < 30; i++) {
        const step = { ...hct, t: (i / 29) * 100 };
        palette.push(rgbToHex(hctToRgb(step)));
    }

    return palette;
}

function generateColorWheel(hex) {
    const wheel = [];
    const base = rgbToHct(hexToRgb(hex));

    for (let i = 0; i < 12; i++) {
        const hue = (base.h + i * 30) % 360;
        wheel.push(rgbToHex(hctToRgb({
            h: hue,
            c: base.c,
            t: base.t
        })));
    }

    return wheel;
}

// =========================
// CONSOLE COLOR LOGGING
// =========================

function logColorRow(hexArray) {
    let format = "";
    let styles = [];

    hexArray.forEach(hex => {
        const { r, g, b } = hexToRgb(hex);
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = yiq >= 128 ? "#000" : "#fff";

        format += `%c ${hex} `;
        styles.push(`background:${hex}; color:${textColor}; padding:2px 6px; border-radius:4px;`);
    });

    console.log(format, ...styles);
}

function printTonalPalette(label, palette) {
    console.log(`\n${label} Tonal Palette:`);

    for (let row = 0; row < 5; row++) {
        logColorRow(palette.slice(row * 6, row * 6 + 6));
    }
}

function printColorWheel(wheel) {
    console.log("\n12-step Color Wheel:");

    for (let row = 0; row < 2; row++) {
        logColorRow(wheel.slice(row * 6, row * 6 + 6));
    }
}

// =========================
// MAIN FUNCTION
// =========================

function getTextColor({ r, g, b }) {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6
        ? { r: 0, g: 0, b: 0 }
        : { r: 255, g: 255, b: 255 };
}

function logColor(label, hex) {
    const bg = hexToRgb(hex); // ✅ reuse existing
    const fg = getTextColor(bg);

    const bgCode = `\x1b[48;2;${bg.r};${bg.g};${bg.b}m`;
    const fgCode = `\x1b[38;2;${fg.r};${fg.g};${fg.b}m`;
    const reset = "\x1b[0m";

    console.log(
        `${bgCode}${fgCode}  ${label.padEnd(10)} ${hex}  ${reset}`
    );
}

function generateColor(hex, arrayFormat = false) {
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) {
        throw new Error("Invalid hex color");
    }

    const baseRgb = hexToRgb(hex);
    const base = rgbToHct(baseRgb);

    const primary = base;
    const secondary = deriveHct(base, 0, 0.6);
    const tertiary = deriveHct(base, 60, 0.5);
    const neutral1 = { h: base.h, c: 6, t: 90 };
    const neutral2 = { h: base.h, c: 8, t: 70 };
    const bg = { h: base.h, c: 4, t: 95 };

    const result = {
        primary: rgbToHex(hctToRgb(primary)),
        secondary: rgbToHex(hctToRgb(secondary)),
        tertiary: rgbToHex(hctToRgb(tertiary)),
        neutral1: rgbToHex(hctToRgb(neutral1)),
        neutral2: rgbToHex(hctToRgb(neutral2)),
        background: rgbToHex(hctToRgb(bg)),

        primaryTonal: generateTonalPaletteHCT(hctToRgb(primary)),
        secondaryTonal: generateTonalPaletteHCT(hctToRgb(secondary)),
        tertiaryTonal: generateTonalPaletteHCT(hctToRgb(tertiary)),
        neutral1Tonal: generateTonalPaletteHCT(hctToRgb(neutral1)),
        neutral2Tonal: generateTonalPaletteHCT(hctToRgb(neutral2)),
        backgroundTonal: generateTonalPaletteHCT(hctToRgb(bg)),

        colorWheel: generateColorWheel(hex)
    };

    if (!arrayFormat) {
        // ===== OUTPUT =====
        console.log("\n=== Material 3 Colors ===\n");

        // Base colors
        logColor("PRIMARY", result.primary);
        logColor("SECONDARY", result.secondary);
        logColor("TERTIARY", result.tertiary);
        logColor("NEUTRAL1", result.neutral1);
        logColor("NEUTRAL2", result.neutral2);
        logColor("BACKGROUND", result.background);

        // ===== TONAL PALETTES =====
        function logTonalPalette(label, palette) {
            console.log(`\n${label} Tonal Palette:`);
            palette.forEach((hex, i) => {
                logColor(`${label}_${i.toString().padStart(2, "0")}`, hex);
            });
        }

        logTonalPalette("PRIMARY", result.primaryTonal);
        logTonalPalette("SECONDARY", result.secondaryTonal);
        logTonalPalette("TERTIARY", result.tertiaryTonal);
        logTonalPalette("NEUTRAL1", result.neutral1Tonal);
        logTonalPalette("NEUTRAL2", result.neutral2Tonal);
        logTonalPalette("BACKGROUND", result.backgroundTonal);

        // ===== COLOR WHEEL =====
        console.log("\nCOLOR WHEEL:");
        result.colorWheel.forEach((hex, i) => {
            logColor(`HUE_${(i * 30).toString().padStart(3, "0")}`, hex);
        });
    }

    if (arrayFormat) {
        return result;
    }
}
// ===== MAIN GENERATOR =====

module.exports = { generateColor };