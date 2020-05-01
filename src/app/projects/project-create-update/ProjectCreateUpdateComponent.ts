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
 * @file Project Add Modal
 */
import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { ProjectData, ProjectDetails } from 'ProjectModel';
import { ProjectService } from 'ProjectService';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';

/**
 * Creating component
 * @Component takes ProjectCreateUpdateComponent.html as template url
 */
@Component({
  selector: 'app-project-create-update',
  templateUrl: './ProjectCreateUpdateComponent.html',
  styleUrls: ['./ProjectCreateUpdateComponent.scss']
})
/** Exporting a class @exports ProjectCreateUpdateComponent */
export class ProjectCreateUpdateComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Instance of the rest service @public */
  public restService: RestService;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Contains the recently created project details @public */
  public recentProject: ProjectDetails;

  /** Contains project name @public */
  public projectName: string;

  /** Contains project create or edit @public */
  public getProjectType: string;

  /** To inject input type services @public */
  @Input() public projectType: string;

  /** FormGroup user Edit Account added to the form @ html @public */
  public projectForm: FormGroup;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Check the loading results for loader status @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Holds list of domains @public */
  public domains: {}[] = [];

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** DataService to pass the data from one component to another @private */
  private dataService: DataService;

  /** Contains project name ref @private */
  private projectRef: string;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** ModalData instance of modal @private  */
  private modalData: MODALCLOSERESPONSEDATA;

  /** Holds all project details @private */
  private projectService: ProjectService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.formBuilder = this.injector.get(FormBuilder);
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.dataService = this.injector.get(DataService);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
    this.projectService = this.injector.get(ProjectService);
    /** Initializing Form Action */
    this.projectForm = this.formBuilder.group({
      project_name: ['', Validators.required],
      domain_name: [null]
    });
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.projectForm.controls; }

  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    this.getProjectType = this.projectType;
    if (this.getProjectType === 'Edit') {
      this.dataService.currentMessage.subscribe((data: ProjectData) => {
        if (data.projectName !== undefined || data.projectName !== '' || data.projectName !== null) {
          this.projectName = data.projectName;
          this.projectRef = data.id;
        }
      });
    } else {
      this.getProjects();
    }
  }

  /** Get the last project name @public */
  public getProjects(): void {
    this.isLoadingResults = true;
    this.restService.getResource(environment.PROJECTS_URL).subscribe((projects: ProjectDetails[]) => {
      this.recentProject = projects.slice(-1).pop();
      this.getDomainName();
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }

  /** On modal submit users acction will called @public */
  public projectAction(userType: string): void {
    this.submitted = true;
    this.modalData = {
      message: 'Done'
    };
    this.sharedService.cleanForm(this.projectForm);
    if (!this.projectForm.invalid) {
      if (userType === 'Add') {
        this.createProject();
      } else if (userType === 'Edit') {
        this.editProject();
      }
    }
  }

  /** Create project @public */
  public createProject(): void {
    this.isLoadingResults = true;
    const apiURLHeader: APIURLHEADER = {
      url: environment.PROJECTS_URL
    };
    const projectPayload: {} = {
      name: this.projectForm.value.project_name,
      domain_name: !isNullOrUndefined(this.projectForm.value.domain_name) ? this.projectForm.value.domain_name : undefined
    };
    this.restService.postResource(apiURLHeader, projectPayload).subscribe(() => {
      this.activeModal.close(this.modalData);
      this.isLoadingResults = false;
      this.notifierService.notify('success', this.translateService.instant('PAGE.PROJECT.CREATEDSUCCESSFULLY'));
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'post');
      this.isLoadingResults = false;
    });
  }
  /** Edit project @public */
  public editProject(): void {
    this.isLoadingResults = true;
    const apiURLHeader: APIURLHEADER = {
      url: environment.PROJECTS_URL + '/' + this.projectRef
    };
    this.restService.patchResource(apiURLHeader, { name: this.projectForm.value.project_name }).subscribe(() => {
      this.activeModal.close(this.modalData);
      this.isLoadingResults = false;
      this.projectService.setHeaderProjects();
      this.notifierService.notify('success', this.translateService.instant('PAGE.PROJECT.UPDATEDSUCCESSFULLY'));
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'patch');
      this.isLoadingResults = false;
    });
  }
  /** Get domain name @private */
  private getDomainName(): void {
    this.restService.getResource(environment.DOMAIN_URL).subscribe((domains: { project_domain_name: string, user_domain_name: string }) => {
      let domainNames: string[] = [];
      if (!isNullOrUndefined(domains.project_domain_name)) {
        domainNames = domainNames.concat(domains.project_domain_name.split(','));
      }
      if (!isNullOrUndefined(domains.user_domain_name)) {
        domainNames = domainNames.concat(domains.user_domain_name.split(','));
      }
      domainNames = Array.from(new Set(domainNames));
      this.checkDomainNames(domainNames);
      this.isLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }

  /** Check the domain names and create modal for domain select @private */
  private checkDomainNames(domainNames: string[]): void {
    if (domainNames.length > 0) {
      domainNames.forEach((domainName: string) => {
        if (!domainName.endsWith(':ro')) {
          this.domains.push({ id: domainName, text: domainName });
        }
      });
    }
  }
}
