
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UnreadMessagesService {
  private count = new BehaviorSubject<number>(0);
  public count$ = this.count.asObservable();

  updateCount(newCount: number) {
    this.count.next(newCount);
  }

  incrementCount() {
    this.count.next(this.count.value + 1);
  }

  resetCount() {
    this.count.next(0);
  }
}