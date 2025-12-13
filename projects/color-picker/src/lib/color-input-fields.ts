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
import { isValidHex } from './utils';
import { HSLA, RGBA } from './interfaces';

@Component({
  selector: 'color-input-fields',
  imports: [ColorInputField],
  template: `
    <div class="color-input-field-wrapper">
      @if (format === 'hex') {
        <color-input-field label="hex" [value]="hex" (change)="handleChange($event)" />
      }
      @if (format === 'rgb') {
        <color-input-field label="r" [value]="rgb.r" (change)="handleChange($event)" />
        <color-input-field label="g" [value]="rgb.g" (change)="handleChange($event)" />
        <color-input-field label="b" [value]="rgb.b" (change)="handleChange($event)" />

        @if (!disableAlpha) {
          <color-input-field
            label="a"
            [value]="rgb.a"
            [arrowOffset]="0.01"
            (change)="handleChange($event)"
          />
        }
      }
      @if (format === 'hsl') {
        <color-input-field label="h" [value]="round(hsl.h)" (change)="handleChange($event)" />
        <color-input-field
          label="s"
          [value]="round(hsl.s * 100) + '%'"
          (change)="handleChange($event)"
        />
        <color-input-field
          label="l"
          [value]="round(hsl.l * 100) + '%'"
          (change)="handleChange($event)"
        />

        @if (!disableAlpha) {
          <color-input-field
            label="a"
            [value]="hsl.a"
            [arrowOffset]="0.01"
            (change)="handleChange($event)"
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
  @Output() change = new EventEmitter<any>();

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
      if (this.hsl.a === 1) {
        this.format = 'hex';
      } else {
        this.format = 'rgb';
      }
    }
  }

  round(value: number) {
    return Math.round(value);
  }

  handleChange(e: any) {
    const { data, $event } = e;
    if (data.hex) {
      if (isValidHex(data.hex)) {
        const color = new TinyColor(data.hex);
        this.change.emit({
          data: {
            hex: this.disableAlpha ? color.toHex() : color.toHex8(),
            source: 'hex',
          },
          $event,
        });
      }
    } else if (data.r || data.g || data.b) {
      this.change.emit({
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

      this.change.emit({
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
      const s = data.s && data.s.replace('%', '');
      const l = data.l && data.l.replace('%', '');
      this.change.emit({
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
