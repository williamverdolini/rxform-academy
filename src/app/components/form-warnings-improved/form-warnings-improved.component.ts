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
import { map, Observable, of, switchMap, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataReaderService } from '../../services/data-reader.service';
import { CustomFormControl as FormControlWithWarning } from '../form-warnings/custom-form-control';

@Component({
  selector: 'app-form-warnings-improved',
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
  templateUrl: './form-warnings-improved.component.html',
})
export class FormWarningsImprovedComponent {
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
   // Custom validator that handles both errors and warnings
   private usernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return timer(100).pipe(
        switchMap(() => this.#dr.isValidNickname(control.value)),
        map(res => {
          const errors: ValidationErrors = {};
          const warnings: string[] = [];

          if (!res.valid) {
            errors['usernameAlreadyExists'] = { suggestions: res.suggestions };
          }

          if (control.value.length < 8) {
            warnings.push('Username should be at least 8 characters long');
          }

          // Add warnings to the control
          (control as FormControlWithWarning).warnings = warnings;

          return Object.keys(errors).length > 0 ? errors : null;
        })
      );
    };
  }

  // Method to get warnings for a control
  getWarnings(controlName: string): string[] {
    const control = this.form.get(controlName) as FormControlWithWarning;
    console.log(control?.warnings);
    return control && control.warnings ? control.warnings : [];
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
    username: new FormControl<string>('', { validators: [Validators.required], asyncValidators: [this.usernameValidator()] }) as FormControlWithWarning,
  });

  constructor() {
    this.form.controls.completed.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe((completed) => {
      this.form.controls.period[completed ? 'enable' : 'disable']();
    });
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
      tap(_ => this.waningMessages.set(!!control.value && control.value.length < 8 ? ["userNameLessThan8Char"] : [])),
      map(res => !res.valid ? { usernameAlreadyExists: { suggestions: res.suggestions} } : null)
    );
  }

  ...

  protected form = this.#fb.group({
    title: new FormControl<string>('', { validators: [Validators.required] }),
    completed: new FormControl<boolean>(false, { nonNullable: true, validators: [Validators.required] }),
    ...
    username: new FormControl<string>('', { validators: [Validators.required], asyncValidators: [this.usernameCheckValidator] }) as CustomFormControl,
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
    username: new FormControl<string>('', { validators: [Validators.required], asyncValidators: [this.usernameCheckValidator] }) as CustomFormControl,
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

    if (this.form.controls.username.hasError('required')) {
      messages.push('Username is required');
      this.waningMessages.set([]); // <-- reset warnings
    }
    if (this.form.controls.username.hasError('usernameAlreadyExists')) {
      messages.push(\`Username already exists. You could use: ${this.form.controls.username.getError('usernameAlreadyExists')?.suggestions.join(', ')}\`);
    }
    this.errorMessages.set(messages);
  }
`;

  protected improvedHtmlCode = `
<mat-form-field>
  <mat-label for="username">Username</mat-label>
  <input name="username" formControlName="username" type="text" matInput />
  @if (form.get('username')?.invalid) {
    <mat-error>
      @if (form.get('username')?.hasError('required')) {
        Username is required
      }
      @if (form.get('username')?.hasError('usernameAlreadyExists')) {
        Username already exists. You could use: {{form.get('username')?.getError('usernameAlreadyExists')?.suggestions.join(', ')}}
      }
    </mat-error>
  }
  @if (getWarnings('username').length > 0) {
    <mat-hint style="color: darkgoldenrod;">
      @for (warning of getWarnings('username'); track warning) {
        {{warning}}
      }
    </mat-hint>
  }
</mat-form-field>
`;

  protected improvedTsCode = `
import { CustomFormControl as FormControlWithWarning } from '../form-warnings/custom-form-control';

// ... other imports ...

export class FormWarningsImprovedComponent {
  // ... other properties ...

  private usernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return timer(100).pipe(
        switchMap(() => this.#dr.isValidNickname(control.value)),
        map(res => {
          const errors: ValidationErrors = {};
          const warnings: string[] = [];

          if (!res.valid) {
            errors['usernameAlreadyExists'] = { suggestions: res.suggestions };
          }

          if (control.value.length < 8) {
            warnings.push('Username should be at least 8 characters long');
          }

          // Add warnings to the control
          (control as FormControlWithWarning).warnings = warnings;

          return Object.keys(errors).length > 0 ? errors : null;
        })
      );
    };
  }

  getWarnings(controlName: string): string[] {
    const control = this.form.get(controlName) as FormControlWithWarning;
    return control && control.warnings ? control.warnings : [];
  }

  protected form = this.#fb.group({
    // ... other form controls ...
    username: new FormControl<string>('', {
      validators: [Validators.required],
      asyncValidators: [this.usernameValidator()]
    }) as FormControlWithWarning,
  });

  // ... other methods ...
}
`;
}
