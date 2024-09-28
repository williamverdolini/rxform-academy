import { AbstractControl } from '@angular/forms';

export interface CustomFormControl extends AbstractControl {
  warnings?: string[];
}
