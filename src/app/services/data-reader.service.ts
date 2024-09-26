import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Config {
  initialTitle: string;
  titles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataReaderService {

  async readData(): Promise<Config> {
    return new Promise<Config>((resolve) => {
      setTimeout(() => {
        resolve({
          initialTitle: 'Mr.',
          titles: ['Mr.', 'Mrs.', 'Dr.', 'Ms.'],
        });
      }, 2000);
    });
  }

  #counter = 0;
  async readCounter(): Promise<{ counter: string }> {
    return new Promise<{ counter: string }>((resolve) => {
      setTimeout(() => {
        resolve({
          counter: '' + (++this.#counter),
        });
      }, 500);
    });
  }

  async searchSelection(search?: string): Promise<{ data: { id: string, title: string }[], total: number }> {
    return new Promise<{ data: { id: string, title: string }[], total: number }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            { id: '1', title: 'First' },
            { id: '2', title: 'Second' },
            { id: '3', title: 'Third' },
            { id: '4', title: 'Fourth' },
            { id: '5', title: 'Fifth' },
          ],
          total: 5,
        });
      }, 1000);
    });
  }

  isValidNickname(search?: string): Observable<{valid: boolean, suggestions: string[]}> {
    // return observable of true after 200 ms
    return new Observable<{valid: boolean, suggestions: string[]}>(subscriber => {
      setTimeout(() => {
        ["pippo", "pluto", "paperino"].includes(search?.toLowerCase() ?? '') ?
          subscriber.next({valid: false, suggestions: [search+"123", search+"_bis"]}) :
          subscriber.next({valid: true, suggestions: []});
        subscriber.complete();
      }, 200);
    });
  }
}
