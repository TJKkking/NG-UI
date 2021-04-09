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
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ERRORDATA, GETAPIURLHEADER, URLPARAMS } from 'CommonModel';
import { environment } from 'environment';
import * as jsyaml from 'js-yaml';
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

  /** Check the loading results @public */
  public isLoadingResults: boolean = false;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Contains files information @public */
  public contents: {}[];

  /** Input contains component objects @public */
  @Input() public params: URLPARAMS;

  /** Instance of the rest service @private */
  private restService: RestService;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate @public
   */
  public ngOnInit(): void {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    if (this.params.page === 'nsd') {
      this.getContent(environment.NSDESCRIPTORS_URL + '/' + this.params.id + '/artifacts');
    } else if (this.params.page === 'vnfd') {
      this.getContent(environment.VNFPACKAGES_URL + '/' + this.params.id + '/artifacts');
    }
  }
  /** Get the NSD Content List @public */
  public getContent(URL: string): void {
    this.isLoadingResults = true;
    const httpOptions: GETAPIURLHEADER = {
      headers: this.headers,
      responseType: 'text'
    };
    this.restService.getResource(URL, httpOptions).subscribe((content: {}[]): void => {
      const getJson: string[] = jsyaml.load(content.toString(), { json: true });
      this.contents = getJson;
      this.isLoadingResults = false;
    }, (error: ERRORDATA): void => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }
}
