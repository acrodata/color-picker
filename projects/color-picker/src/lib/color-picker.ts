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
import { Color, ColorChangeEvent, ColorFormat, ColorSource, HSLA } from './interfaces';
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
  @Input() color = '#000';

  /** Event emitted when the color string changes. */
  @Output() colorChange = new EventEmitter<string>();

  /** Event emitted when the color value changes. */
  @Output() valueChange = new EventEmitter<ColorChangeEvent>();

  /** Whether to hide the alpha channel. */
  @Input({ transform: booleanAttribute }) hideAlpha = false;

  /** Whether the color-picker is disabled. */
  @Input({ transform: booleanAttribute }) disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  colorData!: Color;
  oldHue = 0;
  oldColor = '';

  EyeDropper = (window as any).EyeDropper;
  supportEyeDropper = !!this.EyeDropper;

  isCopied = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['format'] || changes['color']) {
      this.getColorFormat();
    }
    if (changes['color'] && this.color !== this.oldColor) {
      this.getColorData(this.color, this.oldHue);
    }
  }

  ngOnInit() {
    this.getColorData(this.color);
  }

  writeValue(value: any): void {
    if (value) {
      this.color = value;
      this.getColorFormat();
      this.getColorData(this.color, this.oldHue);
    }
  }

  registerOnChange(fn: (color: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  getColorData(data: any, oldHue = 0) {
    this.colorData = parseColor(data, oldHue, this.hideAlpha);
    this.oldHue = this.colorData.oldHue;
    this.cdr.markForCheck();
  }

  handleChange(e: ColorSource) {
    const isValidColor = simpleCheckForValidColor(e);
    if (isValidColor) {
      this.getColorData(e, (e as HSLA).h || this.oldHue);
      this.getColorString(this.colorData);
      this.onChange(this.color);
      this.colorChange.emit(this.color);
      this.valueChange.emit({ value: this.color, color: this.colorData });
    }
  }

  getColorFormat() {
    if (!this.format) {
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
      this.handleChange({ hex: result.sRGBHex, source: 'rgb' });
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
