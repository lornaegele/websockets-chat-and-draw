import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import {
  chatroomText,
  skribbleText,
} from 'src/app/shared/constants/defaultText';
import { DefaultText } from '../interfaces/DefautText';

@Injectable({
  providedIn: 'root',
})
export class TextService {
  text: DefaultText = chatroomText;
  oppositeText: DefaultText = skribbleText;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateTextBasedOnRoute(event.url);
      }
    });
  }

  private updateTextBasedOnRoute(url: string) {
    if (url.includes('skribble')) {
      this.text = skribbleText;
      this.oppositeText = chatroomText;
    } else {
      this.text = chatroomText;
      this.oppositeText = skribbleText;
    }
  }
}
