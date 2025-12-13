import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

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
      <span [id]="uniqueId" (pointerdown)="handlePointerdown($event)">{{ label }}</span>
    }
  `,
  host: {
    class: 'color-input-field',
  },
  styleUrl: './color-input-field.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorInputField implements OnChanges, OnDestroy {
  @Input() label = '';
  @Input() value!: string | number;
  @Input() arrowOffset!: number;
  @Input() dragLabel = false;
  @Input() dragMax!: number;
  @Input() placeholder = '';
  @Output() change = new EventEmitter<{
    data: Record<string, number | string> | number | string;
    $event: KeyboardEvent | PointerEvent;
  }>();

  currentValue!: string | number;
  blurValue = '';
  focus = false;
  uniqueId: string = `color-editable-input-${++nextUniqueId}`;

  pointerMoveSub = Subscription.EMPTY;
  pointerUpSub = Subscription.EMPTY;

  ngOnChanges() {
    if (!this.focus) {
      this.currentValue = String(this.value).toUpperCase();
      this.blurValue = String(this.value).toUpperCase();
    } else {
      this.blurValue = String(this.value).toUpperCase();
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
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
    const amount = this.arrowOffset || 1;

    // Up
    if (e.keyCode === 38) {
      if (this.label) {
        this.change.emit({
          data: { [this.label]: num + amount },
          $event: e,
        });
      } else {
        this.change.emit({ data: num + amount, $event: e });
      }

      if (isPercentage) {
        this.currentValue = `${num + amount}%`;
      } else {
        this.currentValue = num + amount;
      }
    }

    // Down
    if (e.keyCode === 40) {
      if (this.label) {
        this.change.emit({
          data: { [this.label]: num - amount },
          $event: e,
        });
      } else {
        this.change.emit({ data: num - amount, $event: e });
      }

      if (isPercentage) {
        this.currentValue = `${num - amount}%`;
      } else {
        this.currentValue = num - amount;
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
      this.change.emit({
        data: { [this.label]: target.value },
        $event: e,
      });
    } else {
      this.change.emit({ data: target.value, $event: e });
    }
  }

  subscribe() {
    this.pointerMoveSub = fromEvent<PointerEvent>(document, 'pointermove').subscribe(e =>
      this.handleDrag(e)
    );
    this.pointerUpSub = fromEvent(document, 'pointerup').subscribe(() => this.unsubscribe());
  }

  unsubscribe() {
    this.pointerMoveSub.unsubscribe();
    this.pointerUpSub.unsubscribe();
  }

  handlePointerdown(e: PointerEvent) {
    if (this.dragLabel) {
      e.preventDefault();
      this.handleDrag(e);
      this.subscribe();
    }
  }

  handleDrag(e: PointerEvent) {
    if (this.dragLabel) {
      const newValue = Math.round(+this.value + e.movementX);
      if (newValue >= 0 && newValue <= this.dragMax) {
        this.change.emit({
          data: { [this.label]: newValue },
          $event: e,
        });
      }
    }
  }
}
