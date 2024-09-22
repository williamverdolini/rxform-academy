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

@Component({
  selector: 'app-non-nullable-controls',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTabsModule,
    Highlight,
    HighlightLineNumbers
  ],
  templateUrl: './non-nullable-controls.component.html',
})
export class NonNullableControlsComponent {
  #fb = inject(FormBuilder);

  protected titles: string[] = ['Mr.', 'Mrs.', 'Dr.', 'Ms.'];
  protected form = this.#fb.group({
      title: new FormControl<string>(this.titles[0], { nonNullable: true, validators: [Validators.required] }),
      firstName: new FormControl<string>('', { validators: [Validators.required] }),
      lastName: new FormControl<string>('', { validators: [Validators.required] }),
      nickname: new FormControl<string>(''),
    });

  protected htmlCode = `<div [formGroup]="form" class="flex-column flex-1">
      <mat-form-field>
        <mat-label for="title">Title</mat-label>
        <input type="text" name="title" matInput formControlName="title" [matAutocomplete]="auto">
        <mat-autocomplete #auto="matAutocomplete">
          @for (option of titles; track option) {
            <mat-option [value]="option">{{option}}</mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>
      <div class="flex-column">
        <mat-form-field>
          <mat-label for="firstName">First Name</mat-label>
          <input name="firstName" formControlName="firstName" type="text" matInput/>
        </mat-form-field>
      </div>
      <div class="flex-column">
        <mat-form-field>
          <mat-label for="lastName">Last Name</mat-label>
          <input name="lastName" formControlName="lastName" type="text" matInput/>
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
      </div>
    </div>
`;
  protected tsCode = `  #fb = inject(FormBuilder);

  protected titles: string[] = ['Mr.', 'Mrs.', 'Dr.', 'Ms.'];
  protected form = this.#fb.group({
      title: new FormControl<string>(this.titles[0], { nonNullable: true, validators: [Validators.required] }),
      firstName: new FormControl<string>('', { validators: [Validators.required] }),
      lastName: new FormControl<string>('', { validators: [Validators.required] }),
      nickname: new FormControl<string>(''),
    });
`;
}
