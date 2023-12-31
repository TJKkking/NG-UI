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
import { isNullOrUndefined } from 'util';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA, TYPESECTION } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { ProjectData, ProjectDetails, QUOTAITEM, QUOTA_ITEMS } from 'ProjectModel';
import { ProjectService } from 'ProjectService';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';

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
    public domains: TYPESECTION[] = [];

    /** Holds list of quota items @public */
    public quotaItems: QUOTAITEM[] = QUOTA_ITEMS;

    /** Holds project reference from response  @public */
    public quotaRefs: {} = null;

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
            domain_name: [null],
            enable_quota: [false, Validators.required]
        });
    }

    /** convenience getter for easy access to form fields */
    get f(): FormGroup['controls'] { return this.projectForm.controls; }

    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.getProjectType = this.projectType;
        if (this.getProjectType === 'Edit') {
            this.dataService.currentMessage.subscribe((data: ProjectData): void => {
                if (data.projectName !== undefined || data.projectName !== '' || data.projectName !== null) {
                    this.projectForm.patchValue({ project_name: data.projectName });
                    this.projectRef = data.id;
                    this.quotaRefs = data.quotas;
                    this.patchQuotaInfo(this.quotaRefs);
                }
            });
        } else {
            this.patchQuotaInfo();
            this.getProjects();
        }
    }

    /** Get the last project name @public */
    public getProjects(): void {
        this.isLoadingResults = true;
        this.restService.getResource(environment.PROJECTS_URL).subscribe((projects: ProjectDetails[]): void => {
            this.recentProject = projects.slice(-1).pop();
            this.getDomainList();
        }, (error: ERRORDATA): void => {
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
        for (const data of this.quotaItems) {
            if (this.getFormControl(data.value).value > data.maxValue) {
                this.notifierService.notify('error', this.translateService.instant('PAGE.PROJECT.QUOTALIMIT'));
                break;
            }
        }
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
        const projectPayload: ProjectDetails = {
            name: this.projectForm.value.project_name,
            domain_name: !isNullOrUndefined(this.projectForm.value.domain_name) ? this.projectForm.value.domain_name : undefined
        };
        this.addQuotaLimit(projectPayload);
        this.restService.postResource(apiURLHeader, projectPayload).subscribe((): void => {
            this.activeModal.close(this.modalData);
            this.isLoadingResults = false;
            this.notifierService.notify('success', this.translateService.instant('PAGE.PROJECT.CREATEDSUCCESSFULLY'));
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'post');
            this.isLoadingResults = false;
        });
    }
    /** Handle enable quota limit checkbox event @public */
    public checkQuota(): void {
        if (this.getFormControl('enable_quota').value) {
            this.quotaItems.forEach((quotaItem: QUOTAITEM): void => {
                this.projectForm.addControl(quotaItem.value, new FormControl(''));
            });
        } else {
            this.quotaItems.forEach((quotaItem: QUOTAITEM): void => {
                this.getFormControl(quotaItem.value).setValue('');
            });
        }
    }
    /** Edit project @public */
    public editProject(): void {
        this.isLoadingResults = true;
        const apiURLHeader: APIURLHEADER = {
            url: environment.PROJECTS_URL + '/' + this.projectRef
        };
        const projectPayload: ProjectDetails = {
            name: this.projectForm.value.project_name
        };
        this.addQuotaLimit(projectPayload);
        this.restService.patchResource(apiURLHeader, projectPayload).subscribe((): void => {
            this.activeModal.close(this.modalData);
            this.isLoadingResults = false;
            this.projectService.setHeaderProjects();
            this.notifierService.notify('success', this.translateService.instant('PAGE.PROJECT.UPDATEDSUCCESSFULLY'));
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'patch');
            this.isLoadingResults = false;
        });
    }
    /** Get domain name list @private */
    private getDomainList(): void {
        this.isLoadingResults = true;
        this.sharedService.getDomainName().subscribe((domainList: TYPESECTION[]): void => {
            this.domains = domainList;
            this.isLoadingResults = false;
        }, (error: ERRORDATA): void => {
            this.isLoadingResults = false;
            this.restService.handleError(error, 'get');
        });
    }

    /** Used to get the AbstractControl of controlName passed @private */
    private getFormControl(controlName: string): AbstractControl {
        // eslint-disable-next-line security/detect-object-injection
        return this.projectForm.controls[controlName];
    }

    /** Add quota information to payload @private */
    private addQuotaLimit(payload: ProjectDetails): void {
        if (this.getFormControl('enable_quota').value) {
            payload.quotas = {};
            this.quotaItems.forEach((quotaItem: QUOTAITEM): void => {
                if (this.getFormControl(quotaItem.value).value !== '') {
                    payload.quotas[quotaItem.value] = this.getFormControl(quotaItem.value).value;
                }
            });
            if (Object.keys(payload.quotas).length === 0) {
                delete payload.quotas;
            }
        }
    }

    /** Set quota information in project form model @private */
    private patchQuotaInfo(quotaRef?: {}): void {
        if (quotaRef !== null && this.getProjectType === 'Edit') {
            this.getFormControl('enable_quota').setValue(true);
            this.quotaItems.forEach((quotaItem: QUOTAITEM): void => {
                if (!isNullOrUndefined(quotaRef[quotaItem.value])) {
                    this.projectForm.addControl(quotaItem.value, new FormControl(quotaRef[quotaItem.value],
                        [Validators.max(quotaItem.maxValue)]));
                } else {
                    this.projectForm.addControl(quotaItem.value, new FormControl('', [Validators.max(quotaItem.maxValue)]));
                }
            });
        } else {
            this.quotaItems.forEach((quotaItem: QUOTAITEM): void => {
                this.projectForm.addControl(quotaItem.value, new FormControl('', [Validators.min(quotaItem.minValue),
                Validators.max(quotaItem.maxValue)]));
            });
        }
    }
}
