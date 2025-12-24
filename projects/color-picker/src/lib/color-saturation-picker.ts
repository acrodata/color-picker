import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ColorCoordinates, CoordinatesChangeEvent } from './color-coordinates';
import { Color, HSLA, HSVA, HSVAsource } from './interfaces';

@Component({
  selector: 'color-saturation-picker',
  imports: [ColorCoordinates],
  template: `
    <div
      class="color-saturation-picker-content"
      colorCoordinates
      [percentX]="posX"
      [percentY]="posY"
      (coordinatesChange)="handleChange($event)"
      [style.background-color]="bgColor"
    >
      <div class="color-saturation-picker-pointer" [style.left.%]="posX" [style.top.%]="posY">
        <button class="color-saturation-picker-thumb" type="button">
          <!--  -->
        </button>
      </div>
    </div>
  `,
  styleUrl: './color-saturation-picker.scss',
  host: {
    'class': 'color-saturation-picker',
    '(scroll)': 'onScroll()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorSaturationPicker implements OnChanges {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() color!: Color;

  @Output() change = new EventEmitter<{ data: HSVAsource }>();

  hsl!: HSLA;
  hsv!: HSVA;

  bgColor = '';

  posX = 0;
  posY = 0;

  ngOnChanges() {
    this.hsl = this.color.hsl;
    this.hsv = this.color.hsv;

    this.bgColor = `hsl(${this.hsl.h}, 100%, 50%)`;
    this.posX = this.hsv.s * 100;
    this.posY = 100 - this.hsv.v * 100;
  }

  handleChange(e: CoordinatesChangeEvent) {
    const { top, left, containerHeight, containerWidth } = e;

    const s = Math.max(0, Math.min(left, containerWidth)) / containerWidth;
    const v = 1 - Math.max(0, Math.min(top, containerHeight)) / containerHeight;

    const data: HSVAsource = { ...this.hsv, s, v, source: 'hsva' };
    this.change.emit({ data });
  }

  // Fix the Focus-induced Scroll issue
  onScroll() {
    const el = this.el.nativeElement;
    if (el.scrollTop !== 0 || el.scrollLeft !== 0) {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    }
  }
}
