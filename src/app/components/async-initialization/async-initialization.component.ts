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
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
    title: FormControl<string>;
    firstName: FormControl<string | null>;
    lastName: FormControl<string | null>;
    nickname: FormControl<string | null>;
  }>;

  protected formProtocol: FormGroup<{
    prefix: FormControl<string>;
    counter: FormControl<string>;
    suffix: FormControl<string | null>;
  }>;

  async ngOnInit() {
    const { initialTitle, titles } = await this.#dataService.readData();
    const { counter } = await this.#dataService.readCounter();
    this.titles = titles;

    this.form = this.#fb.group({
      title: new FormControl<string>(initialTitle, { nonNullable: true, validators: [Validators.required] }),
      firstName: new FormControl<string>('', { validators: [Validators.required] }),
      lastName: new FormControl<string>('', { validators: [Validators.required] }),
      nickname: new FormControl<string>(''),
    });

    this.formProtocol = this.#fb.group({
      prefix: new FormControl<string>('PRE', { nonNullable: true, validators: [Validators.required] }),
      counter: new FormControl<string>(counter, { nonNullable: true, validators: [Validators.required] }),
      suffix: new FormControl<string | null>(null)
    });
  }

  protected async resetFormProtocol() {
    const { counter } = await this.#dataService.readCounter();
    this.formProtocol.reset({
      counter: counter,
    });
  }

  protected htmlCode = `
        <div [formGroup]="formProtocol" class="flex-column flex-1">
        <div class="flex-column">
          <mat-form-field>
            <mat-label for="prefix">Prefix</mat-label>
            <input name="prefix" formControlName="prefix" type="text" matInput/>
          </mat-form-field>
        </div>
        <div class="flex-column">
          <mat-form-field>
            <mat-label for="counter">Counter</mat-label>
            <input name="counter" formControlName="counter" type="text" matInput/>
          </mat-form-field>
        </div>
        <div class="flex-column">
          <mat-form-field>
            <mat-label for="suffix">Suffix</mat-label>
            <input name="suffix" formControlName="suffix" type="text" matInput/>
          </mat-form-field>
        </div>
        <div>
          <button mat-button (click)="resetFormProtocol()">Reset</button>
        </div>
      </div>
`;
  protected tsCode = `  async ngOnInit() {
    const { counter } = await this.#dataService.readCounter();

    this.formProtocol = this.#fb.group({
      prefix: new FormControl<string>('PRE', { nonNullable: true, validators: [Validators.required] }),
      counter: new FormControl<string>(counter, { nonNullable: true, validators: [Validators.required] }),
      suffix: new FormControl<string | null>(null)
    });
  }

  protected async resetFormProtocol() {
    const { counter } = await this.#dataService.readCounter();
    this.formProtocol.reset({
      counter: counter,
    });
  }
`;

}
