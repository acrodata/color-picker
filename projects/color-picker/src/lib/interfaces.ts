export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSLA extends HSL {
  a: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface HSVA extends HSV {
  a: number;
}

export interface HSVAsource extends HSVA {
  source: string;
}

export interface HSLAsource extends HSLA {
  source: string;
}

export interface RGBAsource extends RGBA {
  source: string;
}

export interface HEXsource {
  hex: string;
  source: string;
}

export type ColorSource = HSVAsource | HSLAsource | RGBAsource | HEXsource;

export interface Color {
  hsl: HSLA;
  hslString: string;
  hsv: HSVA;
  hsvString: string;
  rgb: RGBA;
  rgbString: string;
  hex: string;
  oldHue: number;
  source: string;
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv';

export interface ColorChange {
  value: string;
  color: Color;
}

export interface ColorFields {
  hex: string;
  r: number;
  g: number;
  b: number;
  a: number;
  h: number;
  s: number | string;
  l: number | string;
}

export type ColorFieldValue = Partial<ColorFields> | number | string;
