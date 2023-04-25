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
 * @file k8sAddRepoComponent.ts.
 */
import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { environment } from 'environment';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
/**
 * Creating Component
 * @Component takes K8sAddRepoComponent.html as template url
 */
@Component({
  selector: 'app-k8s-add-repo',
  templateUrl: './K8sAddRepoComponent.html',
  styleUrls: ['./K8sAddRepoComponent.scss']
})
/** Exporting a class @exports K8sAddRepoComponent */
export class K8sAddRepoComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** FormGroup instance added to the form @ html @public */
  public k8srepoForm: FormGroup;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Supported Vim type for the dropdown */
  public repoTypeSelect: {}[];

  /** Check the loading results @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** Utilizes rest service for any CRUD operations @private */
  private restService: RestService;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.formBuilder = this.injector.get(FormBuilder);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
  }

  public ngOnInit(): void {
    this.repoTypeSelect = [
      { id: 'helm-chart', name: 'Helm Chart' },
      { id: 'juju-bundle', name: 'Juju Bundle' }
    ];
    /** On Initializing call the methods */
    this.k8srepoFormAction();
  }

  /** On modal initializing forms  @public */
  public k8srepoFormAction(): void {
    this.k8srepoForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      type: [null, [Validators.required]],
      url: ['', [Validators.required, Validators.pattern(this.sharedService.REGX_URL_PATTERN)]],
      description: ['', [Validators.required]]
    });
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.k8srepoForm.controls; }

  /** On modal submit k8sAddRepoSubmit will called @public */
  public k8sAddRepoSubmit(): void {
    this.submitted = true;
    this.sharedService.cleanForm(this.k8srepoForm);
    if (this.k8srepoForm.invalid) {
      return;
    }
    this.isLoadingResults = true;
    const modalData: MODALCLOSERESPONSEDATA = {
      message: 'Done'
    };
    const apiURLHeader: APIURLHEADER = {
      url: environment.K8REPOS_URL
    };
    this.restService.postResource(apiURLHeader, this.k8srepoForm.value).subscribe((result: {}) => {
      this.activeModal.close(modalData);
      this.notifierService.notify('success', this.k8srepoForm.value.name +
        this.translateService.instant('PAGE.K8S.CREATEDSUCCESSFULLY'));
      this.isLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'post');
    });
  }
}
