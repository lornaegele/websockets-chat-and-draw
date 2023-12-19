import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SkribbleSocketService } from 'src/app/shared/services';
import { Clipboard } from '@angular/cdk/clipboard';
import { User, HistoryArray } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input() historyArrayProp!: HistoryArray[];
  @Input() usersProp!: User[];

  @Output() strokeWidthChangeEmit = new EventEmitter<number>();
  @Output() selectedColorChangeEmit = new EventEmitter<string>();

  copied: boolean = false;

  constructor(
    public skribbleSocketService: SkribbleSocketService,
    private clipboard: Clipboard
  ) {}

  strokeWidth: number = 5;
  selectedColor: string = '#000000';

  onColorChange(event: Event) {
    this.selectedColor = (event.target as HTMLInputElement).value;
    this.selectedColorChangeEmit.emit(this.selectedColor); // Emit the selectedColor value to the parent component
  }

  onStrokeWidthChange(event: Event) {
    this.strokeWidth = +(event.target as HTMLInputElement).value;
    this.strokeWidthChangeEmit.emit(this.strokeWidth); // Emit the strokeWidth value to the parent component
  }

  copyToClipboard(): void {
    this.clipboard.copy(this.skribbleSocketService.roomId);
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 1500);
  }
}
