import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Highlight } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-form-testing',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    Highlight,
    HighlightLineNumbers
  ],
  templateUrl: './form-testing.component.html',
})
export class FormTestingComponent {

  protected test1 = `
  test('on init the form has only title, completed check and nickname fields', async () => {
    await render(FormValidationsComponent);

    expect(screen.queryByLabelText('Lesson Title')).toBeInTheDocument();
    expect(screen.queryByLabelText('Course completed')).toBeInTheDocument();
    expect(screen.queryByLabelText('From Date')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('To Date')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nickname')).toBeInTheDocument();
  });
  `;

  protected test2 = `
  test('the form with completed checked shows period fields', async () => {
    await render(FormValidationsComponent);

    const completed = screen.queryByLabelText('Course completed');
    fireEvent.click(completed!);

    expect(screen.queryByLabelText('Lesson Title')).toBeInTheDocument();
    expect(screen.queryByLabelText('Course completed')).toBeInTheDocument();
    expect(screen.queryByLabelText('Course completed')).toBeChecked();
    expect(screen.queryByLabelText('From Date')).toBeInTheDocument();
    expect(screen.queryByLabelText('To Date')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nickname')).toBeInTheDocument();
  });
  `;

  protected test3 = `
  test('the form can be controlled in a typed way', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    expect(form.value).toEqual({
      "completed": false,
      "nickname": "",
      "title": "",
    });

    fireEvent.click(screen.queryByLabelText('Course completed')!);

    expect(form.value).toEqual({
      completed: true,
      nickname: "",
      title: "",
      period: {
        fromDate: null,
        toDate: null
      }
    });
    expect(form.valid).toBeFalsy();
    expect(form.getError("required", "title")).toBe(true);
  });
  `;

  protected test4 = `
  test('control group period check valid dates', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    fireEvent.click(screen.queryByLabelText('Course completed')!);
    expect(screen.queryByLabelText('From Date')).toBeInTheDocument();
    fireEvent.input(screen.queryByLabelText('From Date')!, { target: { value: '2024-09-25' } });
    fireEvent.input(screen.queryByLabelText('To Date')!, { target: { value: '2021-09-01' } });

    expect(form.value.period).toEqual({
      fromDate: new Date("2024-09-25T00:00:00.000Z"),
      toDate: new Date("2021-09-01T00:00:00.000Z")
    });
    expect(form.valid).toBeFalsy();
    expect(form.status).toEqual("INVALID");
    expect(form.hasError("required", "period.fromDate")).toEqual(false);
    expect(form.hasError("required", "period.toDate")).toEqual(false);
    expect(form.hasError("toDateIsPreviousThanFromDate", "period")).toEqual(true);
    expect(form.controls.period.errors).toEqual({ "toDateIsPreviousThanFromDate": true });
  });
  `;

  protected test5 = `
  test('the form check nickname for uniqueness', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    const nickname = screen.queryByLabelText('Nickname');
    fireEvent.input(nickname!, { target: { value: 'pippo' } });

    await waitFor(() => {
      expect(nickname).toHaveValue('pippo');
      expect(form.valid).toBeFalsy();
      expect(form.hasError("nicknameAlreadyExists", "nickname")).toBe(true);
      expect(form.getError("nicknameAlreadyExists", "nickname"))
        .toEqual({ "suggestions": [ "pippo123", "pippo_bis"] });
      expect(form.controls.nickname.errors)
        .toEqual({ nicknameAlreadyExists: { suggestions: [ "pippo123", "pippo_bis"] }});
    });

    fireEvent.input(nickname!, { target: { value: 'pippo123' } });

    await waitFor(() => {
      expect(nickname).toHaveValue('pippo123');
      expect(form.hasError("nicknameAlreadyExists", "nickname")).toBe(false);
    });
  });
  `;

  protected test6 = `
  test('if the form is invalid shows alerts', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    const nickname = screen.queryByLabelText('Nickname');
    fireEvent.input(nickname!, { target: { value: 'pippo' } });

    await waitFor(() => {
      expect(nickname).toHaveValue('pippo');
      expect(form.valid).toBeFalsy();
      expect(form.dirty).toBeTruthy();
      const errors = screen.queryByRole('alert');
      expect(errors).toBeInTheDocument();
      expect(errors).toContainElement(
        screen.queryByText('Nickname already exists. You could use: pippo123, pippo_bis')
        );
    });
  });
  `;

  protected test7 = `
  test('if the form is valid does not show alerts', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    fireEvent.input(screen.queryByLabelText('Lesson Title')!, { target: { value: 'Lesson 1' } });
    fireEvent.click(screen.queryByLabelText('Course completed')!);
    fireEvent.input(screen.queryByLabelText('From Date')!, { target: { value: '2024-09-25' } });
    fireEvent.input(screen.queryByLabelText('To Date')!, { target: { value: '2024-10-15' } });
    fireEvent.input(screen.queryByLabelText('Nickname')!, { target: { value: 'pippo123' } });

    await waitFor(() => {
      expect(form.valid).toBeTruthy();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', {name: "Save"})).toBeInTheDocument();
      expect(screen.queryByRole('button', {name: "Save"})).toBeEnabled();
    });
  });
  `;

  protected htmlCode = `    <div [formGroup]="form" class="flex-column flex-1">
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
          <mat-checkbox name="completed" formControlName="completed"></mat-checkbox>
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
      @if (form.touched && form.invalid) {
      <div class="flex-column">
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

  protected tsCode = `export class FormValidationsComponent {
  #fb = inject(FormBuilder);
  #dr = inject(DataReaderService);
  protected titles: string[] = ['Lesson 1', 'Lesson 2', 'Lesson 3', 'Lesson 4'];
  protected errorMessages = signal<string[]>([]);

  private checkDatesValidator = (group: AbstractControl) => {
    let fromDate = group.get('fromDate')?.value;
    let toDate = group.get('toDate')?.value;
    return !!fromDate && toDate > fromDate ? null : { toDateIsPreviousThanFromDate: true }
  }

  private nicknameCheckValidator: AsyncValidatorFn = (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
    return timer(500).pipe(
      switchMap(() => {
        return this.#dr.isValidNickname(control.value);
      }),
      map(res => !res.valid ? { nicknameAlreadyExists: { suggestions: res.suggestions} } : null)
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
    nickname: new FormControl<string>('', { validators: [Validators.required], asyncValidators: [this.nicknameCheckValidator] }),
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
    if (this.form.controls.nickname.hasError('nicknameAlreadyExists')) {
      messages.push(\`Nickname already exists. You could use: \${this.form.controls.nickname.getError('nicknameAlreadyExists')?.suggestions.join(', ')}\`);
    }
    this.errorMessages.set(messages);
  }
}
`;

  protected testCode = `import { NO_ERRORS_SCHEMA } from "@angular/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/angular";
import userEvent from '@testing-library/user-event';
import { FormValidationsComponent } from "./form-validations.component";
import { TestBed } from "@angular/core/testing";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";

jest.mock('ngx-highlightjs');
jest.mock('ngx-highlightjs/line-numbers');

describe('FormValidationsComponent', () => {

  configureNoErrorSchemaCompile();

  test('on init the form has only title, completed check and nickname fields', async () => {
    await render(FormValidationsComponent);

    expect(screen.queryByLabelText('Lesson Title')).toBeInTheDocument();
    expect(screen.queryByLabelText('Course completed')).toBeInTheDocument();
    expect(screen.queryByLabelText('From Date')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('To Date')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nickname')).toBeInTheDocument();
  });

  test('the form with completed checked shows period fields', async () => {
    await render(FormValidationsComponent);

    const completed = screen.queryByLabelText('Course completed');
    fireEvent.click(completed!);

    expect(screen.queryByLabelText('Lesson Title')).toBeInTheDocument();
    expect(screen.queryByLabelText('Course completed')).toBeInTheDocument();
    expect(screen.queryByLabelText('Course completed')).toBeChecked();
    expect(screen.queryByLabelText('From Date')).toBeInTheDocument();
    expect(screen.queryByLabelText('To Date')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nickname')).toBeInTheDocument();
  });

  test('the form can be controlled in a typed way', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    expect(form.value).toEqual({
      "completed": false,
      "nickname": "",
      "title": "",
    });

    fireEvent.click(screen.queryByLabelText('Course completed')!);

    expect(form.value).toEqual({
      completed: true,
      nickname: "",
      title: "",
      period: {
        fromDate: null,
        toDate: null
      }
    });
    expect(form.valid).toBeFalsy();
    expect(form.getError("required", "title")).toBe(true);
  });

  test('control group period check valid dates', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    fireEvent.click(screen.queryByLabelText('Course completed')!);
    expect(screen.queryByLabelText('From Date')).toBeInTheDocument();
    fireEvent.input(screen.queryByLabelText('From Date')!, { target: { value: '2024-09-25' } });
    fireEvent.input(screen.queryByLabelText('To Date')!, { target: { value: '2021-09-01' } });

    expect(form.value.period).toEqual({
      fromDate: new Date("2024-09-25T00:00:00.000Z"),
      toDate: new Date("2021-09-01T00:00:00.000Z")
    });
    expect(form.valid).toBeFalsy();
    expect(form.status).toEqual("INVALID");
    expect(form.hasError("required", "period.fromDate")).toEqual(false);
    expect(form.hasError("required", "period.toDate")).toEqual(false);
    expect(form.hasError("toDateIsPreviousThanFromDate", "period")).toEqual(true);
    expect(form.controls.period.errors).toEqual({ "toDateIsPreviousThanFromDate": true });
  });

  test('the form check nickname for uniqueness', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    const nickname = screen.queryByLabelText('Nickname');
    fireEvent.input(nickname!, { target: { value: 'pippo' } });

    await waitFor(() => {
      expect(nickname).toHaveValue('pippo');
      expect(form.valid).toBeFalsy();
      expect(form.hasError("nicknameAlreadyExists", "nickname")).toBe(true);
      expect(form.getError("nicknameAlreadyExists", "nickname"))
        .toEqual({ "suggestions": [ "pippo123", "pippo_bis"] });
      expect(form.controls.nickname.errors)
        .toEqual({ nicknameAlreadyExists: { suggestions: [ "pippo123", "pippo_bis"] }});
    });

    fireEvent.input(nickname!, { target: { value: 'pippo123' } });

    await waitFor(() => {
      expect(nickname).toHaveValue('pippo123');
      expect(form.hasError("nicknameAlreadyExists", "nickname")).toBe(false);
    });

  });

  test('if the form is invalid shows alerts', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    const nickname = screen.queryByLabelText('Nickname');
    fireEvent.input(nickname!, { target: { value: 'pippo' } });

    await waitFor(() => {
      expect(nickname).toHaveValue('pippo');
      expect(form.valid).toBeFalsy();
      expect(form.dirty).toBeTruthy();
      const errors = screen.queryByRole('alert');
      expect(errors).toBeInTheDocument();
      expect(errors).toContainElement(
        screen.queryByText('Nickname already exists. You could use: pippo123, pippo_bis'));
    });
  });

  test('if the form is valid does not show alerts', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    fireEvent.input(screen.queryByLabelText('Lesson Title')!, { target: { value: 'Lesson 1' } });
    fireEvent.click(screen.queryByLabelText('Course completed')!);
    fireEvent.input(screen.queryByLabelText('From Date')!, { target: { value: '2024-09-25' } });
    fireEvent.input(screen.queryByLabelText('To Date')!, { target: { value: '2024-10-15' } });
    fireEvent.input(screen.queryByLabelText('Nickname')!, { target: { value: 'pippo123' } });

    await waitFor(() => {
      expect(form.valid).toBeTruthy();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', {name: "Save"})).toBeInTheDocument();
      expect(screen.queryByRole('button', {name: "Save"})).toBeEnabled();
    });
  });
});


function configureNoErrorSchemaCompile() {
  beforeEach(async () => {
    await TestBed
      .configureTestingModule({
        imports: [MatNativeDateModule, MatDatepickerModule]
      })
      .overrideComponent(FormValidationsComponent, {
        set: {
          schemas: [NO_ERRORS_SCHEMA],
        }
      }).compileComponents();
  });
}
`;
}

