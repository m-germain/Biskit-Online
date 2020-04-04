import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { R3ExpressionFactoryMetadata } from '@angular/compiler/src/render3/r3_factory';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: any;
  readonly uri = "ws://192.168.1.89:3000";

  constructor() {
    this.socket = io(this.uri);
  }

  listen(eventName: string) {
    return new Observable((Subscriber) => {
      this.socket.on(eventName, (data) => {
        Subscriber.next(data);
      })
    })
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  disconect() {
    return new Observable((Subscriber) => {
      this.socket.disconect;
    })
  }
}
