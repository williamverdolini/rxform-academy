import { CommonModule } from '@angular/common';
import { Component, inject, signal, } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
import { map, merge, Observable, switchMap, tap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataReaderService } from '../../services/data-reader.service';

@Component({
  selector: 'app-form-warnings',
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
  templateUrl: './form-warnings.component.html',
})
export class FormWarningsComponent {
  #fb = inject(FormBuilder);
  #dr = inject(DataReaderService);
  protected titles: string[] = ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'];
  protected errorMessages = signal<string[]>([]);
  protected waningMessages = signal<string[]>([]);

  private checkDatesValidator = (group: AbstractControl) => {
    let fromDate = group.get('fromDate')?.value;
    let toDate = group.get('toDate')?.value;
    return !!fromDate && toDate > fromDate ? null : { toDateIsPreviousThanFromDate: true }
  }

  private usernameCheckValidator: AsyncValidatorFn = (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
    return timer(100).pipe(
      switchMap(() => {
        return this.#dr.isValidNickname(control.value);
      }),
      tap(_ => this.waningMessages.set(!!control.value && control.value.length < 8 ? ["userNameLessThan8Char"] : [])),
      map(res => !res.valid ? { usernameAlreadyExists: { suggestions: res.suggestions} } : null)
    );
  }

  protected form = this.#fb.group({
    title: new FormControl<string>('', { validators: [Validators.required] }),
    completed: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] }),
    period: this.#fb.group(
      {
        fromDate: new FormControl<Date | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
        toDate: new FormControl<Date | null>({ value: null, disabled: true }, { validators: [Validators.required] })
      },
      {
        validators: [this.checkDatesValidator]
      }),
    username: new FormControl<string>('', { validators: [Validators.required], asyncValidators: [this.usernameCheckValidator] }),
  });

  constructor() {
    this.form.controls.completed.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe((completed) => {
      this.form.controls.period[completed ? 'enable' : 'disable']();
    });

    merge(this.form.statusChanges, this.form.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  protected updateErrorMessage() {
    const messages: string[] = [];
    const warns: string[] = [];
    if (this.form.controls.title.hasError('required')) {
      messages.push('Title is required');
    }
    if (this.form.controls.period.hasError('toDateIsPreviousThanFromDate')) {
      // this.form.controls.period.errors
      messages.push('To Date must be after From Date');
    }
    if (this.form.controls.period.controls.fromDate.hasError('required')) {
      messages.push('From Date is required');
    }
    if (this.form.controls.period.controls.toDate.hasError('required')) {
      messages.push('To Date is required');
    }
    if (this.form.controls.username.hasError('required')) {
      messages.push('Username is required');
      this.waningMessages.set([]);
    }
    if (this.form.controls.username.hasError('usernameAlreadyExists')) {
      messages.push(`Username already exists. You could use: ${this.form.controls.username.getError('usernameAlreadyExists')?.suggestions.join(', ')}`);
    }
    this.errorMessages.set(messages);
  }

  protected htmlCode = `      @if (form.dirty && waningMessages().length > 0) {
      <div class="flex-column" role="alert">
        <mat-hint style="color: darkgoldenrod;">
          Warning:
          <ol>
            @for (item of waningMessages(); track item) {
            <li>{{item}}</li>
            }
          </ol>
        </mat-hint>
      </div>
      }
`;

  protected tsCode = `  private usernameCheckValidator: AsyncValidatorFn = (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
    return timer(100).pipe(
      switchMap(() => {
        return this.#dr.isValidNickname(control.value);
      }),
      map(res => !res.valid ? { usernameAlreadyExists: { suggestions: res.suggestions} } :
        control.value.length < 8 ? { userNameLessThan8Char: { warning : true } } : null)
    );
  }

  ...

  protected form = this.#fb.group({
    title: new FormControl<string>('', { validators: [Validators.required] }),
    completed: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] }),
    ...
    username: new FormControl<string>('', { validators: [Validators.required, this.usernameCheckValidator] }), // look where is the async validator (why? if required is false, the async validators are not called)
  });


  ...

  constructor() {
    merge(this.form.statusChanges, this.form.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  protected updateErrorMessage() {
    const messages: string[] = [];
    const warns: string[] = [];

    ...

    if (this.form.controls.username.hasError('userNameLessThan8Char')) {
      delete this.form.controls.username.errors!['userNameLessThan8Char'];
      this.form.controls.username.updateValueAndValidity(); // this is BAD!!
      warns.push(\`Username should be at least 8 characters long\`);
    }

    this.waningMessages.set(warns);
  }
`;

  protected tsCode2 = `  private usernameCheckValidator: AsyncValidatorFn = (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
    return timer(100).pipe(
      switchMap(() => {
        return this.#dr.isValidNickname(control.value);
      }),
      tap(_ => this.waningMessages.set(!!control.value && control.value.length < 8 ? ["userNameLessThan8Char"] : [])),
      map(res => !res.valid ? { usernameAlreadyExists: { suggestions: res.suggestions} } : null)
    );
  }

  ...

  protected form = this.#fb.group({
    title: new FormControl<string>('', { validators: [Validators.required] }),
    completed: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] }),
    ...
    username: new FormControl<string>('', { validators: [Validators.required], asyncValidators: [this.usernameCheckValidator] }),
  });

  ...

  constructor() {
    merge(this.form.statusChanges, this.form.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  protected updateErrorMessage() {
    const messages: string[] = [];
    const warns: string[] = [];

    ...

    if (this.form.controls.username.hasError('userNameLessThan8Char')) {
      delete this.form.controls.username.errors!['userNameLessThan8Char'];
      this.form.controls.username.updateValueAndValidity();
      warns.push(\`Username should be at least 8 characters long\`);
    }
    this.errorMessages.set(messages);
  }
`;
}

