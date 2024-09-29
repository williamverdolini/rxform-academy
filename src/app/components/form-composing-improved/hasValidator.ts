import { AbstractControl, ValidatorFn } from "@angular/forms";

/**
 * Retrieves the list of raw synchronous validators attached to a given control.
 */

export function getControlValidators(control: AbstractControl): ValidatorFn | ValidatorFn[] | null {
  return (control as any)._rawValidators as ValidatorFn | ValidatorFn[] | null;
}

export function hasValidator(control: AbstractControl, validatorName: string): boolean {
  const validators = getControlValidators(control) ?? [];
  return validators
    && Array.isArray(validators)
    && validators.some(v => (v as any).validatorName === validatorName || v.name === validatorName);
}
