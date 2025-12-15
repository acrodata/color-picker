import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ColorCoordinates, CoordinatesChangeEvent } from './color-coordinates';
import { HSLA, HSLAsource } from './interfaces';

@Component({
  selector: 'color-hue-slider',
  imports: [ColorCoordinates],
  template: `
    <div
      colorCoordinates
      (coordinatesChange)="handleChange($event)"
      class="color-hue-slider-track color-hue-{{ direction }}"
    >
      <div class="color-hue-slider-pointer" [style.left.%]="pointerLeft" [style.top.%]="pointerTop">
        <div class="color-hue-slider-thumb"></div>
      </div>
    </div>
  `,
  styleUrl: './color-hue-slider.scss',
  host: {
    class: 'color-hue-slider',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorHueSlider implements OnChanges {
  @Input() hsl!: HSLA;

  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';

  @Output() change = new EventEmitter<{ data: HSLAsource; $event: PointerEvent }>();

  pointerLeft: number | null = null;
  pointerTop: number | null = null;

  ngOnChanges(): void {
    if (this.direction === 'horizontal') {
      this.pointerLeft = (this.hsl.h * 100) / 360;
    } else {
      this.pointerTop = -((this.hsl.h * 100) / 360) + 100;
    }
  }

  handleChange(e: CoordinatesChangeEvent): void {
    const { top, left, containerHeight, containerWidth, $event } = e;
    let data: HSLAsource | undefined;
    if (this.direction === 'vertical') {
      let h: number;
      if (top < 0) {
        h = 359;
      } else if (top > containerHeight) {
        h = 0;
      } else {
        const percent = -((top * 100) / containerHeight) + 100;
        h = (360 * percent) / 100;
      }

      if (this.hsl.h !== h) {
        data = {
          h,
          s: this.hsl.s,
          l: this.hsl.l,
          a: this.hsl.a,
          source: 'rgb',
        };
      }
    } else {
      let h: number;
      if (left < 0) {
        h = 0;
      } else if (left > containerWidth) {
        h = 359;
      } else {
        const percent = (left * 100) / containerWidth;
        h = (360 * percent) / 100;
      }

      if (this.hsl.h !== h) {
        data = {
          h,
          s: this.hsl.s,
          l: this.hsl.l,
          a: this.hsl.a,
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
