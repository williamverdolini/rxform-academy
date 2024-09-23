import { CommonModule } from '@angular/common';
import { Component, inject, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dynamic-control',
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
  templateUrl: './dynamic-control.component.html',
})
export class DynamicControlComponent {
  #fb = inject(FormBuilder);

  #automaticBehavior = false;
  protected titles: string[] = ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'];

  protected form = this.#fb.group({
    title: new FormControl<string>('', { validators: [Validators.required] }),
    completed: new FormControl<boolean>(false, { validators: [Validators.required] }),
    period: this.#fb.group({
      fromDate: new FormControl<Date | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
      toDate: new FormControl<Date | null>({ value: null, disabled: true }, { validators: [Validators.required] })
    }),
    nickname: new FormControl<string>(''),
  });

  constructor() {
    this.form.controls.completed.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe((completed) => {
      if (this.#automaticBehavior) {
        this.form.controls.period[completed ? 'enable' : 'disable']();
      }
    });
  }

  protected togglePeriod() {
    const enabled = this.form.controls.period.enabled;
    this.form.controls.period[!enabled ? 'enable' : 'disable']();
  }

  protected toggleAutomaticPeriod() {
    this.#automaticBehavior = !this.#automaticBehavior;
  }

  protected htmlCode = `      <div class="flex-row">
        <div>
          <mat-label for="completed">Course completed</mat-label>
          <mat-checkbox name="completed" formControlName="completed"></mat-checkbox>
        </div>
        <div>
          <button mat-button (click)="togglePeriod()">switch Period Enable</button>
          <button mat-button (click)="toggleAutomaticPeriod()">Automatic</button>
        </div>
      </div>
      @if (form.get('completed')?.value) {
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
      }
`;
  protected tsCode = `  #automaticBehavior = false;
  protected titles: string[] = ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'];

  protected form = this.#fb.group({
    title: new FormControl<string>('', { validators: [Validators.required] }),
    completed: new FormControl<boolean>(false, { validators: [Validators.required] }),
    period: this.#fb.group({
      fromDate: new FormControl<Date | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
      toDate: new FormControl<Date | null>({ value: null, disabled: true }, { validators: [Validators.required] })
    }),
    nickname: new FormControl<string>(''),
  });

  constructor() {
    this.form.controls.completed.valueChanges.pipe( // <-- This we're really reactive!!
      takeUntilDestroyed()
    ).subscribe((completed) => {
      if (this.#automaticBehavior) {
        this.form.controls.period[completed ? 'enable' : 'disable']();
      }
    });
  }

  protected togglePeriod() {
    const enabled = this.form.controls.period.enabled;
    this.form.controls.period[!enabled ? 'enable' : 'disable']();
  }

  protected toggleAutomaticPeriod() {
    this.#automaticBehavior = !this.#automaticBehavior;
  }
`;
}
