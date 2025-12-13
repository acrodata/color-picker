import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

let nextUniqueId = 0;

@Component({
  selector: 'color-editable-input',
  template: `
    <input
      [id]="uniqueId"
      [style]="inputStyle"
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
      <label
        [for]="uniqueId"
        [id]="uniqueId"
        [style]="labelStyle"
        (pointerdown)="handleMousedown($event)"
      >
        {{ label }}
      </label>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorEditableInput implements OnInit, OnChanges, OnDestroy {
  @Input() label!: string;
  @Input() value!: string | number;
  @Input() arrowOffset!: number;
  @Input() dragLabel!: boolean;
  @Input() dragMax!: number;
  @Input() placeholder = '';
  @Output() change = new EventEmitter();

  currentValue!: string | number;
  blurValue!: string;
  inputStyle!: Record<string, string>;
  labelStyle!: Record<string, string>;
  focus = false;
  pointermove!: Subscription;
  pointerup!: Subscription;
  uniqueId: string = `editableInput-${++nextUniqueId}`;

  ngOnInit() {
    if (this.dragLabel) {
      this.labelStyle['cursor'] = 'ew-resize';
    }
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

  subscribe() {
    this.pointermove = fromEvent<PointerEvent>(document, 'pointermove').subscribe(ev =>
      this.handleDrag(ev)
    );
    this.pointerup = fromEvent(document, 'pointerup').subscribe(() => this.unsubscribe());
  }

  unsubscribe() {
    this.pointermove?.unsubscribe();
    this.pointerup?.unsubscribe();
  }

  handleMousedown($event: PointerEvent) {
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
