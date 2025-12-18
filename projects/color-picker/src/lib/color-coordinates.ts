import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { distinctUntilChanged, Subject, Subscription } from 'rxjs';

export interface CoordinatesChangeEvent {
  x: number;
  y: number;
  top: number;
  left: number;
  containerWidth: number;
  containerHeight: number;
  $event: PointerEvent;
}

@Directive({
  selector: '[color-coordinates], [colorCoordinates]',
  host: {
    '(pointerdown)': 'onDragStart($event)',
  },
})
export class ColorCoordinates implements OnInit, OnDestroy {
  private document = inject(DOCUMENT);
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  @Output() coordinatesChange = new Subject<CoordinatesChangeEvent>();

  private pointerChange = new Subject<PointerEvent>();
  private pointerSub = Subscription.EMPTY;

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

  handleChange(e: PointerEvent) {
    const containerRect = this.el.nativeElement.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const { x, y } = e;
    const left = x - containerRect.left;
    const top = y - containerRect.top;

    this.coordinatesChange.next({
      x,
      y,
      top,
      left,
      containerWidth,
      containerHeight,
      $event: e,
    });
  }
}
