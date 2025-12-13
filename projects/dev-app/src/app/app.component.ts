import { ColorPicker } from '@acrodata/color-picker';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [ColorPicker, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  color = '#ff0000';

  log(e: any) {
    console.log(e);
  }
}
