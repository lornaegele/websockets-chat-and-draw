import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000/chat';

enum SocketEvent {
  CONNECT = 'connect',
  RECEIVE_MESSAGE = 'receive-message',
  SEND_MESSAGE = 'send-message',
  SEND_IS_TYPING = 'send-is-typing',
  RECEIVE_IS_TYPING = 'receive-is-typing',
  JOIN_ROOM = 'join-room',
  USER_JOINED = 'user-joined',
  USER_LEFT = 'user-left',
  LEAVE_ROOM = 'leave-room',
}

@Injectable({
  providedIn: 'root',
})
export class ChatSocketService {
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
  }

  getRoomInput(): string {
    return this.roomId;
  }

  initializeSocket(): void {
    this.socket = io(SOCKET_URL);

    this.socket.on(SocketEvent.CONNECT, () => {
      this.userId = this.socket.id;
    });

    // Add error handling for socket connection failures or other possible issues
    this.socket.on('error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnectSocket(): void {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  receiveMessagesFromSocket(
    callback: (
      message: string,
      userName: string,
      date: Date,
      userId: string
    ) => void
  ): void {
    this.socket.on(
      SocketEvent.RECEIVE_MESSAGE,
      (message, userName, date, userId) => {
        callback(message, userName, date, userId);
      }
    );
  }

  sendToSocket(message: string, room: string, date: Date): void {
    this.socket.emit(
      SocketEvent.SEND_MESSAGE,
      message,
      this.userName,
      room,
      date,
      this.userId
    );
  }

  sendIsTypingSocket(room: string, date: Date, isTyping: boolean): void {
    this.socket.emit(
      SocketEvent.SEND_IS_TYPING,
      this.userName,
      room,
      date,
      isTyping,
      this.userId
    );
  }

  receiveIsTypingSocket(
    callback: (
      userName: string,
      date: Date,
      isTyping: boolean,
      userId: string
    ) => void
  ): void {
    this.socket.on(
      SocketEvent.RECEIVE_IS_TYPING,
      (userName, date, isTyping, userId) => {
        callback(userName, date, isTyping, userId);
      }
    );
  }

  joinRoomInSocket(room: string, userName: string): void {
    this.socket.emit(SocketEvent.JOIN_ROOM, room, userName);
    localStorage.setItem('userName', userName);
  }

  userJoinedRoomSocket(callback: (userName: string) => void): void {
    this.socket.on(SocketEvent.USER_JOINED, (userName) => {
      callback(userName);
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
}
