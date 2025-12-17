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
      <div class="color-hue-slider-pointer" [style.left.%]="posX" [style.top.%]="posY">
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

  posX: number | null = null;
  posY: number | null = null;

  ngOnChanges(): void {
    if (this.direction === 'vertical') {
      this.posY = 100 - (this.hsl.h * 100) / 360;
    } else {
      this.posX = (this.hsl.h * 100) / 360;
    }
  }

  handleChange(e: CoordinatesChangeEvent) {
    const { top, left, containerHeight, containerWidth, $event } = e;

    const isVertical = this.direction === 'vertical';
    const pos = isVertical ? top : left;
    const size = isVertical ? containerHeight : containerWidth;

    const ratio = Math.max(0, Math.min(pos, size)) / size;
    let h = isVertical ? (1 - ratio) * 360 : ratio * 360;
    h = h >= 360 ? 359 : h;

    if (this.hsl.h !== h) {
      const data: HSLAsource = { ...this.hsl, h, source: 'rgb' };
      this.change.emit({ data, $event });
    }
  }
}
