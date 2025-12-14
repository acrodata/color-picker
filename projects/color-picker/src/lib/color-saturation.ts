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
import { HSLA, HSVA, HSVAsource } from './interfaces';

@Component({
  selector: 'color-saturation',
  imports: [ColorCoordinates],
  template: `
    <div
      class="color-saturation-area"
      colorCoordinates
      (coordinatesChange)="handleChange($event)"
      [style.background]="background"
    >
      <div class="color-saturation-white">
        <div class="color-saturation-black"></div>
        <div
          class="color-saturation-area-pointer"
          [style.top]="pointerTop"
          [style.left]="pointerLeft"
        >
          <div class="color-saturation-area-thumb"></div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './color-saturation.scss',
  host: {
    class: 'color-saturation',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorSaturation implements OnChanges {
  @Input() hsl!: HSLA;
  @Input() hsv!: HSVA;
  @Input() radius!: number;
  @Output() change = new EventEmitter<{ data: HSVAsource; $event: PointerEvent }>();

  background = '';
  pointerTop = '';
  pointerLeft = '';

  ngOnChanges() {
    this.background = `hsl(${this.hsl.h}, 100%, 50%)`;
    this.pointerTop = -(this.hsv.v * 100) + 100 + '%';
    this.pointerLeft = this.hsv.s * 100 + '%';
  }

  handleChange(e: CoordinatesChangeEvent) {
    const { containerHeight, containerWidth, $event } = e;
    let { top, left } = e;
    if (left < 0) {
      left = 0;
    } else if (left > containerWidth) {
      left = containerWidth;
    } else if (top < 0) {
      top = 0;
    } else if (top > containerHeight) {
      top = containerHeight;
    }

    const saturation = left / containerWidth;
    let bright = -(top / containerHeight) + 1;
    bright = bright > 0 ? bright : 0;
    bright = bright > 1 ? 1 : bright;

    const data: HSVAsource = {
      h: this.hsl.h,
      s: saturation,
      v: bright,
      a: this.hsl.a,
      source: 'hsva',
    };

    this.change.emit({ data, $event });
  }
}
