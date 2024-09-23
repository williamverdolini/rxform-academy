import { CommonModule } from '@angular/common';
import { Component, inject, } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Highlight } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { PropertySelectorComponent } from '../property-selector.component';

@Component({
  selector: 'app-custom-components',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatTabsModule,
    Highlight,
    HighlightLineNumbers,
    PropertySelectorComponent
  ],
  templateUrl: './custom-components.component.html',
})
export class CustomComponentsComponent {
  #fb = inject(FormBuilder);

  protected form = this.#fb.group({
      title: new FormControl<string>('', { validators: [Validators.required] }),
      completed: new FormControl<boolean>(false),
      period: this.#fb.group({
        fromDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
        toDate: new FormControl<Date | null>(null, { validators: [Validators.required] })
      }),
      nickname: new FormControl<string>(''),
    });

  protected htmlCode = `    <div [formGroup]="form" class="flex-column flex-1">
      <mat-label for="title">Lesson Title</mat-label>
      <app-property-selector name="title" formControlName="title"
        [propertyNameOrId]="'lessons'" [placeholder]="'choose a lesson'" [multiple]="false">
      </app-property-selector>
      <div class="flex-column">
        <div>
          <mat-label for="completed">Course completed</mat-label>
          <mat-checkbox name="completed" formControlName="completed"></mat-checkbox>
        </div>
      </div>
      <mat-label>Period</mat-label>
      <div class="flex-row" formGroupName="period">
        <mat-form-field class="flex-1">
          <mat-label for="fromDate">From Date</mat-label>
          <input name="fromDate" formControlName="fromDate" [matDatepicker]="pickerFD" matInput/>
          <mat-datepicker-toggle matIconSuffix [for]="pickerFD"></mat-datepicker-toggle>
          <mat-datepicker #pickerFD></mat-datepicker>
        </mat-form-field>
        <mat-form-field class="flex-1 m-l-1">
          <mat-label for="toDate">To Date</mat-label>
          <input name="toDate" formControlName="toDate" [matDatepicker]="pickerTD" matInput/>
          <mat-datepicker-toggle matIconSuffix [for]="pickerTD"></mat-datepicker-toggle>
          <mat-datepicker #pickerTD></mat-datepicker>
        </mat-form-field>
      </div>
      <div class="flex-column">
        <mat-form-field>
          <mat-label for="nickname">Nickname</mat-label>
          <input name="nickname" formControlName="nickname" type="text" matInput/>
        </mat-form-field>
      </div>
      <div class="example-button-row">
        <button mat-button (click)="form.reset()">Reset</button>
        <button mat-button mat-flat-button [disabled]="form.invalid">Save</button>
      </div>
    </div>
`;
  protected tsCode = `  #fb = inject(FormBuilder);

  protected form = this.#fb.group({
      title: new FormControl<string>('', { validators: [Validators.required] }),
      completed: new FormControl<boolean>(false),
      period: this.#fb.group({
        fromDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
        toDate: new FormControl<Date | null>(null, { validators: [Validators.required] })
      }),
      nickname: new FormControl<string>(''),
    });
`;

protected componentCode = `@Component({
  standalone: true,
  selector: 'app-property-selector',
  imports: [NgSelectModule, FormsModule],
  providers: [{
      provide: NG_VALUE_ACCESSOR,
      useExisting: PropertySelectorComponent,
      multi: true
  }],
  template: \`
        <ng-select #selector
            [multiple]="multiple"
            [items]="typeItems"
            bindLabel="title"
            bindValue="id"
            [loading]="loading"
            [placeholder]="placeholder"
            [typeahead]="searchInQuery$"
            [virtualScroll]="true"
            [readonly]="disabled()"
            class="m-t-0-5"
            [ngModel]="values()"
            (change)="selectType($event)">
            <ng-template ng-option-tmp let-item="item">
              <div class="flex-row flex-align-baseline">
                <div>{{item.title}}</div>
              </div>
            </ng-template>
            <ng-template ng-label-tmp let-item="item" let-clear="clear">
              <div class="flex-row flex-align-baseline">
                  <span aria-hidden="true" class="ng-value-icon left" (click)="clear(item)">×</span>
                  <div class="m-h-0-5">{{item.title}}</div>
                </div>
            </ng-template>
        </ng-select>\`
})
export class PropertySelectorComponent implements OnInit, ControlValueAccessor {
  protected typeItems: PropertySelectionItem[] = [];
  public loading = false;

  @Input() public propertyNameOrId: string | undefined;
  @Input() public language: string | undefined;
  @Input() public placeholder: string = '';
  @Input() public multiple: boolean = false;
  @Input() public pageSize: number = 10000;
  @Input() public sortDescending: boolean = false;
  @Output() change = new Subject<PropertySelectionItem[] | undefined>();
  @ViewChild('selector', { read: NgSelectComponent }) selector!: NgSelectComponent;

  protected disabled = signal<boolean>(false);
  protected values = signal<PropertySelectionItem[]>([]);
  private destroy$ = new Subject<void>();
  protected searchInQuery$ = new Subject<string>();

  private readerClient = inject(DataReaderService);
  private searchResultItems: PropertySelectionItem[] = [];
  public currentSelection: PropertySelectionItem[] = [];

  constructor() {
    //Perform query search in current omnisearch view
    this.searchInQuery$.pipe(
      takeUntil(this.destroy$),
      filter(_ => !this.loading),
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => {
        this.loading = true;
      }),
      switchMap(_ => this.readerClient.searchSelection(this.propertyNameOrId))
    ).subscribe(response => {
      const items = response?.data ?? [];
      this.searchResultItems = items.map(x => ({
        ...x,
        id: x.id,
        title: x.title,
      }));
      this.updateSelectableItems();
      this.loading = false;
    });
  }

  /** VALIDATION ACCESSOR METHODS */
  private onTouched = () => {};
  private onChange = (obj: PropertySelectionItem[] | PropertySelectionItem | undefined) => {};

  writeValue(obj: PropertySelectionItem[]): void {
    this.values.set(obj ?? []);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected selectType(selected: PropertySelectionItem[] | PropertySelectionItem | undefined) {
    if (!selected) {
      this.currentSelection = [];
      this.change.next(undefined);
    } else if (Array.isArray(selected)) {
      this.currentSelection = [...selected];
      this.change.next(selected);
    } else {
      this.currentSelection = [selected];
      this.change.next([selected])
    }
    this.onChange(this.currentSelection);
  }

  async ngOnInit(): Promise<void> {
    this.searchInQuery$.next("");
  };

  private updateSelectableItems() {
    this.typeItems = this.searchResultItems.filter(i => !this.currentSelection.some(s => s.id === i.id));
  }

  public clear() {
    this.selector.clearModel();
  }
}
`;
}
