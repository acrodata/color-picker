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

export interface Shape {
  color: string;
  title: string;
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv';

export interface ColorEvent {
  color: Color;
}
