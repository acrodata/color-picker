import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  numberAttribute,
  OnChanges,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ColorFieldValue } from './interfaces';

let nextUniqueId = 0;

@Component({
  selector: 'color-input-field',
  template: `
    <input
      spellCheck="false"
      [value]="currentValue"
      [placeholder]="placeholder"
      (keydown)="handleKeydown($event)"
      (keyup)="handleKeyup($event)"
      (focus)="handleFocus($event)"
      (focusout)="handleFocusOut($event)"
      [attr.aria-labelledby]="uniqueId"
    />
    @if (label) {
      <span [id]="uniqueId">{{ label }}</span>
    }
  `,
  host: {
    class: 'color-input-field',
  },
  styleUrl: './color-input-field.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorInputField implements OnChanges {
  @Input() label = '';

  @Input({ transform: numberAttribute }) step = 1;

  @Input() placeholder = '';

  @Input() value: string | number = '';

  @Output() valueChange = new EventEmitter<ColorFieldValue>();

  uniqueId = `color-input-${++nextUniqueId}`;

  focus = false;
  currentValue: string | number = '';
  blurValue = '';

  ngOnChanges() {
    if (!this.focus) {
      this.currentValue = String(this.value);
      this.blurValue = String(this.value);
    } else {
      this.blurValue = String(this.value);
    }
  }

  handleFocus(e: FocusEvent) {
    this.focus = true;
  }

  handleFocusOut(e: FocusEvent) {
    this.focus = false;
    this.currentValue = this.blurValue;
  }

  handleKeydown(e: KeyboardEvent) {
    // In case `e.target.value` is a percentage remove the `%` character
    // and update accordingly with a percentage
    const target = e.target as HTMLInputElement;
    const inputValue = String(target.value);
    const isPercentage = inputValue.indexOf('%') > -1;
    const num = Number(inputValue.replace(/%/g, ''));
    if (isNaN(num)) {
      return;
    }

    const step = this.step || 1;

    if (e.key === 'ArrowUp') {
      if (this.label) {
        this.valueChange.emit({ [this.label]: num + step });
      } else {
        this.valueChange.emit(num + step);
      }

      if (isPercentage) {
        this.currentValue = `${num + step}%`;
      } else {
        this.currentValue = num + step;
      }
    }

    if (e.key === 'ArrowDown') {
      if (this.label) {
        this.valueChange.emit({ [this.label]: num - step });
      } else {
        this.valueChange.emit(num - step);
      }

      if (isPercentage) {
        this.currentValue = `${num - step}%`;
      } else {
        this.currentValue = num - step;
      }
    }
  }

  handleKeyup(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      return;
    }
    if (`${this.currentValue}` === target.value) {
      return;
    }

    if (this.label) {
      this.valueChange.emit({ [this.label]: target.value });
    } else {
      this.valueChange.emit(target.value);
    }
  }
}
