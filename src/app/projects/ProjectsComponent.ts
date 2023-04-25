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
 * @file Project details Component.
 */
import { isNullOrUndefined } from 'util';
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { LocalDataSource } from 'ng2-smart-table';
import { ProjectCreateUpdateComponent } from 'ProjectCreateUpdate';
import { ProjectLinkComponent } from 'ProjectLinkComponent';
import { ProjectData, ProjectDetails } from 'ProjectModel';
import { ProjectsActionComponent } from 'ProjectsAction';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes ProjectsComponent.html as template url
 */
@Component({
    selector: 'app-projects',
    templateUrl: './ProjectsComponent.html',
    styleUrls: ['./ProjectsComponent.scss']
})
/** Exporting a class @exports ProjectsComponent */
export class ProjectsComponent implements OnInit, OnDestroy {
    /** To inject services @public */
    public injector: Injector;

    /** handle translate @public */
    public translateService: TranslateService;

    /** Data of smarttable populate through LocalDataSource @public */
    public dataSource: LocalDataSource = new LocalDataSource();

    /** Columns list of the smart table @public */
    public columnLists: object = {};

    /** Settings for smarttable to populate the table with columns @public */
    public settings: object = {};

    /** Check the loading results @public */
    public isLoadingResults: boolean = true;

    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';

    /** Instance of the rest service @private */
    private restService: RestService;

    /** dataService to pass the data from one component to another @private */
    private dataService: DataService;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Formation of appropriate Data for LocalDatasource @private */
    private projectData: ProjectData[] = [];

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    /** Instance of subscriptions @private */
    private generateDataSub: Subscription;

    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.dataService = this.injector.get(DataService);
        this.sharedService = this.injector.get(SharedService);
        this.modalService = this.injector.get(NgbModal);
        this.translateService = this.injector.get(TranslateService);
    }

    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.generateColumns();
        this.generateSettings();
        this.generateData();
        this.generateDataSub = this.sharedService.dataEvent.subscribe(() => { this.generateData(); });
    }

    /** smart table Header Colums @public */
    public generateColumns(): void {
        this.columnLists = {
            projectName: {
                title: this.translateService.instant('NAME'), width: '55%', sortDirection: 'asc', type: 'custom',
                valuePrepareFunction: (cell: ProjectData, row: ProjectData): ProjectData => row,
                renderComponent: ProjectLinkComponent
            },
            modificationDate: { title: this.translateService.instant('MODIFIED'), width: '20%' },
            creationDate: { title: this.translateService.instant('CREATED'), width: '20%' },
            Actions: {
                name: 'Action', width: '5%', filter: false, sort: false, type: 'custom',
                title: this.translateService.instant('ACTIONS'),
                valuePrepareFunction: (cell: ProjectData, row: ProjectData): ProjectData => row,
                renderComponent: ProjectsActionComponent
            }
        };
    }

    /** smart table Data Settings @public */
    public generateSettings(): void {
        this.settings = {
            edit: {
                editButtonContent: '<i class="fa fa-edit" title="Edit"></i>',
                confirmSave: true
            },
            delete: {
                deleteButtonContent: '<i class="far fa-trash-alt" title="Delete"></i>',
                confirmDelete: true
            },
            columns: this.columnLists,
            actions: {
                add: false,
                edit: false,
                delete: false,
                position: 'right'
            },
            attr: this.sharedService.tableClassConfig(),
            pager: this.sharedService.paginationPagerConfig(),
            noDataMessage: this.translateService.instant('NODATAMSG')
        };
    }

    /** Modal service to initiate the project add @private */
    public projectAdd(): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const modalRef: NgbModalRef = this.modalService.open(ProjectCreateUpdateComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.projectType = 'Add';
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.generateData();
            }
        }).catch((): void => {
            // Catch Navigation Error
        });
    }

    /** smart table listing manipulation @private */
    public onChange(perPageValue: number): void {
        this.dataSource.setPaging(1, perPageValue, true);
    }

    /** convert UserRowSelect Function @private */
    public onUserRowSelect(event: MessageEvent): void {
        Object.assign(event.data, { page: 'projects' });
        this.dataService.changeMessage(event.data);
    }

    /** Generate Projects object from loop and return for the datasource @public */
    public generateProjectData(projectData: ProjectDetails): ProjectData {
        return {
            projectName: projectData.name,
            modificationDate: this.sharedService.convertEpochTime(!isNullOrUndefined(projectData._admin)
                ? projectData._admin.modified : null),
            creationDate: this.sharedService.convertEpochTime(!isNullOrUndefined(projectData._admin) ? projectData._admin.created : null),
            id: projectData._id,
            project: projectData._id,
            quotas: !isNullOrUndefined(projectData.quotas) && Object.keys(projectData.quotas).length !== 0 ? projectData.quotas : null
        };
    }

    /**
     * Lifecyle hook which get trigger on component destruction
     */
    public ngOnDestroy(): void {
        this.generateDataSub.unsubscribe();
    }

    /** Fetching the data from server to Load in the smarttable @protected */
    protected generateData(): void {
        this.isLoadingResults = true;
        this.restService.getResource(environment.PROJECTS_URL).subscribe((projectsData: ProjectDetails[]) => {
            this.projectData = [];
            projectsData.forEach((projectData: ProjectDetails) => {
                const projectDataObj: ProjectData = this.generateProjectData(projectData);
                this.projectData.push(projectDataObj);
            });
            this.dataSource.load(this.projectData).then((data: boolean) => {
                this.isLoadingResults = false;
            }).catch((): void => {
                // Catch Navigation Error
            });
        }, (error: ERRORDATA) => {
            this.restService.handleError(error, 'get');
            this.isLoadingResults = false;
        });
    }
}
