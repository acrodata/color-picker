import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
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
import { Color, ColorEvent, ColorFormat } from './interfaces';
import { parseColor, simpleCheckForValidColor } from './utils';

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

  /** The output format of the color picker. */
  @Input() format?: ColorFormat;

  /** Event emitted when the color format is changed. */
  @Output() formatChange = new EventEmitter<ColorFormat>();

  /** The initial color string. */
  @Input() color = '#000';

  /** Event emitted when the color string is changed. */
  @Output() colorChange = new EventEmitter<string>();

  /** Event emitted when the color changes. */
  @Output() valueChange = new EventEmitter<ColorEvent>();

  /** Event emitted when the color change is finalized. */
  @Output() valueChanged = new EventEmitter<ColorEvent>();

  /** Whether to hide the alpha channel. */
  @Input({ transform: booleanAttribute }) hideAlpha = false;

  /** Whether the color-picker is disabled. */
  @Input({ transform: booleanAttribute }) disabled = false;

  private valueChangeSub = Subscription.EMPTY;
  private valueChangedSub = new Subscription();

  colorData!: Color;
  oldHue = 0;
  oldColor = '';

  EyeDropper = (window as any).EyeDropper;
  supportEyeDropper = !!this.EyeDropper;

  isCopied = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['format']) {
      this.getColorFormat();
    }
    if (changes['color'] && this.color !== this.oldColor) {
      this.getColorData(this.color, this.oldHue);
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

    this.getColorData(this.color);
  }

  ngOnDestroy() {
    this.valueChangeSub.unsubscribe();
    this.valueChangedSub.unsubscribe();
  }

  writeValue(value: any): void {
    if (value) {
      this.color = value;
      this.getColorFormat();
      this.getColorData(this.color, this.oldHue);
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

  getColorData(data: any, oldHue = 0) {
    this.colorData = parseColor(data, oldHue, this.hideAlpha);
    this.oldHue = this.colorData.oldHue;
    this.cdr.markForCheck();
  }

  handleChange(e: { data: any }) {
    const { data } = e;
    const isValidColor = simpleCheckForValidColor(data);
    if (isValidColor) {
      this.getColorData(data, data.h || this.oldHue);
      this.valueChange.emit({ color: this.colorData });
    }
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
      case 'rgb':
        this.color = color.rgbString;
        break;
      case 'hsl':
        this.color = color.hslString;
        break;
      case 'hsv':
        this.color = color.hsvString;
        break;
      default:
        this.color = color.hex;
        break;
    }
    this.oldColor = this.color;
    this.cdr.markForCheck();
  }

  handleFormatChange() {
    this.formatChange.emit(this.format);
  }

  async openEyeDropper(e: MouseEvent) {
    const eyeDropper = new this.EyeDropper();
    try {
      const result = await eyeDropper.open();
      this.handleChange({ data: result.sRGBHex });
    } catch (err) {
      console.warn(err);
    }
  }

  async copyColor() {
    try {
      await navigator.clipboard.writeText(this.color);

      this.isCopied = true;
      this.cdr.markForCheck();
      setTimeout(() => {
        this.isCopied = false;
        this.cdr.markForCheck();
      }, 1000);
    } catch (err) {
      console.warn(err);
    }
  }
}
