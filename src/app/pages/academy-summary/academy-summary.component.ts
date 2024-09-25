import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilderIntroComponent } from '../../components/form-builder-intro/form-builder-intro.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import { NonNullableControlsComponent } from '../../components/non-nullable-controls/non-nullable-controls.component';
import { AsyncInitializationComponent } from '../../components/async-initialization/async-initialization.component';
import { DynamicControlComponent } from '../../components/dynamic-control/dynamic-control.component';
import { CustomComponentsComponent } from '../../components/custom-components/custom-components.component';
import { FormValidationsComponent } from '../../components/form-validations/form-validations.component';
import { FormTestingComponent } from '../../components/form-testing/form-testing.component';
import { FormWarningsComponent } from '../../components/form-warnings/form-warnings.component';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';

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
    //component imports
    FormBuilderIntroComponent,
    NonNullableControlsComponent,
    AsyncInitializationComponent,
    DynamicControlComponent,
    CustomComponentsComponent,
    FormValidationsComponent,
    FormTestingComponent,
    FormWarningsComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader
  ],
  templateUrl: './academy-summary.component.html',
  styleUrl: './academy-summary.component.scss'
})
export class AcademySummaryComponent {
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @ViewChild(MatAccordion) accordion: MatAccordion;
  panels = [
    { title: 'Introduction', component: 'app-form-builder-intro', expanded: false },
    { title: 'Non-Nullable Controls', component: 'app-non-nullable-controls', expanded: false },
    { title: 'Async Initialization', component: 'app-async-initialization', expanded: false },
    { title: 'Dynamic Control', component: 'app-dynamic-control', expanded: false },
    { title: 'Custom Components', component: 'app-custom-components', expanded: false },
    { title: 'Form Validations', component: 'app-form-validations', expanded: false },
    { title: 'Form Testing', component: 'app-form-testing', expanded: false },
    { title: 'Form Warnings', component: 'app-form-warnings', expanded: false },
    { title: 'Conclusions', component: 'conclusions', expanded: false }
  ];

  closePanel(index: number) {
    setTimeout(() => {
      if (this.accordion) {
        this.accordion.closeAll();
      }
    }, 0);
  }
}
