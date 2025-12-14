import { TinyColor } from '@ctrl/tinycolor';
import { Color } from './interfaces';

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

export function toState(data: any, oldHue?: number, disableAlpha?: boolean): Color {
  const color = data.hex ? new TinyColor(data.hex) : new TinyColor(data);
  if (disableAlpha) {
    color.setAlpha(1);
  }

  const hsl = color.toHsl();
  const hsv = color.toHsv();
  const rgb = color.toRgb();
  if (hsl.s === 0) {
    hsl.h = oldHue || 0;
    hsv.h = oldHue || 0;
  }

  return {
    hsl,
    hex: rgb.a === 1 ? color.toHexString() : color.toHex8String(),
    rgb,
    hsv,
    oldHue: data.h || oldHue || hsl.h,
    source: data.source,
  };
}

export function isValidHex(hex: string) {
  return new TinyColor(hex).isValid;
}

export function getContrastingColor(data: any) {
  if (!data) {
    return '#fff';
  }
  const col = toState(data);
  if (col.hex === 'transparent') {
    return 'rgba(0,0,0,0.4)';
  }
  const yiq = (col.rgb.r * 299 + col.rgb.g * 587 + col.rgb.b * 114) / 1000;
  return yiq >= 128 ? '#000' : '#fff';
}
