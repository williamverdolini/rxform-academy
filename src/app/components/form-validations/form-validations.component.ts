import { CommonModule } from '@angular/common';
import { Component, inject, signal, } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataReaderService } from '../../services/data-reader.service';
import { UserNameAsyncValidator } from './username-check-validator';

@Component({
  selector: 'app-form-validations',
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
  templateUrl: './form-validations.component.html',
})
export class FormValidationsComponent {
  #fb = inject(FormBuilder);
  #userNameValidator = inject(UserNameAsyncValidator);

  protected titles: string[] = ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'];
  protected errorMessages = signal<string[]>([]);

  private checkDatesValidator = (group: AbstractControl) => {
    let fromDate = group.get('fromDate')?.value;
    let toDate = group.get('toDate')?.value;
    return !!fromDate && toDate > fromDate ? null : { toDateIsPreviousThanFromDate: true }
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
    nickname: new FormControl<string>('', { validators: [Validators.required], asyncValidators: [this.#userNameValidator.getValidator()] }),
    username: new FormControl<string>('', { validators: [Validators.required], asyncValidators: [this.#userNameValidator.validator] }),
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
    if (this.form.controls.title.hasError('required')) {
      messages.push('Title is required');
    }
    if (this.form.controls.period.hasError('toDateIsPreviousThanFromDate')) {
      messages.push('To Date must be after From Date');
    }
    if (this.form.controls.period.controls.fromDate.hasError('required')) {
      messages.push('From Date is required');
    }
    if (this.form.controls.period.controls.toDate.hasError('required')) {
      messages.push('To Date is required');
    }
    if (this.form.controls.nickname.hasError('required')) {
      messages.push('Nickname is required');
    }
    if (this.form.controls.nickname.hasError('usernameAlreadyExists')) {
      messages.push(`Nickname already exists. You could use: ${this.form.controls.nickname.getError('usernameAlreadyExists')?.suggestions.join(', ')}`);
    }
    if (this.form.controls.username.hasError('usernameAlreadyExists')) {
      messages.push(`Username already exists. You could use: ${this.form.controls.nickname.getError('usernameAlreadyExists')?.suggestions.join(', ')}`);
    }
    this.errorMessages.set(messages);
  }

  protected htmlCode = `    <div [formGroup]="form" aria-label="form" class="flex-column flex-1">
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
          <mat-checkbox name="completed" aria-label="Course completed" formControlName="completed"></mat-checkbox>
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
      <div class="flex-column">
        <mat-form-field>
          <mat-label for="nickname">Nickname</mat-label>
          <input name="nickname" formControlName="nickname" type="text" matInput/>
        </mat-form-field>
      </div>
      <div class="flex-column">
        <mat-form-field>
          <mat-label for="username">Username</mat-label>
          <input name="username" formControlName="username" type="text" matInput/>
        </mat-form-field>
      </div>
      @if (form.dirty && form.invalid) {
      <div class="flex-column" role="alert">
          <mat-error>
            Attention! The form contains the following errors:
            <ol>
              @for (item of errorMessages(); track item) {
                <li>{{item}}</li>
              }
            </ol>
          </mat-error>
        </div>
      }
`;

  protected tsCode = `export class FormValidationsComponent {
  #fb = inject(FormBuilder);
  #userNameValidator = inject(UserNameAsyncValidator);

  protected titles: string[] = ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'];
  protected errorMessages = signal<string[]>([]);

  private checkDatesValidator = (group: AbstractControl) => {
    let fromDate = group.get('fromDate')?.value;
    let toDate = group.get('toDate')?.value;
    return !!fromDate && toDate > fromDate ? null : { toDateIsPreviousThanFromDate: true }
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
    nickname: new FormControl<string>('', { validators: [Validators.required], asyncValidators: [this.#userNameValidator.getValidator()] }),
    username: new FormControl<string>('', { validators: [Validators.required], asyncValidators: [this.#userNameValidator.validator] }),
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
    if (this.form.controls.title.hasError('required')) {
      messages.push('Title is required');
    }
    if (this.form.controls.period.hasError('toDateIsPreviousThanFromDate')) {
      messages.push('To Date must be after From Date');
    }
    if (this.form.controls.period.controls.fromDate.hasError('required')) {
      messages.push('From Date is required');
    }
    if (this.form.controls.period.controls.toDate.hasError('required')) {
      messages.push('To Date is required');
    }
    if (this.form.controls.nickname.hasError('required')) {
      messages.push('Nickname is required');
    }
    if (this.form.controls.nickname.hasError('usernameAlreadyExists')) {
      messages.push(\`Nickname already exists. You could use: ${this.form.controls.nickname.getError('usernameAlreadyExists')?.suggestions.join(', ')}\`);
    }
    if (this.form.controls.username.hasError('usernameAlreadyExists')) {
      messages.push(\`Username already exists. You could use: ${this.form.controls.nickname.getError('usernameAlreadyExists')?.suggestions.join(', ')}\`);
    }
    this.errorMessages.set(messages);
  }
}
`;

  protected asyncValidatorCode = `export interface AutonomousValidator {
  getValidator(): AsyncValidatorFn;
}

@Injectable({
  providedIn: 'root'
})
export class UserNameAsyncValidator implements AutonomousValidator {
  #dr = inject(DataReaderService);

  #validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.#dr
    .isValidNickname(control.value)
    .pipe(
      map(res => !res.valid ? { usernameAlreadyExists: { suggestions: res.suggestions } } : null)
    );
  }

  // first approach: with interface method to return the validator binded with service instance
  getValidator(): AsyncValidatorFn {
    return this.#validate.bind(this);
  }

  // second approach: with decorator to bind the service instance to the validator
  @AutoBind()
  validator(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.#validate(control);
  }
}
`;

protected autoBindCode = `
/**
 * AutoBind is a decorator that automatically binds the method it decorates
 * to the instance of the class in which it is defined. This is particularly
 * useful for methods that are passed as callbacks, ensuring that the correct
 * context (i.e., \`this\`) is maintained when the method is invoked.
 *
 * Usage:
 *
 * @AutoBind()
 * methodName() {
 *   // 'this' refers to the instance of the class
 * }
 *
 * How it works:
 * - The decorator returns a function that takes the target object, the name
 *   of the property (method), and the property descriptor as arguments.
 * - It stores the original method in a variable.
 * - It creates a new property descriptor that overrides the \`get\` method,
 *   which returns the original method bound to the current instance (\`this\`).
 * - This ensures that whenever the method is called, it retains the correct
 *   context, regardless of how it is invoked.
 */
export function AutoBind() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: false,
      get() {
        return originalMethod.bind(this);
      },
    };
    return adjDescriptor;
  };
}
`;
}
