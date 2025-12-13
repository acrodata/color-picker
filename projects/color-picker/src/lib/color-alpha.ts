import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ColorCoordinates } from './color-coordinates';
import { HSLA, RGBA } from './interfaces';

@Component({
  selector: 'color-alpha',
  imports: [ColorCoordinates],
  template: `
    <div
      colorCoordinates
      (coordinatesChange)="handleChange($event)"
      class="color-alpha-slider-track color-alpha-{{ direction }}"
    >
      <div class="color-alpha-gradient" [style.background]="gradient"></div>

      <div
        class="color-alpha-slider-pointer"
        [style.left.%]="pointerLeft"
        [style.top.%]="pointerTop"
      >
        <div class="color-alpha-slider-thumb"></div>
      </div>
    </div>
  `,
  styleUrl: './color-alpha.scss',
  host: {
    class: 'color-alpha',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorAlpha implements OnChanges {
  @Input() hsl!: HSLA;
  @Input() rgb!: RGBA;
  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';
  @Output() change = new EventEmitter<any>();

  gradient = '';
  pointerLeft!: number;
  pointerTop!: number;

  ngOnChanges() {
    if (this.direction === 'vertical') {
      this.pointerLeft = 0;
      this.pointerTop = this.rgb.a * 100;
      this.gradient = `linear-gradient(to bottom, rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b}, 0) 0%,
          rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b}, 1) 100%)`;
    } else {
      this.gradient = `linear-gradient(to right, rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b}, 0) 0%,
          rgba(${this.rgb.r},${this.rgb.g},${this.rgb.b}, 1) 100%)`;
      this.pointerLeft = this.rgb.a * 100;
    }
  }

  handleChange(e: any): void {
    const { top, left, containerHeight, containerWidth, $event } = e;
    let data: any;
    if (this.direction === 'vertical') {
      let a: number;
      if (top < 0) {
        a = 0;
      } else if (top > containerHeight) {
        a = 1;
      } else {
        a = Math.round((top * 100) / containerHeight) / 100;
      }

      if (this.hsl.a !== a) {
        data = {
          h: this.hsl.h,
          s: this.hsl.s,
          l: this.hsl.l,
          a,
          source: 'rgb',
        };
      }
    } else {
      let a: number;
      if (left < 0) {
        a = 0;
      } else if (left > containerWidth) {
        a = 1;
      } else {
        a = Math.round((left * 100) / containerWidth) / 100;
      }

      if (this.hsl.a !== a) {
        data = {
          h: this.hsl.h,
          s: this.hsl.s,
          l: this.hsl.l,
          a,
          source: 'rgb',
        };
      }
    }

    if (!data) {
      return;
    }

    this.change.emit({ data, $event });
  }
}
