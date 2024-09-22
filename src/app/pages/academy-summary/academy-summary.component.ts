import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilderIntroComponent } from '../../components/form-builder-intro/form-builder-intro.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NonNullableControlsComponent } from '../../components/non-nullable-controls/non-nullable-controls.component';
import { AsyncInitializationComponent } from '../../components/async-initialization/async-initialization.component';
import { DynamicComponentsComponent } from '../../components/dynamic-component/dynamic-component.component';

@Component({
  selector: 'app-academy-summary',
  standalone: true,
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    //component imports
    FormBuilderIntroComponent,
    NonNullableControlsComponent,
    AsyncInitializationComponent,
    DynamicComponentsComponent
  ],
  templateUrl: './academy-summary.component.html',
  styleUrl: './academy-summary.component.scss'
})
export class AcademySummaryComponent {
  #fb = inject(FormBuilder);
  f1 = this.#fb.group({ firstCtrl: ['', Validators.required] });

  protected goToStep(stepper: MatStepper, step: number) {
    stepper.selectedIndex = step;
  }

  public onStepperSelectionChange(evant: any) {
    this.scrollToSectionHook();
  }

  private scrollToSectionHook() {
    const element = document.querySelector('.stepperTop');
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth', block: 'start', inline:
            'nearest'
        });
      }, 100);
    }
  }
}
