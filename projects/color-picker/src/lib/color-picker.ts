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
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TinyColor } from '@ctrl/tinycolor';
import { ColorAlphaSlider } from './color-alpha-slider';
import { ColorHueSlider } from './color-hue-slider';
import { ColorIconButton } from './color-icon-button';
import { ColorInputFields } from './color-input-fields';
import { ColorSaturationPicker } from './color-saturation-picker';
import { Color, ColorChange, ColorFormat, ColorSource, HSLA } from './interfaces';
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
export class ColorPicker implements OnInit, OnChanges, ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  /** The output format of the color picker. */
  @Input() format?: ColorFormat;

  /** Event emitted when the color format is changed. */
  @Output() formatChange = new EventEmitter<ColorFormat>();

  /** The initial color string. */
  @Input() value = '#000';

  /** Event emitted when the value changes. */
  @Output() valueChange = new EventEmitter<string>();

  /**
   * The initial color which allow to pass either object or string.
   * @deprecated Use `value` property instead.
   */
  @Input() color: any = { value: '#000' };

  /**
   * Event emitted when the color changes.
   * The output value depends on the type of `color` input.
   */
  @Output() colorChange = new EventEmitter<any>();

  /** Whether to hide the alpha channel. */
  @Input({ transform: booleanAttribute }) hideAlpha = false;

  /** Whether the color picker is disabled. */
  @Input({ transform: booleanAttribute }) disabled = false;

  parsedColor!: Color;

  private oldHue = 0;

  private oldValue = '';

  EyeDropper = (window as any).EyeDropper;
  supportEyeDropper = !!this.EyeDropper;

  isCopied = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['format']) {
      this.getColorFormat();
    }

    if (changes['value']) {
      this.getColorFormat();
      if (this.value !== this.oldValue) {
        this.getParsedColor(this.value, this.oldHue);
      }
    }

    if (changes['color']) {
      this.value = typeof this.color === 'string' ? this.color : this.color?.value;
      this.getColorFormat();
      if (this.value !== this.oldValue) {
        this.getParsedColor(this.value, this.oldHue);
      }
    }
  }

  ngOnInit() {
    this.getParsedColor(this.value);
  }

  writeValue(value: any): void {
    if (value) {
      this.value = value;
      this.getColorFormat();
      this.getParsedColor(value, this.oldHue);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  getParsedColor(data: any, oldHue = 0) {
    this.parsedColor = parseColor(data, oldHue, this.hideAlpha);
    this.oldHue = this.parsedColor.oldHue;
    this.cdr.markForCheck();
  }

  handleChange(e: ColorSource) {
    const isValidColor = simpleCheckForValidColor(e);
    if (isValidColor) {
      this.getParsedColor(e, (e as HSLA).h || this.oldHue);
      this.getColorString(this.parsedColor);

      this.onChange(this.value);

      this.valueChange.emit(this.value);

      const outputColor =
        typeof this.color === 'string'
          ? this.value
          : { ...this.color, value: this.value, color: this.parsedColor };
      this.colorChange.emit(outputColor);
    }
  }

  getColorFormat() {
    if (!this.format) {
      const color = new TinyColor(this.value);
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
        this.value = color.rgbString;
        break;
      case 'hsl':
        this.value = color.hslString;
        break;
      case 'hsv':
        this.value = color.hsvString;
        break;
      default:
        this.value = color.hex;
        break;
    }
    this.oldValue = this.value;
    this.cdr.markForCheck();
  }

  handleFormatChange() {
    this.formatChange.emit(this.format);
  }

  async openEyeDropper(e: MouseEvent) {
    const eyeDropper = new this.EyeDropper();
    try {
      const result = await eyeDropper.open();
      this.handleChange({ hex: result.sRGBHex, source: 'rgb' });
    } catch (err) {
      console.warn(err);
    }
  }

  async copyColor() {
    try {
      await navigator.clipboard.writeText(this.value);

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
