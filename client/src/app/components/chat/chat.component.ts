import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ChatSocketService } from 'src/app/shared/services';
import { Message } from 'src/app/shared/interfaces/Message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
})
export class ChatComponent {
  @ViewChild('chatContainer') chatContainerRef!: ElementRef;

  @Input() MessagesProps!: Message[];
  @Input() joinedUserProps!: string;
  @Input() leavingUserProps!: string;

  private scrollToBottom(): void {
    try {
      this.chatContainerRef.nativeElement.scrollTop =
        this.chatContainerRef.nativeElement.scrollHeight;
    } catch (err) {
      console.log('Error scrolling to the bottom:', err);
    }
  }

  constructor(public chatSocketService: ChatSocketService) {}
}
