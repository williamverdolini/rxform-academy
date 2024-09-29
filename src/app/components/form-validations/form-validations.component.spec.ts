import { NO_ERRORS_SCHEMA } from "@angular/core";
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
    expect(screen.queryByLabelText('Username')).toBeInTheDocument();
  });

  test('the form can be controlled in a typed way', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    expect(form.value).toEqual({
      "completed": false,
      "nickname": "",
      "username": "",
      "title": "",
    });

    fireEvent.click(screen.queryByLabelText('Course completed')!);

    expect(form.value).toEqual({
      completed: true,
      nickname: "",
      username: "",
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

  test('the form check nickname and username for uniqueness', async () => {
    const { fixture } = await render(FormValidationsComponent);
    const form = fixture.componentInstance["form"];

    const nickname = screen.queryByLabelText('Nickname');
    const username = screen.queryByLabelText('Username');
    fireEvent.input(nickname!, { target: { value: 'pippo' } });
    fireEvent.input(username!, { target: { value: 'pippo' } });

    await waitFor(() => {
      expect(form.valid).toBeFalsy();
      expect(nickname).toHaveValue('pippo');
      expect(username).toHaveValue('pippo');
      expect(form.hasError("usernameAlreadyExists", "nickname")).toBe(true);
      expect(form.hasError("usernameAlreadyExists", "username")).toBe(true);
      expect(form.getError("usernameAlreadyExists", "nickname"))
        .toEqual({ "suggestions": [ "pippo123", "pippo_bis"] });
      expect(form.getError("usernameAlreadyExists", "username"))
        .toEqual({ "suggestions": [ "pippo123", "pippo_bis"] });
      expect(form.controls.nickname.errors)
        .toEqual({ usernameAlreadyExists: { suggestions: [ "pippo123", "pippo_bis"] }});
      expect(form.controls.username.errors)
        .toEqual({ usernameAlreadyExists: { suggestions: [ "pippo123", "pippo_bis"] }});
    });

    fireEvent.input(nickname!, { target: { value: 'pippo123' } });
    fireEvent.input(username!, { target: { value: 'pippo123' } });

    await waitFor(() => {
      expect(nickname).toHaveValue('pippo123');
      expect(username).toHaveValue('pippo123');
      expect(form.hasError("usernameAlreadyExists", "nickname")).toBe(false);
      expect(form.hasError("usernameAlreadyExists", "username")).toBe(false);
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
      expect(errors).toContainElement(screen.queryByText('Nickname already exists. You could use: pippo123, pippo_bis'));
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
    fireEvent.input(screen.queryByLabelText('Username')!, { target: { value: 'pippo123' } });

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

