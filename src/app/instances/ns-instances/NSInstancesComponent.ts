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
 * @file NS Instance Component
 */
import { Component, Injector, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CONFIGCONSTANT, ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { InstantiateNsComponent } from 'InstantiateNs';
import { LocalDataSource } from 'ng2-smart-table';
import { NSDInstanceData, NSInstanceDetails } from 'NSInstanceModel';
import { NSInstancesActionComponent } from 'NSInstancesActionComponent';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes NSInstancesComponent.html as template url
 */
@Component({
    templateUrl: './NSInstancesComponent.html',
    styleUrls: ['./NSInstancesComponent.scss']
})
/** Exporting a class @exports NSInstancesComponent */
export class NSInstancesComponent implements OnInit {
    /** Injector to invoke other services @public */
    public injector: Injector;

    /** NS Instance array @public */
    public nsInstanceData: object[] = [];

    /** Datasource instance @public */
    public dataSource: LocalDataSource = new LocalDataSource();

    /** SelectedRows array @public */
    public selectedRows: object[] = [];

    /** Selected list array @public */
    public selectList: object[] = [];

    /** Instance component are stored in settings @public */
    public settings: {} = {};

    /** Contains objects for menu settings @public */
    public columnList: {} = {};

    /** Check the loading results @public */
    public isLoadingResults: boolean = true;

    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';

    /** Class for empty and present data @public */
    public checkDataClass: string;

    /** operational State init data @public */
    public operationalStateFirstStep: string = CONFIGCONSTANT.operationalStateFirstStep;

    /** operational State running data @public */
    public operationalStateSecondStep: string = CONFIGCONSTANT.operationalStateSecondStep;

    /** operational State failed data @public */
    public operationalStateThirdStep: string = CONFIGCONSTANT.operationalStateThirdStep;

    /** operational State scaling data @public */
    public operationalStateFourthStep: string = CONFIGCONSTANT.operationalStateFourthStep;

    /** Config State init data @public */
    public configStateFirstStep: string = CONFIGCONSTANT.configStateFirstStep;

    /** Config State init data @public */
    public configStateSecondStep: string = CONFIGCONSTANT.configStateSecondStep;

    /** Config State init data @public */
    public configStateThirdStep: string = CONFIGCONSTANT.configStateThirdStep;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** dataService to pass the data from one component to another @private */
    private dataService: DataService;

    /** Utilizes rest service for any CRUD operations @private */
    private restService: RestService;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    /** Contains tranlsate instance @private */
    private translateService: TranslateService;

    /** Instance of subscriptions @private */
    private generateDataSub: Subscription;

    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.dataService = this.injector.get(DataService);
        this.sharedService = this.injector.get(SharedService);
        this.translateService = this.injector.get(TranslateService);
        this.modalService = this.injector.get(NgbModal);
    }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        this.generateTableColumn();
        this.generateTableSettings();
        this.generateData();
        this.generateDataSub = this.sharedService.dataEvent.subscribe((): void => { this.generateData(); });
    }

    /** Generate smart table row title and filters @public  */
    public generateTableSettings(): void {
        this.settings = {
            columns: this.columnList,
            actions: { add: false, edit: false, delete: false, position: 'right' },
            attr: this.sharedService.tableClassConfig(),
            pager: this.sharedService.paginationPagerConfig(),
            noDataMessage: this.translateService.instant('NODATAMSG')
        };
    }

    /** Generate smart table row title and filters @public  */
    public generateTableColumn(): void {
        this.columnList = {
            name: { title: this.translateService.instant('NAME'), width: '15%', sortDirection: 'asc' },
            identifier: { title: this.translateService.instant('IDENTIFIER'), width: '20%' },
            NsdName: { title: this.translateService.instant('NSDNAME'), width: '15%' },
            OperationalStatus: {
                title: this.translateService.instant('OPERATIONALSTATUS'), width: '10%', type: 'html',
                filter: {
                    type: 'list',
                    config: {
                        selectText: 'Select',
                        list: [
                            { value: this.operationalStateFirstStep, title: this.operationalStateFirstStep },
                            { value: this.operationalStateSecondStep, title: this.operationalStateSecondStep },
                            { value: this.operationalStateThirdStep, title: this.operationalStateThirdStep },
                            { value: this.operationalStateFourthStep, title: this.operationalStateFourthStep }
                        ]
                    }
                },
                valuePrepareFunction: (cell: NSDInstanceData, row: NSDInstanceData): string => {
                    if (row.OperationalStatus === this.operationalStateFirstStep) {
                        return `<span class="icon-label" title="${row.OperationalStatus}">
                        <i class="fas fa-clock text-warning"></i>
                        </span>`;
                    } else if (row.OperationalStatus === this.operationalStateSecondStep) {
                        return `<span class="icon-label" title="${row.OperationalStatus}">
                        <i class="fas fa-check-circle text-success"></i>
                        </span>`;
                    } else if (row.OperationalStatus === this.operationalStateThirdStep) {
                        return `<span class="icon-label" title="${row.OperationalStatus}">
                        <i class="fas fa-times-circle text-danger"></i>
                        </span>`;
                    } else if (row.OperationalStatus === this.operationalStateFourthStep) {
                        return `<span class="icon-label" title="${row.OperationalStatus}">
                        <i class="fas fa-compress-alt text-success"></i>
                        </span>`;
                    } else {
                        return `<span>${row.OperationalStatus}</span>`;
                    }
                }
            },
            ConfigStatus: {
                title: this.translateService.instant('CONFIGSTATUS'), width: '10%', type: 'html',
                filter: {
                    type: 'list',
                    config: {
                        selectText: 'Select',
                        list: [
                            { value: this.configStateFirstStep, title: this.configStateFirstStep },
                            { value: this.configStateSecondStep, title: this.configStateSecondStep },
                            { value: this.configStateThirdStep, title: this.configStateThirdStep }
                        ]
                    }
                },
                valuePrepareFunction: (cell: NSDInstanceData, row: NSDInstanceData): string => {
                    if (row.ConfigStatus === this.configStateFirstStep) {
                        return `<span class="icon-label" title="${row.ConfigStatus}">
                        <i class="fas fa-clock text-warning"></i>
                        </span>`;
                    } else if (row.ConfigStatus === this.configStateSecondStep) {
                        return `<span class="icon-label" title="${row.ConfigStatus}">
                        <i class="fas fa-check-circle text-success"></i>
                        </span>`;
                    } else if (row.ConfigStatus === this.configStateThirdStep) {
                        return `<span class="icon-label" title="${row.ConfigStatus}">
                        <i class="fas fa-times-circle text-danger"></i>
                        </span>`;
                    } else {
                        return `<span>${row.ConfigStatus}</span>`;
                    }
                }
            },
            DetailedStatus: { title: this.translateService.instant('DETAILEDSTATUS'), width: '15%' },
            Actions: {
                name: 'Action', width: '15%', filter: false, sort: false, type: 'custom',
                title: this.translateService.instant('ACTIONS'),
                valuePrepareFunction: (cell: NSDInstanceData, row: NSDInstanceData): NSDInstanceData => row,
                renderComponent: NSInstancesActionComponent
            }
        };
    }

    /** generateData initiate the ns-instance list @public */
    public generateData(): void {
        this.isLoadingResults = true;
        this.restService.getResource(environment.NSDINSTANCES_URL).subscribe((nsdInstancesData: NSInstanceDetails[]): void => {
            this.nsInstanceData = [];
            nsdInstancesData.forEach((nsdInstanceData: NSInstanceDetails): void => {
                const nsDataObj: NSDInstanceData = {
                    name: nsdInstanceData.name,
                    identifier: nsdInstanceData.id,
                    NsdName: nsdInstanceData['nsd-name-ref'],
                    OperationalStatus: nsdInstanceData['operational-status'],
                    ConfigStatus: nsdInstanceData['config-status'],
                    DetailedStatus: nsdInstanceData['detailed-status'],
                    memberIndex: nsdInstanceData.nsd.df,
                    nsConfig: nsdInstanceData.nsd['ns-configuration'],
                    adminDetails: nsdInstanceData._admin,
                    vnfID: nsdInstanceData['vnfd-id'],
                    nsd: nsdInstanceData.nsd,
                    'nsd-id': nsdInstanceData['nsd-id']
                };
                this.nsInstanceData.push(nsDataObj);
            });
            if (this.nsInstanceData.length > 0) {
                this.checkDataClass = 'dataTables_present';
            } else {
                this.checkDataClass = 'dataTables_empty';
            }
            this.dataSource.load(this.nsInstanceData).then((data: {}): void => {
                this.isLoadingResults = false;
            }).catch();
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'get');
            this.isLoadingResults = false;
        });
    }

    /** smart table listing manipulation @public */
    public onChange(perPageValue: number): void {
        this.dataSource.setPaging(1, perPageValue, true);
    }

    /** smart table listing manipulation @public */
    public onUserRowSelect(event: MessageEvent): void {
        Object.assign(event.data, { page: 'ns-instance' });
        this.dataService.changeMessage(event.data);
    }

    /** Instantiate NS using modalservice @public */
    public instantiateNS(): void {
        const modalRef: NgbModalRef = this.modalService.open(InstantiateNsComponent, { backdrop: 'static' });
        modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
            if (result) {
                this.generateData();
            }
        }).catch();
    }

    /**
     * Lifecyle hook which get trigger on component destruction
     */
    public ngOnDestroy(): void {
        this.generateDataSub.unsubscribe();
    }
}
