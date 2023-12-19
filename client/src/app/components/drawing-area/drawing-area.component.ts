import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SkribbleSocketService } from 'src/app/shared/services';
import { Stroke } from 'src/app/shared/interfaces/Stroke';

@Component({
  selector: 'app-drawing-area',
  templateUrl: './drawing-area.component.html',
})
export class DrawingAreaComponent implements AfterViewInit, OnInit {
  @ViewChild('drawingArea') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('drawingAreaContainer') container!: ElementRef<HTMLDivElement>;
  @ViewChild('cursorTracker') cursorTracker!: ElementRef<HTMLDivElement>;
  @Input() strokeWidthProps!: number;
  @Input() strokeColorProps!: string;
  private isDrawing: boolean = false;
  private ctx!: CanvasRenderingContext2D | null;
  currentUserName: string | null = null;
  private lastX: number = 0;
  private lastY: number = 0;
  private strokes: Stroke[] = []; // Store the drawn strokes here

  constructor(private skribbleSocketService: SkribbleSocketService) {}

  ngAfterViewInit() {
    const container = this.container.nativeElement;
    const drawingArea = this.canvas.nativeElement;
    this.ctx = drawingArea.getContext('2d');
    this.adjustCanvasSize(container, drawingArea);
  }
  ngOnInit(): void {
    this.skribbleSocketService.receiveDrawingFromSocket((userName, stroke) => {
      this.drawStroke(stroke, userName);
    });
    this.skribbleSocketService.receiveResetDrawingSocket((message) => {
      if (message === 'clearCanvas') {
        this.resetDrawing(true);
      }
    });
  }
  private updateCursorPosition(x: number, y: number) {
    if (this.cursorTracker) {
      const xOffset = 10; // Adjust this value to position the element relative to the cursor
      const yOffset = -25; // Adjust this value to position the element relative to the cursor
      this.cursorTracker.nativeElement.style.transform = `translate(${
        x + xOffset
      }px, ${y + yOffset}px)`;
    }
  }
  drawStroke(stroke: Stroke, userName?: string) {
    this.ctx!.lineWidth = stroke.strokeWidth;
    this.ctx!.lineCap = 'round';
    this.ctx!.strokeStyle = stroke.strokeColor;
    this.ctx?.beginPath();
    this.ctx?.moveTo(stroke.startX, stroke.startY);
    this.ctx?.lineTo(stroke.endX, stroke.endY);
    this.ctx?.stroke();

    if (userName) {
      this.currentUserName = userName; // Set the current user's name
      this.updateCursorPosition(stroke.endX, stroke.endY);
      console.log(stroke.endX, stroke.endY);
    } else {
      this.currentUserName = null;
    }
    // Store the received stroke data
    this.strokes.push(stroke);
  }

  adjustCanvasSize(container: HTMLDivElement, canvas: HTMLCanvasElement) {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.lastX = event.offsetX;
    this.lastY = event.offsetY;
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;

    const currentX = event.offsetX;
    const currentY = event.offsetY;

    // Store the stroke data
    const stroke: Stroke = {
      startX: this.lastX,
      startY: this.lastY,
      endX: currentX,
      endY: currentY,
      strokeWidth: this.strokeWidthProps,
      strokeColor: this.strokeColorProps,
    };
    this.drawStroke(stroke);
    this.skribbleSocketService.sendDrawingSocket(stroke);

    this.strokes.push(stroke);

    this.lastX = currentX;
    this.lastY = currentY;
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  redrawCanvas() {
    this.ctx?.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    for (const stroke of this.strokes) {
      this.ctx!.lineWidth = stroke.strokeWidth;
      this.ctx!.lineCap = 'round';
      this.ctx!.strokeStyle = stroke.strokeColor;
      this.ctx?.beginPath();
      this.ctx?.moveTo(stroke.startX, stroke.startY);
      this.ctx?.lineTo(stroke.endX, stroke.endY);
      this.ctx?.stroke();
    }
  }

  resetDrawing(isCallback: boolean) {
    if (!isCallback) {
      this.skribbleSocketService.sendResetDrawingSocket();
    }
    this.strokes = []; // Clear the strokes array
    this.ctx?.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    this.currentUserName = null;
  }
}
