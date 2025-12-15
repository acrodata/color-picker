import { ColorFormat, ColorPicker } from '@acrodata/color-picker';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [ColorPicker, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  theme: 'light' | 'dark' = 'light';

  color = '#ff000060';
  color2 = 'rgba(200, 100, 100, 1)';
  color3 = 'hsla(200, 100%, 50%, 1)';

  format: ColorFormat = 'hex';

  disableAlpha = false;

  onThemeChange() {
    if (this.theme === 'light') {
      document.querySelector('html')!.classList.remove('theme-dark');
    } else if (this.theme === 'dark') {
      document.querySelector('html')!.classList.add('theme-dark');
    }
  }

  log(type: string, e: any) {
    console.log(type, e);
  }
}
