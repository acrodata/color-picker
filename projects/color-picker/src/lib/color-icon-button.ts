import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'color-icon-button',
  standalone: true,
  imports: [],
  template: `
    <ng-content />
  `,
  styleUrl: './color-icon-button.scss',
  host: {
    class: 'color-icon-button',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorIconButton {}
