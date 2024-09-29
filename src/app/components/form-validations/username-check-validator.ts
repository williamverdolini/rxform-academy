import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataReaderService } from '../../services/data-reader.service';
import { inject, Injectable } from '@angular/core';
import { AutoBind } from './auto-bind.decorator';

export interface AutonomousValidator {
  getValidator(): AsyncValidatorFn;
}

@Injectable({
  providedIn: 'root'
})
export class UserNameAsyncValidator implements AutonomousValidator {
  #dr = inject(DataReaderService);

  #validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.#dr
    .isValidNickname(control.value)
    .pipe(
      map(res => !res.valid ? { usernameAlreadyExists: { suggestions: res.suggestions } } : null)
    );
  }

  // first approach: with interface method to return the validator binded with service instance
  getValidator(): AsyncValidatorFn {
    return this.#validate.bind(this);
  }

  // second approach: with decorator to bind the service instance to the validator
  @AutoBind()
  validator(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.#validate(control);
  }
}