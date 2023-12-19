import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChatSocketService,
  SkribbleSocketService,
  RandomStringService,
  TextService,
  FirebaseService,
} from 'src/app/shared/services';

interface RoomConfig {
  roomInput: string;
  nameInput: string;
}

const ROOM_ID_LENGTH = 16;
const NAME_LENGTH = 2;

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
})
export class StartComponent implements OnInit {
  roomConfig: RoomConfig = {
    roomInput: '',
    nameInput: this.chatSocketService.userName,
  };
  isDisabled: boolean = true;
  showNameRequired: boolean = false;
  showRoomRequired: boolean = false;
  copied: boolean = false;
  nameTaken: boolean = false;

  constructor(
    private router: Router,
    private chatSocketService: ChatSocketService,
    private skribbleSocketService: SkribbleSocketService,
    private randomStringService: RandomStringService,
    public firebaseService: FirebaseService,
    public textService: TextService,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.roomConfig.roomInput =
      this.randomStringService.generateRandomString(ROOM_ID_LENGTH);
  }

  switchRoutes(): void {
    const currentRoute = this.router.url;
    this.router.navigate([currentRoute === '/skribble' ? '/' : '/skribble']);
  }

  onInputChange(event: Event, property: keyof RoomConfig): void {
    const target = event.target as HTMLInputElement;
    this.roomConfig[property] = target.value;

    // Reset validation messages if applicable
    if (property === 'nameInput' && this.showNameRequired) {
      this.showNameRequired = target.value.length >= NAME_LENGTH ? false : true;
    } else if (property === 'roomInput' && this.showRoomRequired) {
      this.showRoomRequired =
        target.value.length == ROOM_ID_LENGTH ? false : true;
    }
  }

  joinRoom(): void {
    const currentRoute = this.router.url;

    if (this.roomConfig.nameInput.length >= NAME_LENGTH) {
      if (this.roomConfig.roomInput.length == ROOM_ID_LENGTH) {
        if (currentRoute === '/skribble') {
          this.router.navigate([`/skribble/${this.roomConfig.roomInput}`]);
          this.skribbleSocketService.setRoomConfig(
            this.roomConfig.roomInput,
            this.roomConfig.nameInput
          );
        } else {
          this.router.navigate([`/chat/${this.roomConfig.roomInput}`]);
          this.chatSocketService.setRoomConfig(
            this.roomConfig.roomInput,
            this.roomConfig.nameInput
          );
        }
      } else {
        this.showRoomRequired = true;
      }
    } else {
      this.showNameRequired = true;
    }
  }

  toggleRoomInput(): void {
    this.isDisabled = !this.isDisabled;
    this.roomConfig.roomInput = this.isDisabled
      ? this.randomStringService.generateRandomString(ROOM_ID_LENGTH)
      : '';
    this.showRoomRequired = false;
  }

  copyToClipboard(): void {
    this.clipboard.copy(this.roomConfig.roomInput);
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 1000);
  }
}
