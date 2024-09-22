import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Highlight } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DataReaderService } from '../services/data-reader.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-async-initialization',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTabsModule,
    Highlight,
    HighlightLineNumbers
  ],
  templateUrl: './async-initialization.component.html'
})
export class AsyncInitializationComponent implements OnInit {
  #dataService = inject(DataReaderService);
  #fb = inject(FormBuilder);
  protected errors = signal<any>({})

  protected titles: string[] = [];
  protected form: FormGroup<{
    titolo: FormControl<string>;
    nome: FormControl<string | null>;
    cognome: FormControl<string | null>;
    nicknane: FormControl<string | null>;
  }>;

  protected formProtocollo: FormGroup<{
    prefix: FormControl<string>;
    counter: FormControl<string>;
    suffix: FormControl<string | null>;
  }>;

  async ngOnInit() {
    const { initialTitle, titles } = await this.#dataService.readData();
    const { counter } = await this.#dataService.readCounter();
    this.titles = titles;

    this.form = this.#fb.group({
      titolo: new FormControl<string>(initialTitle, { nonNullable: true, validators: [Validators.required] }),
      nome: new FormControl<string>('', { validators: [Validators.required] }),
      cognome: new FormControl<string>('', { validators: [Validators.required] }),
      nicknane: new FormControl<string>(''),
    });

    this.formProtocollo = this.#fb.group({
      prefix: new FormControl<string>('PRE', { nonNullable: true, validators: [Validators.required] }),
      counter: new FormControl<string>(counter, { nonNullable: true, validators: [Validators.required] }),
      suffix: new FormControl<string | null>(null)
    });
  }

  protected async resetFormProtocollo() {
    const { counter } = await this.#dataService.readCounter();
    this.formProtocollo.reset({
      counter: counter,
    });
  }

  protected htmlCode = `      <div [formGroup]="formProtocollo" class="flex-column flex-1">
        <div class="flex-column">
          <mat-form-field>
            <mat-label for="prefix">Prefisso</mat-label>
            <input name="prefix" formControlName="prefix" type="text" matInput/>
          </mat-form-field>
        </div>
        <div class="flex-column">
          <mat-form-field>
            <mat-label for="counter">Contatore</mat-label>
            <input name="counter" formControlName="counter" type="text" matInput/>
          </mat-form-field>
        </div>
        <div class="flex-column">
          <mat-form-field>
            <mat-label for="suffix">Suffisso</mat-label>
            <input name="suffix" formControlName="suffix" type="text" matInput/>
          </mat-form-field>
        </div>
        <div>
          <button mat-button (click)="resetFormProtocollo()">Reset</button>
        </div>
      </div>
`;
protected tsCode = `  async ngOnInit() {
    const { counter } = await this.#dataService.readCounter();

    this.formProtocollo = this.#fb.group({
      prefix: new FormControl<string>('PRE', { nonNullable: true, validators: [Validators.required] }),
      counter: new FormControl<string>(counter, { nonNullable: true, validators: [Validators.required] }),
      suffix: new FormControl<string | null>(null)
    });
  }

  protected async resetFormProtocollo() {
    const { counter } = await this.#dataService.readCounter();
    this.formProtocollo.reset({
      counter: counter,
    });
  }
`;

}
