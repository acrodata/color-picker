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
  templateUrl: './examples.component.html',
  styleUrl: './examples.component.scss',
})
export class ExamplesComponent {
  color = '#ff000060';
  color2 = 'rgba(255, 160, 0, 1)';
  color3 = 'hsla(200, 100%, 50%, 1)';
  color4 = { value: '#00ff00' };

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
