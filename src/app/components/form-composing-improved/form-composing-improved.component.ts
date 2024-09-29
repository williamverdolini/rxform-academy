import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
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
import { AddressImprovedComponent } from './address-improved.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { AddressItem } from '../../services/model';
import { AddressValidator } from './address-validator';

@Component({
  selector: 'app-form-composing-improved',
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
    HighlightLineNumbers,
    AddressImprovedComponent
  ],
  templateUrl: './form-composing-improved.component.html',
})
export class FormComposingImprovedComponent {
  #fb = inject(FormBuilder);
  #addressValidator = inject(AddressValidator);

  protected form = this.#fb.group({
    address: new FormControl<AddressItem>(AddressItem.nullValue(), {
      validators: [
        this.#addressValidator.addressRequired,
        this.#addressValidator.noMainStreet
      ]
    }),
    username: new FormControl<string>('', { validators: [Validators.required] }),
  });

  protected errorMessages = signal<string[]>([]);
  constructor() {
    merge(this.form.statusChanges, this.form.valueChanges)
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.updateErrorMessage());
  }

  protected updateErrorMessage() {
    const messages: string[] = [];
    if (this.form.valid) {
      this.errorMessages.set(messages);
      return;
    }

    if (this.form.controls.address.hasError('required')) {
      messages.push(`Address is required. You should complete: ${this.form.controls.address.getError('required')?.join(', ')}`);
    }
    if (this.form.controls.address.hasError('mainStreetNotAllowed')) {
      messages.push('Main Street is not allowed in the address');
    }
    if (this.form.controls.username.hasError('required')) {
      messages.push('Username is required');
    }
    this.errorMessages.set(messages);
  }

  protected htmlCode = `<div [formGroup]="form" class="flex-column flex-1">
  <app-address-improved class="flex-column" formControlName="address"></app-address-improved>
  <div class="flex-column">
    <mat-form-field>
      <mat-label for="nickname">Username</mat-label>
      <input name="username" formControlName="username" type="text" matInput />
    </mat-form-field>
  </div>
  <div class="example-button-row">
    <button mat-button (click)="form.reset()">Reset</button>
    <button mat-button mat-flat-button [disabled]="form.invalid">Save</button>
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
</div>`;

  protected tsCode = `  #fb = inject(FormBuilder);
  #addressValidator = inject(AddressValidator);

  protected form = this.#fb.group({
    address: new FormControl<AddressItem>(AddressItem.nullValue(), {
      validators: [
        this.#addressValidator.addressRequired,
        this.#addressValidator.noMainStreet
      ]
    }),
    username: new FormControl<string>('', { validators: [Validators.required] }),
  });

  protected errorMessages = signal<string[]>([]);
  constructor() {
    merge(this.form.statusChanges, this.form.valueChanges)
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.updateErrorMessage());
  }

  protected updateErrorMessage() {
    const messages: string[] = [];
    if (this.form.valid) {
      this.errorMessages.set(messages);
      return;
    }

    if (this.form.controls.address.hasError('required')) {
      messages.push(\`Address is required. You should complete: \${this.form.controls.address.getError('required')?.join(', ')}\`);
    }
    if (this.form.controls.address.hasError('mainStreetNotAllowed')) {
      messages.push('Main Street is not allowed in the address');
    }
    if (this.form.controls.username.hasError('required')) {
      messages.push('Username is required');
    }
    this.errorMessages.set(messages);
  }`;

  protected addressImprovedComponentCode = `@Component({
  standalone: true,
  selector: 'app-address-improved',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AddressImprovedComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: AddressImprovedComponent,
      multi: true
    },
  ],
  template: \`
    <div [formGroup]="form" class="flex-row flex-1">
      <div class="flex-column flex-1">
        <mat-form-field>
          <mat-label for="street">Street</mat-label>
          <input name="street" formControlName="street" type="text" matInput/>
        </mat-form-field>
      </div>
      <div class="flex-column flex-1 m-l-1">
        <mat-form-field>
          <mat-label for="city">City</mat-label>
          <input name="city" formControlName="city" type="text" matInput/>
        </mat-form-field>
      </div>
    </div>\`
})
export class AddressImprovedComponent implements ControlValueAccessor, Validator {
  #fb = inject(FormBuilder);

  protected form = this.#fb.group({
    street: new FormControl(''),
    city: new FormControl(''),
  });

  constructor() {
    this.form.valueChanges.pipe(
      takeUntilDestroyed()
    ).subscribe((value) => {
      this.onChange(value);
      this.onValidationChange();
      this.onTouched();
    });
  }

  #init = false;
  /** VALIDATION ACCESSOR METHODS */
  private onTouched = () => { };
  private onChange = (obj: Partial<AddressItem> | null | undefined) => { };
  private onValidationChange = () => { };

  validate(control: AbstractControl): ValidationErrors | null {
    // typed? AddressValidator.prototype.addressRequired.name
    if (hasValidator(control, 'addressRequired') && !this.#init) {
      this.form.controls.street.setValidators([Validators.required]);
      this.form.controls.city.setValidators([Validators.required]);
      this.#init = true;
    }
    return null;
  }

  registerOnValidatorChange?(fn: () => void): void {
    this.onValidationChange = fn;
  }

  writeValue(obj: AddressItem | null): void {
    if (!obj) {
      this.form.reset();
      return;
    }
    this.form.setValue(obj ?? AddressItem.nullValue());
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.form[isDisabled ? 'disable' : 'enable']();
  }
}
}`;

  protected addressValidatorCode = `@Injectable({
  providedIn: 'root'
})
export class AddressValidator  {

  @AutoBind()
  addressRequired(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value || !value.street || !value.city) {
      return { required: [
        ...(!value.street ? ['street'] : []),
        ...(!value.city ? ['city'] : []),
      ] };
    }
    return null;
  }

  @AutoBind()
  noMainStreet(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && value.street && value.street.toLowerCase().includes('main')) {
      return { mainStreetNotAllowed: true };
    }
    return null;
  }
}
`
  protected hasValidatorCode = `import { AbstractControl, ValidatorFn } from "@angular/forms";

/**
 * Retrieves the list of raw synchronous validators attached to a given control.
 */

export function getControlValidators(control: AbstractControl): ValidatorFn | ValidatorFn[] | null {
  return (control as any)._rawValidators as ValidatorFn | ValidatorFn[] | null;
}

export function hasValidator(control: AbstractControl, validatorName: string): boolean {
  const validators = getControlValidators(control) ?? [];
  return validators
    && Array.isArray(validators)
    && validators.some(v => (v as any).validatorName === validatorName || v.name === validatorName);
}
`
}
