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
import { Color, HSLA, HSLAsource, RGBA } from './interfaces';

@Component({
  selector: 'color-alpha-slider',
  imports: [ColorCoordinates],
  template: `
    <div
      class="color-alpha-slider-track"
      [style.background-image]="gradient"
      colorCoordinates
      [percentX]="posX"
      [percentY]="posY"
      (coordinatesChange)="handleChange($event)"
    >
      <div class="color-alpha-slider-pointer" [style.left.%]="posX" [style.top.%]="posY">
        <button class="color-alpha-slider-thumb" type="button">
          <!--  -->
        </button>
      </div>
    </div>
  `,
  styleUrl: './color-alpha-slider.scss',
  host: {
    'class': 'color-alpha-slider',
    '[class.color-alpha-vertical]': 'direction === "vertical"',
    '[class.color-alpha-horizontal]': 'direction === "horizontal"',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorAlphaSlider implements OnChanges {
  @Input() color!: Color;

  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';

  @Output() change = new EventEmitter<{ data: HSLAsource }>();

  hsl!: HSLA;
  rgb!: RGBA;

  gradient = '';

  posX?: number | null;
  posY?: number | null;

  ngOnChanges() {
    this.hsl = this.color.hsl;
    this.rgb = this.color.rgb;

    const { r, g, b, a } = this.rgb;
    if (this.direction === 'vertical') {
      this.gradient = `linear-gradient(to top, rgba(${r},${g},${b}, 0) 0%, rgba(${r},${g},${b}, 1) 100%)`;
      this.posX = null;
      this.posY = (1 - a) * 100;
    } else {
      this.gradient = `linear-gradient(to right, rgba(${r},${g},${b}, 0) 0%, rgba(${r},${g},${b}, 1) 100%)`;
      this.posY = null;
      this.posX = a * 100;
    }
  }

  handleChange(e: CoordinatesChangeEvent) {
    const { top, left, containerHeight, containerWidth } = e;

    const isVertical = this.direction === 'vertical';
    const pos = isVertical ? top : left;
    const size = isVertical ? containerHeight : containerWidth;

    const ratio = Math.max(0, Math.min(pos, size)) / size;
    const alpha = isVertical ? 1 - ratio : ratio;
    const a = Math.round(alpha * 100) / 100;

    if (this.hsl.a !== a) {
      const data: HSLAsource = { ...this.hsl, a, source: 'rgb' };
      this.change.emit({ data });
    }
  }
}
