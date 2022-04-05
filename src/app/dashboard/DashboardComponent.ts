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
 * @file Dashboard Component
 */
import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { AuthenticationService } from 'AuthenticationService';
import { Chart } from 'chart.js';
import 'chartjs-plugin-labels';
import { ERRORDATA, TYPESECTION, VIM_TYPES } from 'CommonModel';
import { environment } from 'environment';
import { NSDDetails } from 'NSDModel';
import { NSInstanceDetails } from 'NSInstanceModel';
import { ProjectData, ProjectDetails } from 'ProjectModel';
import { ProjectService } from 'ProjectService';
import { RestService } from 'RestService';
import { Observable, Subscription } from 'rxjs';
import { SDNControllerModel } from 'SDNControllerModel';
import { SharedService } from 'SharedService';
import { ProjectRoleMappings, UserDetail } from 'UserModel';
import { isNullOrUndefined } from 'util';
import { VimAccountDetails } from 'VimAccountModel';
import { VNFInstanceDetails } from 'VNFInstanceModel';

/**
 * Creating component
 * @Component takes DashboardComponent.html as template url
 */
@Component({
    styleUrls: ['./DashboardComponent.scss'],
    templateUrl: './DashboardComponent.html'
})

/**
 * This file created during the angular project creation
 */

/** Exporting a class @exports DashboardComponent */
export class DashboardComponent implements OnInit {
    /** Invoke service injectors @public */
    public injector: Injector;

    /** handle translate @public */
    public translateService: TranslateService;

    /** Observable holds logined value  @public */
    public username$: Observable<string>;

    /** Variables holds admin is logged or not @public */
    public isAdmin: boolean;

    /** List of NS failed Instances @public */
    public nsFailedInstances: {}[] = [];

    /** Setting up count for vnfdPackages @public */
    public vnfdPackageCount: number;

    /** Setting up count for nsdPackage @public */
    public nsdPackageCount: number;

    /** Setting up count for nsInstance @public */
    public nsInstanceCount: number;

    /** Setting up count for vnfInstance @public */
    public vnfInstanceCount: number;

    /** Setting up count for vimAccount @public */
    public vimAccountCount: number;

    /** Setting up count for sdnController @public */
    public sdnControllerCount: number;

    /** Variables holds current project details @public */
    public currentProjectDetails: {};

    /** Array holds all the projects @public */
    public projectList: {}[] = [];

    /** Array holds all the projects @public */
    public allProjectList: {}[] = [];

    /** Variables holds the selected project @public */
    public selectedProject: Observable<string>;

    /** Check the Instances loading results @public */
    public isCanvasLoadingResults: boolean = true;

    /** Check the Projects loading results @public */
    public isProjectsLoadingResults: boolean = true;

    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';

    /** List of NS Success Instances @public */
    public nsRunningInstance: string[] = [];

    /** Contains VIM Account details @public */
    public vimData: VimAccountDetails[] = [];

    /** Contains Selected VIM Details @public */
    public selectedVIMDetails: VimAccountDetails = null;

    /** List of VIM_TYPES @public */
    public vimTypes: TYPESECTION[] = VIM_TYPES;

    /** Array holds Vim data filtered with selected vimtype  */
    public vimList: VimAccountDetails[] = [];

    /** Model value used to hold selected vimtype Data @public */
    public vimListData: string;

    /** List of color for Instances @private */
    private backgroundColor: string[] = [];

    /** Utilizes rest service for any CRUD operations @private */
    private restService: RestService;

    /** Utilizes auth service for any auth operations @private */
    private authService: AuthenticationService;

    /** Used to subscribe vnfdPackage @private */
    private vnfdPackageCountSub: Subscription;

    /** Used to subscribe nsdPackage @private */
    private nsdPackageCountSub: Subscription;

    /** Used to subscribe nsInstance @private */
    private nsInstanceCountSub: Subscription;

    /** Used to subscribe vnfInstance @private */
    private vnfInstanceCountSub: Subscription;

    /** Used to subscribe vimAccount @private */
    private vimAccountCountSub: Subscription;

    /** Used to subscribe sdnController @private */
    private sdnControllerCountSub: Subscription;

    /** No of Hours of NS Success Instances @private */
    private noOfHours: number[] = [];

    /** collects charts objects @private */
    private charts: object = [];

    /** Contains all methods related to projects @private */
    private projectService: ProjectService;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    /** Contains NS Instance Details */
    private nsInstancesDataArr: {}[];

    /** Container created time array @private */
    private createdTimes: string[] = [];

    /** Contains slice limit const @private */
    private sliceLimit: number = 10;

    /** Contians hour converter @private */
    private hourConverter: number = 3600;

    /** Notifier service to popup notification @private */
    private notifierService: NotifierService;

    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.authService = this.injector.get(AuthenticationService);
        this.projectService = this.injector.get(ProjectService);
        this.sharedService = this.injector.get(SharedService);
        this.translateService = this.injector.get(TranslateService);
        this.notifierService = this.injector.get(NotifierService);
    }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        this.username$ = this.authService.username;
        this.isAdmin = (localStorage.getItem('isAdmin') === 'true') ? true : false;
        this.selectedProject = this.authService.ProjectName;
        this.checkAdminPrivilege();
        this.getUserAccessedProjects();
        this.getAllProjects();
        this.getVnfdPackageCount();
        this.getNsdPackageCount();
        this.getNsInstanceCount();
        this.getVnfInstanceCount();
        this.getVimAccountCount();
        this.getSDNControllerCount();
    }

    /** Get all the projects @public */
    public getUserAccessedProjects(): void {
        this.projectService.getUserProjects().subscribe((projects: UserDetail): void => {
            const projectList: {}[] = projects.project_role_mappings;
            this.projectList = projectList.filter(
                (thing: ProjectRoleMappings, i: number, arr: []): boolean => arr
                    .findIndex((t: ProjectRoleMappings): boolean => t.project_name === thing.project_name) === i
            );
        }, (error: Error): void => {
            // TODO: Handle failure
        });
    }

    /** Fetching all the Project in dashboard @public */
    public getAllProjects(): void {
        this.isProjectsLoadingResults = true;
        this.restService.getResource(environment.PROJECTS_URL).subscribe((projectsData: ProjectDetails[]): void => {
            this.allProjectList = [];
            projectsData.forEach((projectData: ProjectDetails): void => {
                const projectDataObj: ProjectData = this.generateProjectData(projectData);
                this.allProjectList.push(projectDataObj);
            });
            this.isProjectsLoadingResults = false;
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'get');
            this.isProjectsLoadingResults = false;
        });
    }

    /** Generate Projects object from loop and return for the datasource @public */
    public generateProjectData(projectData: ProjectDetails): ProjectData {
        return {
            projectName: projectData.name,
            modificationDate: this.sharedService.convertEpochTime(projectData._admin.modified),
            creationDate: this.sharedService.convertEpochTime(projectData._admin.created),
            id: projectData._id,
            project: projectData._id
        };
    }

    /** Function to check admin privilege @public */
    public checkAdminPrivilege(): void {
        if (!this.isAdmin) {
            this.projectService.getCurrentProjectDetails().subscribe((projectDetails: {}): void => {
                this.currentProjectDetails = projectDetails;
            }, (error: Error): void => {
                // TODO: Handle failure
            });
        }
    }

    /** Get VNFD Package details @public */
    public getVnfdPackageCount(): void {
        this.vnfdPackageCountSub = this.restService.getResource(environment.VNFPACKAGESCONTENT_URL)
            .subscribe((vnfdPackageData: []): void => {
                this.vnfdPackageCount = vnfdPackageData.length;
            }, (error: ERRORDATA): void => {
                this.restService.handleError(error, 'get');
            });
    }

    /** Get NSD Package details @public */
    public getNsdPackageCount(): void {
        this.nsdPackageCountSub = this.restService.getResource(environment.NSDESCRIPTORSCONTENT_URL)
            .subscribe((nsdPackageData: NSDDetails[]): void => {
                this.nsdPackageCount = nsdPackageData.length;
            }, (error: ERRORDATA): void => {
                this.restService.handleError(error, 'get');
            });
    }

    /** Get NS Instance details @public */
    public getNsInstanceCount(): void {
        this.isCanvasLoadingResults = true;
        this.nsInstanceCountSub = this.restService.getResource(environment.NSDINSTANCES_URL)
            .subscribe((nsInstancesData: NSInstanceDetails[]): void => {
                this.nsInstancesDataArr = nsInstancesData;
                this.nsInstanceCount = nsInstancesData.length;
                this.nsInstanceChart();
                this.isCanvasLoadingResults = false;
            }, (error: ERRORDATA): void => {
                this.restService.handleError(error, 'get');
                this.isCanvasLoadingResults = false;
            });
    }

    /** Get NS Instance chart details @public */
    public nsInstanceChart(): void {
        this.nsInstancesDataArr.forEach((nsdInstanceData: NSDDetails): void => {
            const operationalStatus: string = nsdInstanceData['operational-status'];
            const configStatus: string = nsdInstanceData['config-status'];
            if (operationalStatus === 'failed' || configStatus === 'failed') {
                this.nsFailedInstances.push(nsdInstanceData);
            } else if (operationalStatus === 'running' && configStatus === 'configured') {
                this.nsRunningInstance.push(nsdInstanceData.name);
                this.backgroundColor.push(this.sharedService.generateColor());
                this.createdTimes.push(((nsdInstanceData._admin.created).toString()).slice(0, this.sliceLimit));
            }
        });
        const now: Date = new Date();
        const currentTime: number = Number((now.getTime().toString().slice(0, this.sliceLimit)));
        this.createdTimes.forEach((createdTime: string): void => {
            this.noOfHours.push((Math.round((currentTime - Number(createdTime)) / this.hourConverter)));
        });
        this.drawNsChart();
    }

    /** Prepare and sketch NS instance chart */
    public drawNsChart(): void {
        this.charts = new Chart('canvas', {
            type: 'bar',
            data: {
                labels: this.nsRunningInstance,
                datasets: [{
                    data: this.noOfHours,
                    label: this.translateService.instant('NOOFHOURS'),
                    borderColor: this.backgroundColor,
                    fill: false,
                    backgroundColor: this.backgroundColor
                }]
            },
            options: {
                layout: {
                    padding: {
                        top: 20
                    }
                },
                hover: {
                    onHover(evt: Event, item: {}): void {
                        const el: HTMLElement = document.getElementById('canvas');
                        el.style.cursor = item[0] ? 'pointer' : 'default';
                    }
                },
                plugins: {
                    labels: {
                        // render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
                        render: 'value'
                    }
                },
                legend: { display: false },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: this.translateService.instant('INSTANCES')
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: this.translateService.instant('NOOFHOURS')
                        }
                    }]
                }
            }
        });
    }

    /** Get VNFD instance details @public */
    public getVnfInstanceCount(): void {
        this.vnfInstanceCountSub = this.restService.getResource(environment.NSDINSTANCES_URL)
            .subscribe((vnfInstanceData: VNFInstanceDetails[]): void => {
                this.vnfInstanceCount = vnfInstanceData.length;
            }, (error: ERRORDATA): void => {
                this.restService.handleError(error, 'get');
            });
    }

    /** Get VIM account details @public */
    public getVimAccountCount(): void {
        this.vimAccountCountSub = this.restService.getResource(environment.VIMACCOUNTS_URL)
            .subscribe((vimAccountData: VimAccountDetails[]): void => {
                this.vimAccountCount = vimAccountData.length;
                this.vimData = vimAccountData;
            }, (error: ERRORDATA): void => {
                this.restService.handleError(error, 'get');
            });
    }

    /** Get SDN Controller Count  @public */
    public getSDNControllerCount(): void {
        this.sdnControllerCountSub = this.restService.getResource(environment.SDNCONTROLLER_URL)
            .subscribe((sdnControllerData: SDNControllerModel[]): void => {
                this.sdnControllerCount = sdnControllerData.length;
            }, (error: ERRORDATA): void => {
                this.restService.handleError(error, 'get');
            });
    }

    /** Get Vim data filtered by the selected Vim Type @public */
    public getSelectedVimTypeList(selectedVIMType: string): void {
        this.vimList = this.vimData.filter((vimData: VimAccountDetails): boolean =>
            vimData.vim_type === selectedVIMType);
        if (this.vimList.length === 0) {
            this.vimListData = null;
        }

    }

    /** Get Selected VIM details @public */
    public getSelectedVIMDetails(vimDetails: VimAccountDetails): void {
        if (!isNullOrUndefined(vimDetails.resources)) {
            this.selectedVIMDetails = vimDetails;
        } else {
            this.notifierService.notify('error', this.translateService.instant('RESOURCESNOTFOUND'));
        }
    }

    /**
     * Lifecyle Hooks the trigger before component is deleted
     */
    public ngOnDestroy(): void {
        this.vnfdPackageCountSub.unsubscribe();
        this.nsdPackageCountSub.unsubscribe();
        this.nsInstanceCountSub.unsubscribe();
        this.vnfInstanceCountSub.unsubscribe();
        this.vimAccountCountSub.unsubscribe();
        this.sdnControllerCountSub.unsubscribe();
    }
}
