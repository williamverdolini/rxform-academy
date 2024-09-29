import { CommonModule } from '@angular/common';
import { Component, inject, signal, } from '@angular/core';
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
import { AddressComponent } from './address.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { AddressItem } from '../../services/model';

@Component({
  selector: 'app-form-composing',
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
    AddressComponent
  ],
  templateUrl: './form-composing.component.html',
})
export class FormComposingComponent {
  #fb = inject(FormBuilder);
  protected errorMessages = signal<string[]>([]);

  protected form = this.#fb.group({
    address: new FormControl<AddressItem>(AddressItem.nullValue()),
    username: new FormControl<string>('', { validators: [Validators.required] }),
  });

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
      messages.push(`Address is not complete`);
    }
    if (this.form.controls.username.hasError('required')) {
      messages.push('Username is required');
    }
    this.errorMessages.set(messages);
  }

  protected htmlCode = `    <div [formGroup]="form" class="flex-column flex-1">
      <app-address class="flex-column" formControlName="address"></app-address>
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
    </div>
`;
  protected tsCode = `  #fb = inject(FormBuilder);

  protected form = this.#fb.group({
      address: new FormControl<AddressItem>(AddressItem.nullValue()),
      username: new FormControl<string>('', { validators: [Validators.required] }),
    });
`;

  protected addressComponentCode = `export class AddressItem {
  street: string | null;
  city: string | null;
  static nullValue = () => ({ street: null, city: null });
}

@Component({
  standalone: true,
  selector: 'app-address',
  imports: [CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: AddressComponent,
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: AddressComponent,
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
export class AddressComponent implements ControlValueAccessor, Validator {
  #fb = inject(FormBuilder);

  protected form = this.#fb.group({
    street: new FormControl('', { validators: [Validators.required] }),
    city: new FormControl('', { validators: [Validators.required] }),
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

  validate(_: AbstractControl): ValidationErrors | null {
    if (this.form.invalid) {
      return { required: true };
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
}`;
}
