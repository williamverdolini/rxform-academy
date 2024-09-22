import { Injectable } from '@angular/core';

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
          initialTitle: 'Sig.',
          titles: ['Sig.', 'Sig.ra', 'Dott.', 'Dott.ssa'],
        });
      }, 2000);
    });
  }

  #counter = 0;
  async readCounter(): Promise<{counter: string}> {
    return new Promise<{counter: string}>((resolve) => {
      setTimeout(() => {
        resolve({
          counter: ''+(++this.#counter),
        });
      }, 500);
    });
  }
}
