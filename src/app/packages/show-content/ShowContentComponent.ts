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
 * @file Show content modal
 */
import { Component, Injector, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ERRORDATA, URLPARAMS } from 'CommonModel';
import { environment } from 'environment';
import { RestService } from 'RestService';

/** Shows json data in the information modal */
const defaults: {} = { 'text/json': '' };

/**
 * Creating component
 * @Component takes ShowContentComponent.html as template url
 */
@Component({
  selector: 'app-show-content',
  templateUrl: './ShowContentComponent.html',
  styleUrls: ['./ShowContentComponent.scss']
})
/** Exporting a class @exports ShowContentComponent */
export class ShowContentComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Contains files information @public */
  public contents: {}[];

  /** Input contains component objects @public */
  @Input() public params: URLPARAMS;

  /** Instance of the rest service @private */
  private restService: RestService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate @public
   */
  public ngOnInit(): void {
    if (this.params.page === 'nsd') {
      this.restService.getResource(environment.NSDESCRIPTORS_URL + '/' + this.params.id + '/artifacts/artifactPath')
        .subscribe((nsd: {}[]) => {
          this.contents = nsd;
        }, (error: ERRORDATA) => {
          this.restService.handleError(error, 'get');
        });
    } else if (this.params.page === 'vnfd') {
      this.restService.getResource(environment.VNFPACKAGES_URL + '/' + this.params.id + '/artifacts/artifactPath')
        .subscribe((vnfd: {}[]) => {
          this.contents = vnfd;
        }, (error: ERRORDATA) => {
          this.restService.handleError(error, 'get');
        });
    }
  }
}
