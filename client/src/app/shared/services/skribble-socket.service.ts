import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Stroke } from '../interfaces/Stroke';

const SOCKET_URL = 'http://localhost:3000/skribble';

enum SocketEvent {
  SEND_DRAWING = 'send-drawing',
  RECEIVE_DRAWING = 'receive-drawing',
  SEND_RESET_DRAWING = 'send-resetdrawing',
  RECEIVE_RESET_DRAWING = 'receive-resetdrawing',
  CONNECT = 'connect',
  JOIN_ROOM = 'join-room',
  ROOM_CREATED = 'room-created',
  USER_JOINED = 'user-joined',
  USER_LEFT = 'user-left',
  LEAVE_ROOM = 'leave-room',
}

@Injectable({
  providedIn: 'root',
})
export class SkribbleSocketService {
  private socket!: Socket;
  public userId: string = '';
  public userName: string = '';
  public roomId: string = '';

  constructor() {
    // Load the userName from localStorage, if available
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      this.userName = storedUserName;
    }
  }

  setRoomConfig(roomId: string, name: string) {
    this.roomId = roomId;
    this.userName = name;

    // Save the userName in localStorage
    localStorage.setItem('userName', name);
  }

  getRoomInput(): string {
    return this.roomId;
  }
  // Drawing functionallity
  sendDrawingSocket(stroke: Stroke): void {
    this.socket.emit(
      SocketEvent.SEND_DRAWING,
      this.roomId,
      this.userName,
      stroke
    );
  }

  receiveDrawingFromSocket(
    callback: (userName: string, stroke: Stroke) => void
  ): void {
    this.socket.on(SocketEvent.RECEIVE_DRAWING, (userName, stroke) => {
      callback(userName, stroke);
    });
  }

  // Reset functionallity
  sendResetDrawingSocket(): void {
    this.socket.emit(
      SocketEvent.SEND_RESET_DRAWING,
      this.roomId,
      'clearCanvas'
    );
  }

  receiveResetDrawingSocket(callback: (message: string) => void): void {
    this.socket.on(SocketEvent.RECEIVE_RESET_DRAWING, (message: string) => {
      callback(message);
    });
  }

  initializeSocket(): void {
    this.socket = io(SOCKET_URL);

    this.socket.on(SocketEvent.CONNECT, () => {
      this.userId = this.socket.id;
    });

    // error handling for socket connection failures or other possible issues
    this.socket.on('error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnectSocket(): void {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  joinRoomInSocket(room: string, userName: string): void {
    this.socket.emit(SocketEvent.JOIN_ROOM, room, userName);
  }

  userJoinedRoomSocket(callback: (userName: string) => void): void {
    this.socket.on(SocketEvent.USER_JOINED, (userName) => {
      callback(userName);
    });
  }

  createdRoomSocket(callback: () => void): void {
    this.socket.on(SocketEvent.ROOM_CREATED, () => {
      callback();
    });
  }

  userLeftRoomSocket(callback: (userName: string) => void): void {
    this.socket.on(SocketEvent.USER_LEFT, (userName) => {
      callback(userName);
    });
  }

  leaveRoomSocket(): void {
    this.socket.emit(SocketEvent.LEAVE_ROOM, this.roomId, this.userName);
  }
  leaveRoomFromRouteSocket(userName: string, roomId: string): void {
    this.socket.emit(SocketEvent.LEAVE_ROOM, roomId, userName);
  }
}
