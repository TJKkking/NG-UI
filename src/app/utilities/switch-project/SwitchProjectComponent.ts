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
 * @file Switch Project Component
 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIURLHEADER, ERRORDATA, LOCALSTORAGE, URLPARAMS } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { RestService } from 'RestService';

/**
 * Creating component
 * @Component takes SwitchProjectComponent.html as template url
 */
@Component({
  templateUrl: './SwitchProjectComponent.html',
  styleUrls: ['./SwitchProjectComponent.scss']
})
/** Exporting a class @exports SwitchProjectComponent */
export class SwitchProjectComponent implements OnInit {
  /** Invoke service injectors @public */
  public injector: Injector;

  /** dataService to pass the data from one component to another @public */
  public dataService: DataService;

  /** Varaibles to hold http client @public */
  public httpClient: HttpClient;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** FormGroup instance added to the form @ html @public */
  public switchProjectForm: FormGroup;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Check the Projects loading results @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** Input contains component objects @private */
  @Input() private params: URLPARAMS;

  /** Instance of the rest service @private */
  private restService: RestService;

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** Service holds the router information @private */
  private router: Router;

  constructor(injector: Injector) {
    this.injector = injector;
    this.dataService = this.injector.get(DataService);
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.formBuilder = this.injector.get(FormBuilder);
    this.router = this.injector.get(Router);
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.switchProjectForm.controls; }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.initializeForm();
  }

  /** initialize Forms @public */
  public initializeForm(): void {
    this.switchProjectForm = this.formBuilder.group({
      password: ['', [Validators.required]]
    });
  }

  /** Switch project @public */
  public switchProject(): void {
    this.submitted = true;
    if (!this.switchProjectForm.invalid) {
      this.isLoadingResults = true;
      this.headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
      });
      const payLoad: {} = JSON.stringify({
        username: this.params.username,
        password: this.switchProjectForm.value.password,
        project_id: this.params.projectID
      });
      const apiURLHeader: APIURLHEADER = {
        url: environment.GENERATETOKEN_URL,
        httpOptions: { headers: this.headers }
      };
      this.restService.postResource(apiURLHeader, payLoad).subscribe((data: LOCALSTORAGE) => {
        if (data) {
          sessionStorage.setItem('id_token', data.id);
          sessionStorage.setItem('project_id', this.params.projectID);
          sessionStorage.setItem('expires', data.expires.toString());
          sessionStorage.setItem('username', data.username);
          sessionStorage.setItem('project', data.project_name);
          sessionStorage.setItem('token_state', data.id);
          this.activeModal.close();
          if (this.router.url.includes('history-operations')) {
            this.router.navigate(['/instances/ns']).then((): void => {
              location.reload();
            }).catch();
          } else {
            location.reload();
          }
          this.isLoadingResults = false;
        }
      }, (error: ERRORDATA): void => {
        this.isLoadingResults = false;
        this.restService.handleError(error, 'post');
        this.activeModal.close();
      });
    }
  }
}
