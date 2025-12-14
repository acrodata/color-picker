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

export interface HEXsource {
  hex: string;
  source: string;
}

export interface RGBsource extends RGB {
  source: string;
}

export interface HSVAsource extends HSVA {
  source: string;
}

export interface HSLsource extends HSL {
  source: string;
}

export interface HSLAsource extends HSLA {
  source: string;
}

export interface Color {
  hex: string;
  rgb: RGBA;
  hsl: HSLA;
  hsv: HSVA;
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
  $event: Event;
}
