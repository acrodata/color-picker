import {
  booleanAttribute,
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
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TinyColor } from '@ctrl/tinycolor';
import { debounceTime, Subscription, tap } from 'rxjs';
import { ColorAlphaSlider } from './color-alpha-slider';
import { ColorHueSlider } from './color-hue-slider';
import { ColorIconButton } from './color-icon-button';
import { ColorInputFields } from './color-input-fields';
import { ColorSaturationPicker } from './color-saturation-picker';
import { Color, ColorEvent, ColorFormat, HSLA, HSVA, RGBA } from './interfaces';
import { simpleCheckForValidColor, toState } from './utils';

@Component({
  selector: 'color-picker',
  imports: [
    ColorSaturationPicker,
    ColorHueSlider,
    ColorAlphaSlider,
    ColorInputFields,
    ColorIconButton,
  ],
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

  @Input() format?: ColorFormat;

  @Output() formatChange = new EventEmitter<ColorFormat>();

  @Input() color = '#000';

  @Output() colorChange = new EventEmitter<string>();

  @Output() valueChange = new EventEmitter<ColorEvent>();

  @Output() valueChanged = new EventEmitter<ColorEvent>();

  @Input({ transform: booleanAttribute }) disableAlpha = false;

  @Input({ transform: booleanAttribute }) disabled = false;

  hsl!: HSLA;
  hsv!: HSVA;
  rgb!: RGBA;
  hex = '';
  oldHue!: number;
  source = '';

  activeBgColor = '';

  private valueChangeSub = Subscription.EMPTY;
  private valueChangedSub = new Subscription();

  EyeDropper = (window as any).EyeDropper;
  supportEyeDropper = !!this.EyeDropper;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['format']) {
      this.getColorFormat();
    }
    if (changes['color']) {
      this.setState(toState(this.color, this.oldHue, this.disableAlpha));
    }
  }

  ngOnInit() {
    this.valueChangeSub = this.valueChange
      .pipe(
        debounceTime(100),
        tap(e => {
          this.getColorString(e.color);
          this.valueChanged.emit(e);
          this.colorChange.emit(this.color);
        })
      )
      .subscribe();

    this.setState(toState(this.color, 0, this.disableAlpha));
  }

  ngOnDestroy() {
    this.valueChangeSub.unsubscribe();
    this.valueChangedSub.unsubscribe();
  }

  writeValue(value: any): void {
    if (value) {
      this.color = value;
      this.getColorFormat();
      this.setState(toState(this.color, this.oldHue, this.disableAlpha));
    }
  }

  registerOnChange(fn: (color: string) => void): void {
    this.valueChangedSub.add(
      this.valueChanged
        .pipe(
          tap(e => {
            fn(this.color);
          })
        )
        .subscribe()
    );
  }

  registerOnTouched(fn: () => void): void {}

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

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
    this.activeBgColor = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${alpha})`;
    this.cdr.markForCheck();
  }

  getColorFormat() {
    if (this.format == null) {
      const color = new TinyColor(this.color);
      if (color.format === 'rgb' || color.format === 'hsl' || color.format === 'hsv') {
        this.format = color.format;
      } else {
        this.format = 'hex';
      }
    }
    this.cdr.markForCheck();
  }

  getColorString(color: Color) {
    switch (this.format) {
      case 'hex':
        this.color = color.hex;
        break;
      case 'rgb':
        this.color = color.rgbString;
        break;
      case 'hsl':
        this.color = color.hslString;
        break;
      case 'hsv':
        this.color = color.hsvString;
        break;
      default: {
        const msg = `The format '${this.format}' is not supported`;
        if (isDevMode()) {
          throw new Error(msg);
        } else {
          console.warn(msg);
        }
        break;
      }
    }
    this.cdr.markForCheck();
  }

  handleFormatChange() {
    this.formatChange.emit(this.format);
  }

  async openEyeDropper(e: MouseEvent) {
    const eyeDropper = new this.EyeDropper();
    try {
      const result = await eyeDropper.open();
      this.handleChange({ data: result.sRGBHex, $event: e });
    } catch (err) {
      console.warn(err);
    }
  }
}
