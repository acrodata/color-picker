import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  isDevMode,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, Subscription, tap } from 'rxjs';
import { ColorAlpha } from './color-alpha';
import { ColorHue } from './color-hue';
import { ColorInputFields } from './color-input-fields';
import { ColorSaturation } from './color-saturation';
import { Color, HSLA, HSVA, RGBA } from './interfaces';
import { simpleCheckForValidColor, toState } from './utils';

export interface ColorEvent {
  $event: Event;
  color: Color;
}

export enum ColorMode {
  HEX = 'hex',
  HSL = 'hsl',
  HSV = 'hsv',
  RGB = 'rgb',
}

@Component({
  selector: 'color-picker',
  imports: [ColorSaturation, ColorHue, ColorAlpha, ColorInputFields],
  templateUrl: './color-picker.html',
  styleUrl: './color-picker.scss',
  host: {
    class: 'color-picker',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPicker),
      multi: true,
    },
  ],
})
export class ColorPicker implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  @Input() mode = ColorMode.HEX;

  @Input() color: HSLA | HSVA | RGBA | string = { h: 250, s: 0.5, l: 0.2, a: 1 };

  @Output() colorChange = new EventEmitter<HSLA | HSVA | RGBA | string>();

  @Output() valueChange = new EventEmitter<ColorEvent>();

  @Output() valueChanged = new EventEmitter<ColorEvent>();

  oldHue!: number;
  hsl!: HSLA;
  hsv!: HSVA;
  rgb!: RGBA;
  hex = '';
  source = '';
  currentColor = '';
  disableAlpha = false;

  activeBackground = '';

  private valueChangeSub = Subscription.EMPTY;
  private valueChangedSub = new Subscription();

  ngOnInit() {
    this.valueChangeSub = this.valueChange
      .pipe(
        debounceTime(100),
        tap(e => {
          this.valueChanged.emit(e);
          switch (this.mode) {
            case ColorMode.HEX:
              this.colorChange.emit(e.color.hex);
              break;
            case ColorMode.HSL:
              this.colorChange.emit(e.color.hsl);
              break;
            case ColorMode.HSV:
              this.colorChange.emit(e.color.hsv);
              break;
            case ColorMode.RGB:
              this.colorChange.emit(e.color.rgb);
              break;
            default: {
              const msg = `The mode '${this.mode}' is not supported`;
              if (isDevMode()) {
                throw new Error(msg);
              } else {
                console.warn(msg);
              }
              break;
            }
          }
        })
      )
      .subscribe();
    this.setState(toState(this.color, 0));
    this.currentColor = this.hex;
  }

  ngOnChanges() {
    this.setState(toState(this.color, this.oldHue));
  }

  ngOnDestroy() {
    this.valueChangeSub.unsubscribe();
    this.valueChangedSub.unsubscribe();
  }

  writeValue(value: any): void {
    if (value) {
      this.color = value;
      this.setState(toState(this.color, this.oldHue));
    }
  }

  registerOnChange(fn: (hex: string) => void): void {
    this.valueChangedSub.add(this.valueChanged.pipe(tap(e => fn(e.color.hex))).subscribe());
  }

  registerOnTouched(fn: () => void): void {}

  setDisabledState(isDisabled: boolean): void {}

  setState(data: Color) {
    this.oldHue = data.oldHue;
    this.hsl = data.hsl;
    this.hsv = data.hsv;
    this.rgb = data.rgb;
    this.hex = data.hex;
    this.source = data.source;
    this.afterValidChange();
  }

  handleChange(e: { data: any; $event: Event }) {
    const { data, $event } = e;
    const isValidColor = simpleCheckForValidColor(data);
    if (isValidColor) {
      const color = toState(data, data.h || this.oldHue, this.disableAlpha);
      this.setState(color);
      this.valueChange.emit({ color, $event });
      this.afterValidChange();
    }
  }

  afterValidChange() {
    const alpha = this.disableAlpha ? 1 : this.rgb.a;
    this.activeBackground = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${alpha})`;
  }
}
