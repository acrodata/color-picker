import { ColorFormat, ColorPicker } from '@acrodata/color-picker';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-examples',
  imports: [ColorPicker, FormsModule],
  templateUrl: './examples.component.html',
  styleUrl: './examples.component.scss',
})
export class ExamplesComponent {
  color = '#ff000060';
  color2 = 'rgba(200, 100, 100, 1)';
  color3 = 'hsla(200, 100%, 50%, 1)';

  format: ColorFormat = 'hex';

  hideAlpha = false;

  log(type: string, e: any) {
    console.log(type, e);
  }
}
