import {
  ColorAlphaSlider,
  ColorFormat,
  ColorHueSlider,
  ColorPicker,
  ColorSaturationPicker,
  ColorSource,
  parseColor,
} from '@acrodata/color-picker';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-examples',
  imports: [FormsModule, ColorPicker, ColorSaturationPicker, ColorHueSlider, ColorAlphaSlider],
  templateUrl: './examples.html',
  styleUrl: './examples.scss',
})
export class Examples {
  color = '#ff000060';
  color2 = 'rgba(255, 160, 0, 1)';

  format: ColorFormat = 'hex';

  hideAlpha = false;

  log(type: string, e: any) {
    console.log(type, e);
  }

  colorObj = parseColor(this.color);
  onColorChange(e: ColorSource) {
    this.colorObj = parseColor(e);
  }
}
