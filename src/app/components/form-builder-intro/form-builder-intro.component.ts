import { CommonModule } from '@angular/common';
import { Component, inject, } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Highlight } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-form-builder-intro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatTabsModule,
    Highlight,
    HighlightLineNumbers
  ],
  templateUrl: './form-builder-intro.component.html',
})
export class FormBuilderIntroComponent {
  #fb = inject(FormBuilder);

  protected titles: string[] = ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'];
  protected form = this.#fb.group({
      title: new FormControl<string>('', { validators: [Validators.required] }),
      // completed: new FormControl<boolean>(false),
      completed: [ false ],
      period: this.#fb.group({
        fromDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
        toDate: new FormControl<Date | null>(null, { validators: [Validators.required] })
      }),
      nickname: new FormControl<string>(''),
    });

  protected htmlCode = `    <div [formGroup]="form" class="flex-column flex-1">
      <mat-form-field>
        <mat-label for="title">Lesson Title</mat-label>
        <input type="text" name="title" matInput formControlName="title" [matAutocomplete]="auto">
        <mat-autocomplete #auto="matAutocomplete">
          @for (option of titles; track option) {
            <mat-option [value]="option">{{option}}</mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>
      <div class="flex-column">
        <div>
          <mat-label for="completed">Course completed</mat-label>
          <mat-checkbox name="completed" formControlName="completed"></mat-checkbox>
        </div>
      </div>
      <mat-label>Period</mat-label>
      <div class="flex-row" formGroupName="period">
        <mat-form-field class="flex-1">
          <mat-label for="fromDate">From Date</mat-label>
          <input name="fromDate" formControlName="fromDate" [matDatepicker]="pickerFD" matInput/>
          <mat-datepicker-toggle matIconSuffix [for]="pickerFD"></mat-datepicker-toggle>
          <mat-datepicker #pickerFD></mat-datepicker>
        </mat-form-field>
        <mat-form-field class="flex-1 m-l-1">
          <mat-label for="toDate">To Date</mat-label>
          <input name="toDate" formControlName="toDate" [matDatepicker]="pickerTD" matInput/>
          <mat-datepicker-toggle matIconSuffix [for]="pickerTD"></mat-datepicker-toggle>
          <mat-datepicker #pickerTD></mat-datepicker>
        </mat-form-field>
      </div>
      <div class="flex-column">
        <mat-form-field>
          <mat-label for="nickname">Nickname</mat-label>
          <input name="nickname" formControlName="nickname" type="text" matInput/>
        </mat-form-field>
      </div>
      <div class="example-button-row">
        <button mat-button (click)="form.reset()">Reset</button>
        <button mat-button mat-flat-button [disabled]="form.invalid">Save</button>
      </div>
    </div>
`;
  protected tsCode = `  #fb = inject(FormBuilder);

  protected titles: string[] = ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'];
  protected form = this.#fb.group({
      title: new FormControl<string>('', { validators: [Validators.required] }),
      // different syntax, less verbose, less clear, same result
      // completed: new FormControl<boolean>(false, { validators: [Validators.required] }),
      completed: [false, Validators.required],
      period: this.#fb.group({
        fromDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
        toDate: new FormControl<Date | null>(null, { validators: [Validators.required] })
      }),
      nickname: new FormControl<string>(''),
    });
`;
}
