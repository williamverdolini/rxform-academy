import { Component, inject } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AddressItem } from './address.component';

@Component({
  standalone: true,
  selector: 'app-address-communicating',
  imports: [CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AddressCommunicatingComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: AddressCommunicatingComponent,
      multi: true
    },
  ],
  template: `
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
    </div>`
})
export class AddressCommunicatingComponent implements ControlValueAccessor, Validator {
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

  /** VALIDATION ACCESSOR METHODS */
  private onTouched = () => { };
  private onChange = (obj: Partial<AddressItem> | null | undefined) => { };
  private onValidationChange = () => { };

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.hasValidator(Validators.required)
      && !this.form.controls.street.hasValidator(Validators.required)
      && !this.form.controls.city.hasValidator(Validators.required)) {
      this.form.controls.street.setValidators([Validators.required]);
      this.form.controls.city.setValidators([Validators.required]);
    }
    if (this.form.invalid) {
      return {
        invalid: [
          ...(!this.form.controls.street.value ? ['street'] : []),
          ...(!this.form.controls.city.value ? ['city'] : []),
        ]
      };
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
