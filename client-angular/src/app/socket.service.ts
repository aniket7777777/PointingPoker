import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import * as io from 'socket.io-client';
import {HttpClient, HttpHeaders} from '@angular/common/http';

const uri = 'http://localhost:5000/file';
const SERVER_URL = 'ws://localhost:5000';
const UPLOAD_URL = uri + '/upload';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;
  private roomId: string;
  private username: string;

  constructor(private http: HttpClient) {
    this.initSocket();
  }

  private initSocket(): void {
    this.socket = io.connect(SERVER_URL, {transports: ['websocket'], path: '/backend'});
  }

  public send(event: string, message: any): void {
    this.socket.emit(event, message);
  }

  public onEvent(event: string): Observable<any> {
    return new Observable<Event>(observer => {
      this.socket.on(event, (data) => observer.next(data));
    });
  }

  upload(file: any, username: string) {
    const formData = new FormData();
    formData.append('upload', file, file.name);
    return this.http.post(UPLOAD_URL, formData, {headers: {
        username
      }});
  }

  setRoomId(roomId: string) {
    this.roomId = roomId;
  }

  getRoomId(): string {
    return this.roomId;
  }

  setUsername(value: string) {
    this.username = value;
  }

  getUsername(): string {
    return this.username;
  }
}
