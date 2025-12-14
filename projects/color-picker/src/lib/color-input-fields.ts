import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { TinyColor } from '@ctrl/tinycolor';
import { ColorInputField } from './color-input-field';
import { HEXsource, HSLA, HSLAsource, HSLsource, RGBA, RGBsource } from './interfaces';
import { isValidHex } from './utils';

@Component({
  selector: 'color-input-fields',
  imports: [ColorInputField],
  template: `
    <div class="color-input-field-wrapper">
      @if (format === 'hex') {
        <color-input-field label="hex" [value]="hex" (valueChange)="handleChange($event)" />
      }
      @if (format === 'rgb') {
        <color-input-field label="r" [value]="rgb.r" (valueChange)="handleChange($event)" />
        <color-input-field label="g" [value]="rgb.g" (valueChange)="handleChange($event)" />
        <color-input-field label="b" [value]="rgb.b" (valueChange)="handleChange($event)" />

        @if (!disableAlpha) {
          <color-input-field
            label="a"
            [value]="rgb.a"
            [arrowOffset]="0.01"
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

        @if (!disableAlpha) {
          <color-input-field
            label="a"
            [value]="hsl.a"
            [arrowOffset]="0.01"
            (valueChange)="handleChange($event)"
          />
        }
      }
    </div>

    <button class="color-format-toggle" (click)="toggleColorFormat()">
      <svg viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z"
        />
      </svg>
    </button>
  `,
  host: {
    class: 'color-input-fields',
  },
  styleUrl: './color-input-fields.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorInputFields implements OnInit {
  @Input() disableAlpha = false;
  @Input() hsl!: HSLA;
  @Input() rgb!: RGBA;
  @Input() hex = '';
  @Output() valueChange = new EventEmitter<{
    data: HEXsource | RGBsource | HSLAsource | HSLsource;
    $event: KeyboardEvent | PointerEvent;
  }>();

  format = '';

  ngOnInit() {
    if (this.hsl.a === 1 && this.format !== 'hex') {
      this.format = 'hex';
    } else if (this.format !== 'rgb' && this.format !== 'hsl') {
      this.format = 'rgb';
    }
  }

  toggleColorFormat() {
    if (this.format === 'hex') {
      this.format = 'rgb';
    } else if (this.format === 'rgb') {
      this.format = 'hsl';
    } else if (this.format === 'hsl') {
      this.format = 'hex';
    }
  }

  round(value: number) {
    return Math.round(value);
  }

  handleChange(e: { data: any; $event: KeyboardEvent | PointerEvent }) {
    const { data, $event } = e;
    if (data.hex) {
      if (isValidHex(data.hex)) {
        const color = new TinyColor(data.hex);
        this.valueChange.emit({
          data: {
            hex: this.disableAlpha ? color.toHex() : color.toHex8(),
            source: 'hex',
          },
          $event,
        });
      }
    } else if (data.r || data.g || data.b) {
      this.valueChange.emit({
        data: {
          r: data.r || this.rgb.r,
          g: data.g || this.rgb.g,
          b: data.b || this.rgb.b,
          source: 'rgb',
        },
        $event,
      });
    } else if (data.a) {
      if (data.a < 0) {
        data.a = 0;
      } else if (data.a > 1) {
        data.a = 1;
      }

      if (this.disableAlpha) {
        data.a = 1;
      }

      this.valueChange.emit({
        data: {
          h: this.hsl.h,
          s: this.hsl.s,
          l: this.hsl.l,
          a: Math.round(data.a * 100) / 100,
          source: 'rgb',
        },
        $event,
      });
    } else if (data.h || data.s || data.l) {
      const s = typeof data.s === 'string' ? data.s.replace('%', '') : data.s;
      const l = typeof data.l === 'string' ? data.l.replace('%', '') : data.l;
      this.valueChange.emit({
        data: {
          h: data.h || this.hsl.h,
          s: Number(s || this.hsl.s),
          l: Number(l || this.hsl.l),
          source: 'hsl',
        },
        $event,
      });
    }
  }
}
