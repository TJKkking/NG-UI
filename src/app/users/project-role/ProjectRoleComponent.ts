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
 * @file Project Role Component.
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { environment } from 'environment';
import { ProjectData } from 'ProjectModel';
import { ProjectService } from 'ProjectService';
import { RestService } from 'RestService';
import { RoleData } from 'RolesModel';
import { ProjectRoleMappings, UserDetail, UserRoleMap } from 'UserModel';

/**
 * Creating component
 * @Component takes ProjectRole.html as template url
 */
@Component({
  templateUrl: './ProjectRoleComponent.html',
  styleUrls: ['./ProjectRoleComponent.scss']
})
/** Exporting a class @exports ProjectRoleComponent */
export class ProjectRoleComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** FormGroup user Edit Account added to the form @ html @public */
  public projectRoleForm: FormGroup;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Input contains Modal dialog component Instance @private */
  @Input() public userTitle: string;

  /** Input contains Modal dialog component Instance @private */
  @Input() public userID: string;

  /** Contains user details information @public */
  public userDetails: UserDetail;

  /** Project Role Mapping @public */
  public projectRoleMap: UserRoleMap = {};

  /** Check the loading results @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Contains project information @public */
  public projects: ProjectData[] = [];

  /** Contains roles information @public */
  public roles: RoleData[] = [];

  /** Instance of the rest service @private */
  private restService: RestService;

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Project Role Form array @private */
  private projectRoleFormArray: FormArray;

  /** Holds all project details @private */
  private projectService: ProjectService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.formBuilder = this.injector.get(FormBuilder);
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.projectService = this.injector.get(ProjectService);
    this.initializeForm();
  }

  /** Generate primitive params @public */
  get projectRoleParamsBuilder(): FormGroup {
    return this.formBuilder.group({
      project_name: [null, [Validators.required]],
      role_name: [null, [Validators.required]]
    });
  }

  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    this.getProjects();
    this.generateData();
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.projectRoleForm.controls; }

  /** Initializing Form Action  @public */
  public initializeForm(): void {
    this.projectRoleForm = this.formBuilder.group({
      project_role_mappings: this.formBuilder.array([])
    });
  }

  /** Handle FormArray Controls @public */
  public getControls(): AbstractControl[] {
    // tslint:disable-next-line:no-backbone-get-set-outside-model
    return (this.projectRoleForm.get('project_role_mappings') as FormArray).controls;
  }

  /** Fetching the data from server to Load in the smarttable @public */
  public generateData(): void {
    if (this.userID !== '') {
      this.isLoadingResults = true;
      this.restService.getResource(environment.USERS_URL + '/' + this.userID).subscribe((userDetails: UserDetail) => {
        this.userDetails = userDetails;
        this.loadMapping();
        this.isLoadingResults = false;
      }, (error: ERRORDATA) => {
        this.isLoadingResults = false;
        this.restService.handleError(error, 'get');
      });
    }
  }
  /** Fetching the projects information @public */
  public getProjects(): void {
    this.isLoadingResults = true;
    this.restService.getResource(environment.PROJECTS_URL).subscribe((projectsData: ProjectData[]) => {
      this.projects = projectsData;
      this.getRoles();
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'get');
    });
  }

  /** Fetching the Roles information @public */
  public getRoles(): void {
    this.restService.getResource(environment.ROLES_URL).subscribe((rolesData: RoleData[]) => {
      this.roles = rolesData;
      this.isLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'get');
    });
  }

  /** Set all roles and project values to the form @public */
  public loadMapping(): void {
    this.userDetails.project_role_mappings.forEach((data: ProjectRoleMappings) => {
      // tslint:disable-next-line:no-backbone-get-set-outside-model
      this.projectRoleFormArray = this.projectRoleForm.get('project_role_mappings') as FormArray;
      this.projectRoleFormArray.push(this.projectRoleParamsBuilder);
    });
    this.projectRoleForm.patchValue(this.userDetails);
  }

  /** Remove project and roles from the list @public */
  public removeMapping(index: number): void {
    this.projectRoleFormArray.removeAt(index);
  }

  /** Submit project and roles @public */
  public addProjectRole(): void {
    this.submitted = true;
    const modalData: MODALCLOSERESPONSEDATA = {
      message: 'Done'
    };
    if (this.projectRoleForm.invalid) { return; }
    const apiURLHeader: APIURLHEADER = {
      url: environment.USERS_URL + '/' + this.userID
    };
    this.projectRoleMap.project_role_mappings = [];
    this.projectRoleForm.value.project_role_mappings.forEach((res: ProjectRoleMappings) => {
      this.projectRoleMap.project_role_mappings.push({ project: res.project_name, role: res.role_name });
    });
    if (this.projectRoleMap.project_role_mappings.length !== 0) {
      this.isLoadingResults = true;
      this.restService.patchResource(apiURLHeader, this.projectRoleMap).subscribe((result: {}) => {
        this.isLoadingResults = false;
        this.activeModal.close(modalData);
        this.projectService.setHeaderProjects();
        this.notifierService.notify('success', this.translateService.instant('PAGE.USERS.EDITEDSUCCESSFULLY'));
      }, (error: ERRORDATA) => {
        this.isLoadingResults = false;
        this.restService.handleError(error, 'patch');
      });
    } else {
      this.notifierService.notify('error', this.translateService.instant('PAGE.USERS.EDITPROJECTROLEERROR'));
    }
  }

  /** Add extra mapping and set empty project and roles @public */
  public addMapping(): void {
    // tslint:disable-next-line:no-backbone-get-set-outside-model
    this.projectRoleFormArray = this.projectRoleForm.get('project_role_mappings') as FormArray;
    this.projectRoleFormArray.push(this.projectRoleParamsBuilder);
  }
}
