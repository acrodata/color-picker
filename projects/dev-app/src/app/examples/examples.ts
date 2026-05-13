import {
  ColorAlphaSlider,
  ColorFormat,
  ColorHueSlider,
  ColorPicker,
  ColorSaturationPicker,
  ColorSource,
  parseColor,
} from '@acrodata/color-picker';
import { Component, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-examples',
  imports: [FormsModule, ColorPicker, ColorSaturationPicker, ColorHueSlider, ColorAlphaSlider],
  templateUrl: './examples.html',
  styleUrl: './examples.scss',
})
export class Examples {
  color = signal('#ff000060');
  color2 = signal('rgba(255, 160, 0, 1)');

  format = signal<ColorFormat>('hex');

  hideAlpha = signal(false);

  colorObj = linkedSignal(() => parseColor(this.color()));

  onColorChange(e: ColorSource) {
    this.colorObj.set(parseColor(e));
  }

  log(type: string, e: any) {
    console.log(type, e);
  }
}
