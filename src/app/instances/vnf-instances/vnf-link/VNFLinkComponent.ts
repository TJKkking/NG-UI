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
 * @file VNFD Link Component.
 */
import { Component, Injector, OnInit } from '@angular/core';
import { VNFInstanceData } from 'VNFInstanceModel';
/**
 * Creating component
 * @Component takes VNFLinkComponent.html as template url
 */
@Component({
  selector: 'app-vnf-link',
  templateUrl: './VNFLinkComponent.html',
  styleUrls: ['./VNFLinkComponent.scss']
})
/** Exporting a class @exports VnfLinkComponent */
export class VNFLinkComponent implements OnInit {
  /** Invoke service injectors @public */
  public injector: Injector;
  /** To get the value from the VNFInstance via valuePrepareFunction default Property of ng-smarttable @public */
  public value: VNFInstanceData;
  constructor(injector: Injector) {
    this.injector = injector;
  }
  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    //empty
  }

}
