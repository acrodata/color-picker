import { ColorPicker } from '@acrodata/color-picker';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [FormsModule, ColorPicker, CdkConnectedOverlay, CdkOverlayOrigin],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  color = signal('#ff0000');

  isOpen = signal(false);

  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  closeMenu() {
    this.isOpen.set(false);
  }
}
