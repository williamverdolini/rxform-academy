import { AbstractControl } from '@angular/forms';

export interface FormControlWithWarning extends AbstractControl {
  warnings?: string[];
}
