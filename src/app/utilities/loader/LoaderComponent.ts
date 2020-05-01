/*
 Copyright 2020 TATA ELXSI

 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 Author: KUMARAN M (kumaran.m@tataelxsi.co.in), RAJESH S (rajesh.s@tataelxsi.co.in), BARATH KUMAR R (barath.r@tataelxsi.co.in)
*/
/**
 * @file Delete Model
 */
import { Component, Input, OnInit } from '@angular/core';
/**
 * Creating component
 * @Component takes LoaderComponent.html as template url
 */
@Component({
  selector: 'app-loader',
  templateUrl: './LoaderComponent.html',
  styleUrls: ['./LoaderComponent.scss']
})
/** Exporting a class @exports LoaderComponent */
export class LoaderComponent implements OnInit {
  /** Variables declared to get the message from parents @public */
  @Input() public waitingMessage: string;
  /** Variables declared to get the message of loader @public */
  public getMessage: string;

  constructor() {
    // Empty block
  }

  public ngOnInit(): void {
    if (this.waitingMessage !== '') {
      this.getMessage = this.waitingMessage;
    } else {
      this.getMessage = '';
    }
  }

}
