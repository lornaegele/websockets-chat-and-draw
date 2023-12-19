import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationStart, ActivatedRoute } from '@angular/router';
import {
  ChatSocketService,
  FirebaseService,
  SkribbleSocketService,
  TextService,
} from 'src/app/shared/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnDestroy {
  private routerSubscription: any;

  constructor(
    private chatSocketService: ChatSocketService,
    private skribbleSocketService: SkribbleSocketService,
    public textService: TextService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.routerSubscription = this.router.events.subscribe((event) => {
      const roomId = this.activatedRoute.snapshot.params['roomId'];
      if (event instanceof NavigationStart) {
        this.skribbleSocketService.leaveRoomFromRouteSocket(
          this.chatSocketService.userName,
          roomId
        );
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  leaveRoom(): void {
    const currentRoute = this.router.url;

    if (currentRoute.includes('/skribble')) {
      this.skribbleSocketService.leaveRoomSocket();
      this.router.navigate(['/skribble']);
    } else {
      this.chatSocketService.leaveRoomSocket();
      this.router.navigate(['/']);
    }
  }
}
