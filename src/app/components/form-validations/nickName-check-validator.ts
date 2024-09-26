import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataReaderService } from '../../services/data-reader.service';

export class NickNameCheckValidator {
  static createValidator(readerClient: DataReaderService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return readerClient
        .isValidNickname(control.value)
        .pipe(
          map(res => !res.valid ? { nicknameAlreadyExists: { suggestions: res.suggestions } } : null)
        );
    };
  }
}
