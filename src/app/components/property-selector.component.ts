import { Component, inject, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { NgSelectComponent, NgSelectModule } from "@ng-select/ng-select";
import { debounceTime, distinctUntilChanged, filter, Subject, switchMap, takeUntil, tap } from "rxjs";
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { DataReaderService } from '../services/data-reader.service';

export interface PropertySelectionItem {
  id: string;
  title: string;
  [key: string]: any;
}

@Component({
  standalone: true,
  selector: 'app-property-selector',
  imports: [NgSelectModule, FormsModule],
  providers: [
    // {
    //   provide: NG_VALUE_ACCESSOR,
    //   useExisting: PropertySelectorComponent,
    //   multi: true
    // },
  ],
  template: `
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
            [class.ng-invalid]="ngControl.invalid"
            [class.ng-valid]="ngControl.valid"
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
        </ng-select>`
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
  public ngControl = inject(NgControl);
  private searchResultItems: PropertySelectionItem[] = [];
  public currentSelection: PropertySelectionItem[] | null = [];

  constructor() {
    this.ngControl.valueAccessor = this;
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
  private onTouched = () => { };
  private onChange = (obj: PropertySelectionItem[] | PropertySelectionItem | null) => { };

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

  async ngOnInit(): Promise<void> {
    this.searchInQuery$.next("");
  };

  private updateSelectableItems() {
    this.typeItems = this.searchResultItems.filter(i => !this.currentSelection?.some(s => s.id === i.id));
  }

  protected selectType(selected: PropertySelectionItem[] | PropertySelectionItem | undefined) {
    if (!selected) {
      this.currentSelection = null;
      this.change.next(undefined);
    } else if (Array.isArray(selected)) {
      this.currentSelection = [...selected];
      this.change.next(selected);
    } else {
      this.currentSelection = [selected];
      this.change.next([selected])
    }
    this.onChange(this.currentSelection);
    this.onTouched();
  }

  public clear() {
    this.selector.clearModel();
  }
}
