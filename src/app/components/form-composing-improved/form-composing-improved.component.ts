import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
import { AddressImprovedComponent, AddressItem } from '../address-improved.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';

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

  protected form = this.#fb.group({
    address: new FormControl<AddressItem>(AddressItem.nullValue(), {
      validators: [
        AddressImprovedComponent.required,
        AddressImprovedComponent.noMainStreet
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

  protected tsCode = `#fb = inject(FormBuilder);

protected form = this.#fb.group({
  address: new FormControl<AddressItem>(AddressItem.nullValue(), {
    validators: [
      AddressImprovedComponent.required,
      AddressImprovedComponent.noMainStreet
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

  protected addressImprovedComponentCode = `export class AddressImprovedComponent implements ControlValueAccessor, Validator {
  // ... existing component code ...

  static required(control: AbstractControl): ValidationErrors | null {
    const value = control.value as AddressItem;
    if (!value || !value.street || !value.city) {
      return {
        required: [
          ...(!value?.street ? ['street'] : []),
          ...(!value?.city ? ['city'] : []),
        ]
      };
    }
    return null;
  }

  static noMainStreet(control: AbstractControl): ValidationErrors | null {
    const value = control.value as AddressItem;
    if (value?.street?.toLowerCase().includes('main street')) {
      return { mainStreetNotAllowed: true };
    }
    return null;
  }

  // ... rest of the component code ...
}`;

  // ... end of component
}
