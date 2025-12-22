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
import { Color, ColorFormat, HSLA, RGBA } from './interfaces';
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

  @Output() valueChange = new EventEmitter<{
    data: Record<string, any>;
  }>();

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
    let data = {};
    if (this.format === 'hex') {
      format = 'rgb';
      data = { ...this.rgb, source: 'rgb' };
    } else if (this.format === 'rgb') {
      format = 'hsl';
      data = { ...this.hsl, s: this.hsl.s * 100, l: this.hsl.l * 100, source: 'hsl' };
    } else if (this.format === 'hsl') {
      format = 'hex';
      data = { hex: this.hex, source: 'hex' };
    }
    this.format = format;
    this.formatChange.emit(format);
    this.handleChange({ data });
  }

  handleChange(e: { data: any }) {
    const { data } = e;
    if (data.hex) {
      if (isValidHex(data.hex)) {
        const color = new TinyColor(data.hex);
        this.valueChange.emit({
          data: {
            hex: this.hideAlpha ? color.toHex() : color.toHex8(),
            source: 'hex',
          },
        });
      }
    } else if (data.r || data.g || data.b) {
      this.valueChange.emit({
        data: {
          r: data.r || this.rgb.r,
          g: data.g || this.rgb.g,
          b: data.b || this.rgb.b,
          a: Math.round((data.a || this.rgb.a) * 100) / 100,
          source: 'rgb',
        },
      });
    } else if (data.h || data.s || data.l) {
      const s = (typeof data.s === 'string' ? Number(data.s.replace('%', '')) : data.s) / 100;
      const l = (typeof data.l === 'string' ? Number(data.l.replace('%', '')) : data.l) / 100;
      this.valueChange.emit({
        data: {
          h: data.h || this.hsl.h,
          s: s || this.hsl.s,
          l: l || this.hsl.l,
          a: Math.round((data.a || this.hsl.a) * 100) / 100,
          source: 'hsl',
        },
      });
    } else if (data.a) {
      let a = Math.max(0, Math.min(1, data.a));
      if (this.hideAlpha) {
        a = 1;
      }

      this.valueChange.emit({
        data: {
          h: this.hsl.h,
          s: this.hsl.s,
          l: this.hsl.l,
          a: Math.round(a * 100) / 100,
          source: 'rgb',
        },
      });
    }
  }
}
