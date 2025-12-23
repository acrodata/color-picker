import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { distinctUntilChanged, Subject, Subscription } from 'rxjs';

export interface CoordinatesChangeEvent {
  containerWidth: number;
  containerHeight: number;
  left: number;
  top: number;
}

@Directive({
  selector: '[color-coordinates], [colorCoordinates]',
  host: {
    '(pointerdown)': 'onDragStart($event)',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class ColorCoordinates implements OnInit, OnDestroy {
  private document = inject(DOCUMENT);
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  @Input() percentX?: number | null;
  @Input() percentY?: number | null;
  @Output() coordinatesChange = new Subject<CoordinatesChangeEvent>();

  private pointerChange = new Subject<PointerEvent>();
  private pointerSub = Subscription.EMPTY;

  ngOnInit() {
    this.pointerSub = this.pointerChange
      .pipe(
        // limit times it is updated for the same area
        distinctUntilChanged((p, q) => p.x === q.x && p.y === q.y)
      )
      .subscribe(n => this.handleChange(n));
  }

  ngOnDestroy() {
    this.pointerSub.unsubscribe();
  }

  onDragStart(e: PointerEvent) {
    e.preventDefault();
    this.pointerChange.next(e);
    this.document.addEventListener('pointermove', this.onDrag, { passive: false });
    this.document.addEventListener('pointerup', this.onDragEnd, { passive: false });
  }

  onDrag = (e: PointerEvent) => {
    e.preventDefault();
    this.pointerChange.next(e);
  };

  onDragEnd = (e: PointerEvent) => {
    this.document.removeEventListener('pointermove', this.onDrag);
    this.document.removeEventListener('pointerup', this.onDragEnd);
  };

  onKeyDown(e: KeyboardEvent) {
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!arrowKeys.includes(e.key)) return;

    e.preventDefault();

    const rect = this.el.nativeElement.getBoundingClientRect();

    const multiplier = e.shiftKey ? 10 : 1;
    const stepX = (rect.width / 100) * multiplier;
    const stepY = (rect.height / 100) * multiplier;

    let vX = 0;
    let vY = 0;

    if (this.percentX != null && this.percentY != null) {
      vX = rect.left + rect.width * (this.percentX / 100);
      vY = rect.top + rect.height * (this.percentY / 100);

      switch (e.key) {
        case 'ArrowLeft':
          vX -= stepX;
          break;
        case 'ArrowRight':
          vX += stepX;
          break;
        case 'ArrowUp':
          vY -= stepY;
          break;
        case 'ArrowDown':
          vY += stepY;
          break;
      }
    } else if (this.percentX != null) {
      vX = rect.left + rect.width * (this.percentX / 100);

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          vX -= stepX;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          vX += stepX;
          break;
      }
    } else if (this.percentY != null) {
      vY = rect.top + rect.height * (this.percentY / 100);

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          vY += stepY;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          vY -= stepY;
          break;
      }
    }

    this.handleChange({ clientX: vX, clientY: vY } as PointerEvent);
  }

  handleChange(e: PointerEvent) {
    const containerRect = this.el.nativeElement.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const { clientX, clientY } = e;
    const left = clientX - containerRect.left;
    const top = clientY - containerRect.top;

    this.coordinatesChange.next({
      containerWidth,
      containerHeight,
      left,
      top,
    });
  }
}
