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
  $event: Event;
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

  private pointerChange = new Subject<{ x: number; y: number; $event: Event }>();
  private isListening = false;
  private sub = Subscription.EMPTY;

  pointerDown(e: PointerEvent) {
    const { x, y } = e;
    e.preventDefault();

    if (this.el.nativeElement.setPointerCapture) {
      this.el.nativeElement.setPointerCapture(e.pointerId);
    }

    this.isListening = true;
    this.pointerChange.next({ $event: e, x, y });
  }

  pointerMove(e: PointerEvent) {
    const { x, y } = e;
    if (this.isListening) {
      e.preventDefault();
      this.pointerChange.next({ $event: e, x, y });
    }
  }

  pointerUp($event: PointerEvent) {
    if (this.isListening) {
      this.isListening = false;

      if (this.el.nativeElement.releasePointerCapture) {
        this.el.nativeElement.releasePointerCapture($event.pointerId);
      }
    }
  }

  ngOnInit() {
    this.sub = this.pointerChange
      .pipe(
        // limit times it is updated for the same area
        distinctUntilChanged((p, q) => p.x === q.x && p.y === q.y)
      )
      .subscribe(n => this.handleChange(n.x, n.y, n.$event));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  handleChange(x: number, y: number, $event: Event) {
    const containerRect = this.el.nativeElement.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const left = x - containerRect.left;
    const top = y - containerRect.top;

    this.coordinatesChange.next({
      x,
      y,
      top,
      left,
      containerWidth,
      containerHeight,
      $event,
    });
  }
}
