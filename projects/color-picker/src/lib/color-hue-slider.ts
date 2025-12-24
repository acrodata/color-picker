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
import { Color, HSLA, HSLAsource } from './interfaces';

@Component({
  selector: 'color-hue-slider',
  imports: [ColorCoordinates],
  template: `
    <div
      class="color-hue-slider-track"
      colorCoordinates
      [percentX]="posX"
      [percentY]="posY"
      (coordinatesChange)="handleChange($event)"
    >
      <div class="color-hue-slider-pointer" [style.left.%]="posX" [style.top.%]="posY">
        <button class="color-hue-slider-thumb" type="button">
          <!--  -->
        </button>
      </div>
    </div>
  `,
  styleUrl: './color-hue-slider.scss',
  host: {
    'class': 'color-hue-slider',
    '[class.color-hue-vertical]': 'direction === "vertical"',
    '[class.color-hue-horizontal]': 'direction === "horizontal"',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorHueSlider implements OnChanges {
  @Input() color!: Color;

  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';

  @Output() change = new EventEmitter<{ data: HSLAsource }>();

  hsl!: HSLA;

  posX?: number | null;
  posY?: number | null;

  ngOnChanges(): void {
    this.hsl = this.color.hsl;

    if (this.direction === 'vertical') {
      this.posX = null;
      this.posY = 100 - (this.hsl.h * 100) / 360;
    } else {
      this.posY = null;
      this.posX = (this.hsl.h * 100) / 360;
    }
  }

  handleChange(e: CoordinatesChangeEvent) {
    const { top, left, containerHeight, containerWidth } = e;

    const isVertical = this.direction === 'vertical';
    const pos = isVertical ? top : left;
    const size = isVertical ? containerHeight : containerWidth;

    const ratio = Math.max(0, Math.min(pos, size)) / size;
    const hue = isVertical ? (1 - ratio) * 360 : ratio * 360;
    const h = hue >= 360 ? 359 : hue;

    if (this.hsl.h !== h) {
      const data: HSLAsource = { ...this.hsl, h, source: 'rgb' };
      this.change.emit({ data });
    }
  }
}
