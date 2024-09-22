import { Component } from '@angular/core';
import { Highlight } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
  selector: 'app-step-1',
  standalone: true,
  imports: [Highlight, HighlightLineNumbers],
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.scss'
})
export class Step1Component {
  //reference to the #viewer element with angular template reference variable
  protected code =
`import { Component } from '@angular/core';

@Component({
  selector: 'app-step-1',
  standalone: true,
  imports: [],
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.scss'
})`;

}
