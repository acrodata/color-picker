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

  @Output() valueChange = new EventEmitter<{
    data: Record<string, number | string> | number | string;
  }>();

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
    // https://github.com/casesandberg/react-color/issues/383
    const target = e.target as HTMLInputElement;
    const stringValue = String(target.value);
    const isPercentage = stringValue.indexOf('%') > -1;
    const num = Number(stringValue.replace(/%/g, ''));
    if (isNaN(num)) {
      return;
    }
    const step = this.step || 1;

    // Up
    if (e.keyCode === 38) {
      if (this.label) {
        this.valueChange.emit({
          data: { [this.label]: num + step },
        });
      } else {
        this.valueChange.emit({ data: num + step });
      }

      if (isPercentage) {
        this.currentValue = `${num + step}%`;
      } else {
        this.currentValue = num + step;
      }
    }

    // Down
    if (e.keyCode === 40) {
      if (this.label) {
        this.valueChange.emit({
          data: { [this.label]: num - step },
        });
      } else {
        this.valueChange.emit({ data: num - step });
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
    if (e.keyCode === 40 || e.keyCode === 38) {
      return;
    }
    if (`${this.currentValue}` === target.value) {
      return;
    }

    if (this.label) {
      this.valueChange.emit({
        data: { [this.label]: target.value },
      });
    } else {
      this.valueChange.emit({ data: target.value });
    }
  }
}
