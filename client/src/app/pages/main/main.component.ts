import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Message } from 'src/app/shared/interfaces/Message';
import { ChatSocketService, FirebaseService } from 'src/app/shared/services';
import { Subscription } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';

const USER_STATUS_DURATION = 4000;
const COPIED_TIMEOUT = 1500;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit, OnDestroy {
  messageInput = '';
  messages: Message[] = [];
  joinedUser = '';
  leavingUser = '';
  roomId = '';
  copied: boolean = false;
  isTypingLocally = false;

  private routeSubscription!: Subscription;

  constructor(
    public chatSocketService: ChatSocketService,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.setupSocketListeners();
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.roomId = params.get('roomId') || '';
      if (this.roomId.trim() !== '') {
        this.chatSocketService.roomId = this.roomId;
        this.chatSocketService.joinRoomInSocket(
          this.roomId,
          this.chatSocketService.userName
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  setupSocketListeners(): void {
    this.chatSocketService.initializeSocket();
    this.setupIsTypingSocketListener();
    this.setupMessageSocketListener();
    this.setupUserJoinedLeftRoomSocketListeners();
  }

  setupIsTypingSocketListener(): void {
    this.chatSocketService.receiveIsTypingSocket(
      (userName: string, date: Date, isTyping: boolean, userId: string) => {
        if (isTyping) {
          const hasIsTypingMessage = this.messages.some(
            (message) => message.message === 'is-typing-indicator'
          );
          if (!hasIsTypingMessage) {
            this.messages = [
              ...this.messages,
              {
                name: userName,
                message: 'is-typing-indicator',
                date,
                userID: userId,
              },
            ];
          }
        } else {
          this.messages = this.messages.filter(
            (message) => message.message !== 'is-typing-indicator'
          );
        }
        setTimeout(() => this.scrollToBottom(), 0);
      }
    );
  }

  setupMessageSocketListener(): void {
    this.chatSocketService.receiveMessagesFromSocket(
      (message: string, userName: string, date: Date, userID: string) => {
        this.messages = [
          ...this.messages,
          { name: userName, message, date, userID },
        ];
        this.messages = this.messages.filter(
          (message) => message.message !== 'is-typing-indicator'
        );
        setTimeout(() => this.scrollToBottom(), 0);
      }
    );
  }

  setupUserJoinedLeftRoomSocketListeners(): void {
    this.chatSocketService.userJoinedRoomSocket((userName: string) => {
      this.joinedUser = userName;
      setTimeout(() => (this.joinedUser = ''), USER_STATUS_DURATION);
    });

    this.chatSocketService.userLeftRoomSocket((userName: string) => {
      this.leavingUser = userName;
      setTimeout(() => (this.leavingUser = ''), USER_STATUS_DURATION);
    });
  }

  setMessageInput(event: Event): void {
    const date = new Date();
    this.messageInput = (event.target as HTMLInputElement).value;
    this.isTypingLocally = this.messageInput.length >= 2;
    this.chatSocketService.sendIsTypingSocket(
      this.chatSocketService.roomId,
      date,
      this.isTypingLocally
    );
    setTimeout(() => this.scrollToBottom(), 0);
  }

  sendMessage(): void {
    if (this.messageInput.trim() !== '') {
      const date = new Date();
      const newMessage: Message = {
        name: this.chatSocketService.userName,
        message: this.messageInput,
        date,
        userID: this.chatSocketService.userId,
      };
      this.messages = [...this.messages, newMessage];
      this.chatSocketService.sendToSocket(
        this.messageInput,
        this.chatSocketService.roomId,
        date
      );
      this.messageInput = '';
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  public scrollToBottom(): void {}

  copyToClipboard(): void {
    this.clipboard.copy(this.chatSocketService.roomId);
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, COPIED_TIMEOUT);
  }
}
