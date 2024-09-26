import { Injectable } from '@angular/core';
import { FormArray, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormHelperService {

  public findErrorsRecursive(
    formToInvestigate: FormGroup | FormArray
  ): { [key: string]: ValidationErrors[]} {
    let errors: { [key: string]: ValidationErrors[]} = {};
    const recursiveFunc = (name: string, form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach((field) => {
        const control = form.get(field);
        const key = name +'.'+field;
        errors[key] = errors[key] ?? [];
        if (control?.errors) {
          errors[key].push(control.errors);
        }
        if (control instanceof FormGroup) {
          recursiveFunc(key, control);
        } else if (control instanceof FormArray) {
          recursiveFunc(key, control);
        }
      });
    };
    recursiveFunc('root', formToInvestigate);
    return errors;
  }

}
