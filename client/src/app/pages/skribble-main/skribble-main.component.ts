import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { User, HistoryArray } from 'src/app/shared/interfaces';
import {
  SkribbleSocketService,
  FirebaseService,
} from 'src/app/shared/services';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-skribble-main',
  templateUrl: './skribble-main.component.html',
})
export class SkribbleMainComponent implements OnInit, OnDestroy {
  roomId = this.skribbleSocketService.userName;
  nameInput = '';
  historyArray: HistoryArray[] = [];
  strokeWidth: number = 5;
  selectedColor: string = '#000000';
  users: User[] = [];
  name: string = '';
  nameTaken: boolean = false;

  @ViewChild('drawingArea') drawingAreaRef!: ElementRef<HTMLDivElement>;

  private routeSubscription!: Subscription;
  private firebaseSubscription!: Subscription;

  constructor(
    public skribbleSocketService: SkribbleSocketService,
    private firebaseService: FirebaseService,

    private route: ActivatedRoute
  ) {}

  retrieveFirebasedata() {
    // Subscribe to the Firebase data stream and store it in the 'users' property
    this.firebaseSubscription = this.firebaseService
      .getDataFromFirebase(this.roomId)
      .subscribe({
        next: (data) => {
          if (data) {
            this.users = Object.values(data);
          }
          console.log(this.users);
        },
        error: (error) => {
          console.error('Error retrieving data from Firebase:', error);
        },
      });
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.roomId = params.get('roomId') || '';
      if (this.roomId.trim() !== '') {
        this.skribbleSocketService.roomId = this.roomId;
        this.skribbleSocketService.joinRoomInSocket(
          this.roomId,
          this.skribbleSocketService.userName
        );
      }
    });
    console.log('addUserToFirebase2');
    this.firebaseService.addUserToFirebase(
      {
        name: this.skribbleSocketService.userName,
      },
      this.roomId,
      this.openFormModal
    );
    this.retrieveFirebasedata();
    this.setupSocketListeners();
  }

  onConfirmClick = () => {
    this.skribbleSocketService.setRoomConfig(this.roomId, this.nameInput);
    this.firebaseService.addUserToFirebase(
      {
        name: this.nameInput,
      },
      this.roomId,
      () => {
        // Callback function executed after addUserToFirebase completes
        this.nameTaken = true;
        console.log(this.nameTaken);

        if (!this.nameTaken) {
          this.closeFormModal(); // This will only be called if nameTaken is false
        }
        this.setupUserJoinedLeftRoomSocketListeners();
      }
    );
  };

  onInputChange = (event: Event) => {
    this.nameInput = (event.target as HTMLInputElement).value;
  };

  openFormModal() {
    const dialogElement = document.getElementById(
      'form_modal'
    ) as HTMLDialogElement;

    dialogElement?.showModal();
  }
  closeFormModal() {
    const dialogElement = document.getElementById(
      'form_modal'
    ) as HTMLDialogElement;

    dialogElement?.close();
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.firebaseSubscription.unsubscribe();
  }

  onStrokeWidthChange(strokeWidth: number) {
    console.log(strokeWidth);

    this.strokeWidth = strokeWidth;
  }

  onSelectedColorChange(selectedColor: string) {
    this.selectedColor = selectedColor;
  }

  setupSocketListeners(): void {
    this.skribbleSocketService.initializeSocket();
    this.setupUserJoinedLeftRoomSocketListeners();
  }

  setupUserJoinedLeftRoomSocketListeners(): void {
    this.skribbleSocketService.userJoinedRoomSocket((userName: string) => {
      this.historyArray = [
        ...this.historyArray,
        { message: `${userName} joined`, date: new Date() },
      ];
    });

    this.skribbleSocketService.createdRoomSocket(() => {
      this.historyArray = [
        ...this.historyArray,
        { message: `You created this room`, date: new Date() },
      ];
    });

    this.skribbleSocketService.userLeftRoomSocket((userName: string) => {
      this.historyArray = [
        ...this.historyArray,
        { message: `${userName} left`, date: new Date() },
      ];
      this.firebaseService.removeUserFromFirebase(
        {
          name: this.skribbleSocketService.userName,
        },
        this.roomId
      );
    });
  }
}
