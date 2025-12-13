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
  @Output() change = new EventEmitter();

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

  handleFocus($event: FocusEvent) {
    this.focus = true;
  }

  handleFocusOut($event: FocusEvent) {
    this.focus = false;
    this.currentValue = this.blurValue;
  }

  handleKeydown($event: KeyboardEvent) {
    // In case `e.target.value` is a percentage remove the `%` character
    // and update accordingly with a percentage
    // https://github.com/casesandberg/react-color/issues/383
    const target = $event.target as HTMLInputElement;
    const stringValue = String(target.value);
    const isPercentage = stringValue.indexOf('%') > -1;
    const num = Number(stringValue.replace(/%/g, ''));
    if (isNaN(num)) {
      return;
    }
    const amount = this.arrowOffset || 1;

    // Up
    if ($event.keyCode === 38) {
      if (this.label) {
        this.change.emit({
          data: { [this.label]: num + amount },
          $event,
        });
      } else {
        this.change.emit({ data: num + amount, $event });
      }

      if (isPercentage) {
        this.currentValue = `${num + amount}%`;
      } else {
        this.currentValue = num + amount;
      }
    }

    // Down
    if ($event.keyCode === 40) {
      if (this.label) {
        this.change.emit({
          data: { [this.label]: num - amount },
          $event,
        });
      } else {
        this.change.emit({ data: num - amount, $event });
      }

      if (isPercentage) {
        this.currentValue = `${num - amount}%`;
      } else {
        this.currentValue = num - amount;
      }
    }
  }

  handleKeyup($event: KeyboardEvent) {
    const target = $event.target as HTMLInputElement;
    if ($event.keyCode === 40 || $event.keyCode === 38) {
      return;
    }
    if (`${this.currentValue}` === target.value) {
      return;
    }

    if (this.label) {
      this.change.emit({
        data: { [this.label]: target.value },
        $event,
      });
    } else {
      this.change.emit({ data: target.value, $event });
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

  handlePointerdown($event: PointerEvent) {
    if (this.dragLabel) {
      $event.preventDefault();
      this.handleDrag($event);
      this.subscribe();
    }
  }

  handleDrag($event: PointerEvent) {
    if (this.dragLabel) {
      const newValue = Math.round(+this.value + $event.movementX);
      if (newValue >= 0 && newValue <= this.dragMax) {
        this.change.emit({ data: { [this.label]: newValue }, $event });
      }
    }
  }
}
