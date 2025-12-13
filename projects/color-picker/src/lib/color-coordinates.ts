import { Directive, ElementRef, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

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
    '(pointerdown)': 'pointerDown($event)',
    '(pointermove)': 'pointerMove($event)',
    '(pointerup)': 'pointerUp($event)',
  },
})
export class ColorCoordinates implements OnInit, OnDestroy {
  private el = inject<ElementRef<HTMLElement>>(ElementRef);

  @Output() coordinatesChange = new Subject<CoordinatesChangeEvent>();

  private pointerChange = new Subject<PointerEvent>();
  private pointerSub = Subscription.EMPTY;
  private isListening = false;

  pointerDown(e: PointerEvent) {
    const { x, y } = e;
    e.preventDefault();

    if (this.el.nativeElement.setPointerCapture) {
      this.el.nativeElement.setPointerCapture(e.pointerId);
    }

    this.isListening = true;
    this.pointerChange.next(e);
  }

  pointerMove(e: PointerEvent) {
    const { x, y } = e;
    if (this.isListening) {
      e.preventDefault();
      this.pointerChange.next(e);
    }
  }

  pointerUp(e: PointerEvent) {
    if (this.isListening) {
      this.isListening = false;

      if (this.el.nativeElement.releasePointerCapture) {
        this.el.nativeElement.releasePointerCapture(e.pointerId);
      }
    }
  }

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
