import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/database';
import { environment } from 'src/environments/environment';
import { User, UserExistsCallback } from '../interfaces';
import { Observable } from 'rxjs';
import { SkribbleSocketService } from './skribble-socket.service';

const API_ROUTE = 'data/users';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private database: firebase.database.Database;

  private getRoomDataRef(roomId: string): firebase.database.Reference {
    return this.database.ref(`${API_ROUTE}/${roomId}`);
  }

  async addUserToFirebase(
    data: User,
    roomId: string,
    userExistsCallback?: UserExistsCallback,
    userDoesntExistCallback?: UserExistsCallback
  ): Promise<void> {
    if (!roomId) {
      console.error('Room ID is not available. Cannot add user to Firebase.');
      return;
    }

    try {
      const roomDataRef = this.getRoomDataRef(roomId);
      const snapshot = await roomDataRef
        .orderByChild('name')
        .equalTo(data.name)
        .once('value');
      if (!snapshot.exists()) {
        roomDataRef.push(data);
        if (userDoesntExistCallback) {
          userDoesntExistCallback();
        }
      } else {
        console.log('User already exists:', data.name);
        if (userExistsCallback) {
          userExistsCallback();
        }
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
    }
  }

  async removeUserFromFirebase(data: User, roomId: string): Promise<void> {
    if (!roomId) {
      console.error('Room ID is not available. Cannot add user to Firebase.');
      return;
    }

    try {
      const roomDataRef = this.getRoomDataRef(roomId);
      const snapshot = await roomDataRef
        .orderByChild('name')
        .equalTo(data.name)
        .once('value');
      if (snapshot.exists()) {
        const userKey = Object.keys(snapshot.val())[0];
        roomDataRef.child(userKey).remove();
      } else {
        console.log('User does not exist:', data.name);
      }
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }

  // Modified method to retrieve data from Firebase as an Observable
  getDataFromFirebase(roomId: string): Observable<any> {
    return new Observable((observer) => {
      const roomDataRef = this.getRoomDataRef(roomId);

      const onDataChange = (snapshot: firebase.database.DataSnapshot) => {
        observer.next(snapshot.val());
      };

      roomDataRef.on('value', onDataChange);

      // Return a function to remove the listener when the Observable is unsubscribed
      return () => roomDataRef.off('value', onDataChange);
    });
  }

  constructor(public skribbleSocketService: SkribbleSocketService) {
    firebase.initializeApp(environment.firebaseConfig);
    this.database = firebase.database();
  }
}
