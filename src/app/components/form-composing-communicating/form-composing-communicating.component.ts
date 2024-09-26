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
import { AddressCommunicatingComponent, AddressItem } from '../address.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

@Component({
  selector: 'app-form-composing-communicating',
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
    AddressCommunicatingComponent
  ],
  templateUrl: './form-composing-communicating.component.html',
})
export class FormComposingCommunicatingComponent {
  #fb = inject(FormBuilder);

  protected form = this.#fb.group({
    address: new FormControl<AddressItem>(AddressItem.nullValue(), { validators: [Validators.required] }),
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

    if (this.form.controls.address.hasError('invalid')) {
      messages.push(`Address is required. You should complete: ${this.form.controls.address.getError('invalid')?.join(', ')}`);
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
  protected tsCode = `  #fb = inject(FormBuilder);

  protected form = this.#fb.group({
    address: new FormControl<AddressItem>(AddressItem.nullValue(), { validators: [Validators.required] }),
    username: new FormControl<string>('', { validators: [Validators.required] }),
  });
`;
  protected tsAdvancedCode = `  #fb = inject(FormBuilder);

  protected form = this.#fb.group({
      address: new FormControl<AddressItem>(AddressItem.nullValue(), { validators: [Validators.required] }),
      username: new FormControl<string>('', { validators: [Validators.required] }),
    });
`;

  protected addressComponentCode = `  validate(control: AbstractControl): ValidationErrors | null {
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
`;
}
