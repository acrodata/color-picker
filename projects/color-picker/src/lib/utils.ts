import { TinyColor } from '@ctrl/tinycolor';
import { Color, HSLA, HSVA } from './interfaces';

export function simpleCheckForValidColor(data: any) {
  const keysToCheck = ['r', 'g', 'b', 'a', 'h', 's', 'l', 'v'];
  let checked = 0;
  let passed = 0;
  keysToCheck.forEach(letter => {
    if (!data[letter]) {
      return;
    }
    checked += 1;
    if (!isNaN(data[letter])) {
      passed += 1;
    }
    if (letter === 's' || letter === 'l') {
      const percentPatt = /^\d+%$/;
      if (percentPatt.test(data[letter])) {
        passed += 1;
      }
    }
  });
  return checked === passed ? data : false;
}

export function toState(data: any, oldHue = 0, disableAlpha = false): Color {
  const color = data.hex ? new TinyColor(data.hex) : new TinyColor(data);
  if (disableAlpha) {
    color.setAlpha(1);
  }

  const rgb = color.toRgb();

  let hsl: HSLA;
  let hsv: HSVA;
  if (data.s != null && data.l != null) {
    hsl = {
      h: data.h ?? oldHue,
      s: data.s,
      l: data.l,
      a: data.a ?? 1,
    };
    hsv = hslToHsv(hsl.h, hsl.s, hsl.l, hsl.a);
  } else if (data.s != null && data.v != null) {
    hsv = {
      h: data.h ?? oldHue,
      s: data.s,
      v: data.v,
      a: data.a ?? 1,
    };
    hsl = hsvToHsl(hsv.h, hsv.s, hsv.v, hsv.a);
  } else {
    hsl = color.toHsl();
    hsv = color.toHsv();
  }
  if (hsl.s === 0) {
    hsl.h = oldHue;
    hsv.h = oldHue;
  }

  return {
    hsl,
    hslString: toHslString(hsl),
    hsv,
    hsvString: toHsvString(hsv),
    rgb,
    rgbString: color.toRgbString(),
    hex: rgb.a === 1 ? color.toHexString() : color.toHex8String(),
    oldHue: data.h ?? oldHue ?? hsl.h,
    source: data.source,
  };
}

export function hslToHsv(h: number, s: number, l: number, a: number) {
  const v = l + s * Math.min(l, 1 - l);
  const sv = v === 0 ? 0 : 2 * (1 - l / v);
  return { h, s: sv, v, a };
}

export function hsvToHsl(h: number, s: number, v: number, a: number) {
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h, s: sl, l, a };
}

export function toHslString(hsl: HSLA) {
  const h = Math.round(hsl.h);
  const s = Math.round(hsl.s * 100);
  const l = Math.round(hsl.l * 100);
  return hsl.a === 1 ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${hsl.a})`;
}

export function toHsvString(hsv: HSVA) {
  const h = Math.round(hsv.h);
  const s = Math.round(hsv.s * 100);
  const v = Math.round(hsv.v * 100);
  return hsv.a === 1 ? `hsv(${h}, ${s}%, ${v}%)` : `hsva(${h}, ${s}%, ${v}%, ${hsv.a})`;
}

export function isValidHex(hex: string) {
  return new TinyColor(hex).isValid;
}
