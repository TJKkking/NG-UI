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
 * @file OsmRepoCreateUpdateComponent.ts
 */
import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA, OSMREPO_TYPES, TYPESECTION } from 'CommonModel';
import { environment } from 'environment';
import { OSMRepoDetails } from 'OsmRepoModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
/**
 * Creating Component
 * @Component takes OsmRepoCreateUpdateComponent.html as template url
 */
@Component({
  selector: 'app-osm-repo-create-update',
  templateUrl: './OsmRepoCreateUpdateComponent.html',
  styleUrls: ['./OsmRepoCreateUpdateComponent.scss']
})
export class OsmRepoCreateUpdateComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Instance of the rest service @public */
  public restService: RestService;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Setting OSM Repo types in array @public */
  public osmrepoType: TYPESECTION[];

  /** FormGroup osm repo added to the form @ html @public */
  public osmrepoForm: FormGroup;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Check the loading results for loader status @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Contains osm repo create or edit @public */
  public getCreateupdateType: string;

  /** To inject input type services For creation or edit @public */
  @Input() public createupdateType: string;

  /** To inject input type services for ID @public */
  @Input() public osmrepoid: string;

  /** Contains all methods related to shared @public */
  public sharedService: SharedService;

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.formBuilder = this.injector.get(FormBuilder);
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.osmrepoForm.controls; }

  public ngOnInit(): void {
    this.osmrepoType = OSMREPO_TYPES;
    this.osmRepoFormInitialize();
    this.getCreateupdateType = this.createupdateType;
    if (this.getCreateupdateType === 'Edit') {
      this.fetchAssigndata();
    }
  }

  /** On modal initializing forms  @public */
  public osmRepoFormInitialize(): void {
    this.osmrepoForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      type: [null, [Validators.required]],
      url: [null, [Validators.required, Validators.pattern(this.sharedService.REGX_URL_PATTERN)]],
      description: [null, [Validators.required]]
    });
  }

  /** Assign and get the osm repo details for edit section @public */
  public fetchAssigndata(): void {
    this.isLoadingResults = true;
    this.restService.getResource(environment.OSMREPOS_URL + '/' + this.osmrepoid).subscribe((data: OSMRepoDetails) => {
      this.osmrepoForm.setValue({
        name: data.name,
        type: data.type,
        url: data.url,
        description: data.description
      });
      this.isLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }

  /** On modal submit osm Repo will called @public */
  public osmRepoSubmit(): void {
    this.submitted = true;
    this.sharedService.cleanForm(this.osmrepoForm);
    if (this.osmrepoForm.invalid) {
      return;
    }
    this.isLoadingResults = true;
    const modalData: MODALCLOSERESPONSEDATA = {
      message: 'Done'
    };
    if (this.getCreateupdateType === 'Add') {
      const apiURLHeader: APIURLHEADER = {
        url: environment.OSMREPOS_URL
      };
      this.addOsmRepo(apiURLHeader, modalData);
    } else if (this.getCreateupdateType === 'Edit') {
      const apiURLHeader: APIURLHEADER = {
        url: environment.OSMREPOS_URL + '/' + this.osmrepoid
      };
      this.editOsmRepo(apiURLHeader, modalData);
    } else {
      this.notifierService.notify('error', this.translateService.instant('ERROR'));
    }
  }

  /** This function used to add the osm repo @public */
  public addOsmRepo(apiURLHeader: APIURLHEADER, modalData: MODALCLOSERESPONSEDATA): void {
    this.restService.postResource(apiURLHeader, this.osmrepoForm.value).subscribe(() => {
      this.activeModal.close(modalData);
      this.notifierService.notify('success', this.translateService.instant('PAGE.OSMREPO.CREATEDSUCCESSFULLY'));
      this.isLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'post');
    });
  }

  /** This function used to Edit the osm repo @public */
  public editOsmRepo(apiURLHeader: APIURLHEADER, modalData: MODALCLOSERESPONSEDATA): void {
    this.restService.patchResource(apiURLHeader, this.osmrepoForm.value).subscribe(() => {
      this.activeModal.close(modalData);
      this.notifierService.notify('success', this.translateService.instant('PAGE.OSMREPO.UPDATEDSUCCESSFULLY'));
      this.isLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'patch');
    });
  }
}
