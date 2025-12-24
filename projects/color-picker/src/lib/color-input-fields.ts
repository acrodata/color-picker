import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { TinyColor } from '@ctrl/tinycolor';
import { ColorIconButton } from './color-icon-button';
import { ColorInputField } from './color-input-field';
import { Color, ColorFieldValue, ColorFormat, ColorSource, HSLA, RGBA } from './interfaces';
import { isValidHex } from './utils';

@Component({
  selector: 'color-input-fields',
  imports: [ColorInputField, ColorIconButton],
  template: `
    <div class="color-input-field-wrapper">
      @if (format === 'hex') {
        <color-input-field label="hex" [value]="hex" (valueChange)="handleChange($event)" />
      }
      @if (format === 'rgb') {
        <color-input-field label="r" [value]="rgb.r" (valueChange)="handleChange($event)" />
        <color-input-field label="g" [value]="rgb.g" (valueChange)="handleChange($event)" />
        <color-input-field label="b" [value]="rgb.b" (valueChange)="handleChange($event)" />

        @if (!hideAlpha) {
          <color-input-field
            label="a"
            step="0.01"
            [value]="rgb.a"
            (valueChange)="handleChange($event)"
          />
        }
      }
      @if (format === 'hsl') {
        <color-input-field label="h" [value]="round(hsl.h)" (valueChange)="handleChange($event)" />
        <color-input-field
          label="s"
          [value]="round(hsl.s * 100) + '%'"
          (valueChange)="handleChange($event)"
        />
        <color-input-field
          label="l"
          [value]="round(hsl.l * 100) + '%'"
          (valueChange)="handleChange($event)"
        />

        @if (!hideAlpha) {
          <color-input-field
            label="a"
            step="0.01"
            [value]="hsl.a"
            (valueChange)="handleChange($event)"
          />
        }
      }
    </div>

    <color-icon-button>
      <button type="button" (click)="toggleColorFormat()">
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z"
          />
        </svg>
      </button>
    </color-icon-button>
  `,
  host: {
    class: 'color-input-fields',
  },
  styleUrl: './color-input-fields.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorInputFields implements OnChanges {
  @Input() color!: Color;

  @Input() format?: ColorFormat = 'hex';

  @Output() formatChange = new EventEmitter<ColorFormat>();

  @Input({ transform: booleanAttribute }) hideAlpha = false;

  @Output() valueChange = new EventEmitter<ColorSource>();

  hsl!: HSLA;
  rgb!: RGBA;
  hex = '';

  ngOnChanges(): void {
    this.hsl = this.color.hsl;
    this.rgb = this.color.rgb;
    this.hex = this.color.hex;

    if (!this.format) {
      this.format = 'hex';
    } else if (this.format === 'hsv') {
      this.format = 'hsl';
    }
  }

  round(value: number) {
    return Math.round(value);
  }

  toggleColorFormat() {
    let format: ColorFormat | undefined;
    let fieldVal: ColorFieldValue = {};
    if (this.format === 'hex') {
      format = 'rgb';
      fieldVal = { ...this.rgb };
    } else if (this.format === 'rgb') {
      format = 'hsl';
      fieldVal = { ...this.hsl, s: this.hsl.s * 100, l: this.hsl.l * 100 };
    } else if (this.format === 'hsl') {
      format = 'hex';
      fieldVal = { hex: this.hex };
    }
    this.format = format;
    this.formatChange.emit(format);
    this.handleChange(fieldVal);
  }

  handleChange(e: ColorFieldValue) {
    if (typeof e === 'string' || typeof e === 'number') {
      return;
    }
    if (e.hex) {
      if (isValidHex(e.hex)) {
        const color = new TinyColor(e.hex);
        this.valueChange.emit({
          hex: this.hideAlpha ? color.toHex() : color.toHex8(),
          source: 'hex',
        });
      }
    } else if (e.r || e.g || e.b) {
      this.valueChange.emit({
        r: e.r || this.rgb.r,
        g: e.g || this.rgb.g,
        b: e.b || this.rgb.b,
        a: Math.round((e.a || this.rgb.a) * 100) / 100,
        source: 'rgb',
      });
    } else if (e.h || e.s || e.l) {
      const s = (typeof e.s === 'string' ? Number(e.s.replace('%', '')) : e.s || 0) / 100;
      const l = (typeof e.l === 'string' ? Number(e.l.replace('%', '')) : e.l || 0) / 100;
      this.valueChange.emit({
        h: e.h || this.hsl.h,
        s: s || this.hsl.s,
        l: l || this.hsl.l,
        a: Math.round((e.a || this.hsl.a) * 100) / 100,
        source: 'hsl',
      });
    } else if (e.a) {
      let a = Math.max(0, Math.min(1, e.a));
      if (this.hideAlpha) {
        a = 1;
      }

      this.valueChange.emit({
        h: this.hsl.h,
        s: this.hsl.s,
        l: this.hsl.l,
        a: Math.round(a * 100) / 100,
        source: 'rgb',
      });
    }
  }
}
