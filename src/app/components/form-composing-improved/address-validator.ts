import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Injectable } from '@angular/core';
import { AutoBind } from '../form-validations/auto-bind.decorator';

@Injectable({
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
