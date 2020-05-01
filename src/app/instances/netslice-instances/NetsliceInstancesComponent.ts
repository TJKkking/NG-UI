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
 * @file Netslice Instance Component
 */
import { Component, Injector, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CONFIGCONSTANT, ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { InstantiateNetSliceTemplateComponent } from 'InstantiateNetSliceTemplate';
import { NetsliceInstancesActionComponent } from 'NetsliceInstancesActionComponent';
import { NSTInstanceData, NSTInstanceDetails } from 'NetworkSliceModel';
import { LocalDataSource } from 'ng2-smart-table';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes NetsliceInstancesComponent.html as template url
 */
@Component({
    templateUrl: './NetsliceInstancesComponent.html',
    styleUrls: ['./NetsliceInstancesComponent.scss']
})

/** Exporting a class @exports NetsliceInstancesComponent */
export class NetsliceInstancesComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;

    /** handle translate @public */
    public translateService: TranslateService;

    /** Columns list of the smart table @public */
    public columnLists: object = {};

    /** Settings for smarttable to populate the table with columns @public */
    public settings: object = {};

    /** Datasource instance inititated  @public */
    public dataSource: LocalDataSource = new LocalDataSource();

    /** Datasource table Data for the NST @public */
    public nstInstanceData: NSTInstanceData[] = [];

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

    /** Config State init data @public */
    public configStateFirstStep: string = CONFIGCONSTANT.configStateFirstStep;

    /** Config State init data @public */
    public configStateSecondStep: string = CONFIGCONSTANT.configStateSecondStep;

    /** Config State init data @public */
    public configStateThirdStep: string = CONFIGCONSTANT.configStateThirdStep;

    /** config status assign @public */
    public configStatusCheck: string;

    /** To consume REST API calls @private */
    private dataService: DataService;

    /** Utilizes rest service for any CRUD operations @public */
    private restService: RestService;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Instance of subscriptions @private */
    private generateDataSub: Subscription;

    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.translateService = this.injector.get(TranslateService);
        this.sharedService = this.injector.get(SharedService);
        this.modalService = this.injector.get(NgbModal);
        this.dataService = this.injector.get(DataService);
    }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        this.generateTableColumn();
        this.generateTableSettings();
        this.generateData();
        this.generateDataSub = this.sharedService.dataEvent.subscribe(() => { this.generateData(); });
    }

    /** smart table listing manipulation @private */
    public onChange(perPageValue: number): void {
        this.dataSource.setPaging(1, perPageValue, true);
    }

    /** smart table listing manipulation @private */
    public onUserRowSelect(event: MessageEvent): void {
        Object.assign(event.data, { page: 'net-slice-instance' });
        this.dataService.changeMessage(event.data);
    }

    /** Instantiate Net Slice using modalservice @public */
    public instantiateNetSlice(): void {
        const modalRef: NgbModalRef = this.modalService.open(InstantiateNetSliceTemplateComponent, { backdrop: 'static' });
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.generateData();
            }
        }).catch();
    }

    /** Generate smart table row title and filters @public  */
    public generateTableSettings(): void {
        this.settings = {
            columns: this.columnLists,
            actions: { add: false, edit: false, delete: false, position: 'right' },
            attr: this.sharedService.tableClassConfig(),
            pager: this.sharedService.paginationPagerConfig(),
            noDataMessage: this.translateService.instant('NODATAMSG')
        };
    }

    /** Generate smart table row title and filters @public  */
    public generateTableColumn(): void {
        this.columnLists = {
            name: { title: this.translateService.instant('NAME'), width: '15%', sortDirection: 'asc' },
            identifier: { title: this.translateService.instant('IDENTIFIER'), width: '15%' },
            NstName: { title: this.translateService.instant('NSTNAME'), width: '15%' },
            OperationalStatus: {
                type: 'html',
                title: this.translateService.instant('OPERATIONALSTATUS'),
                width: '15%',
                filter: {
                    type: 'list',
                    config: {
                        selectText: 'Select',
                        list: [
                            { value: this.operationalStateFirstStep, title: this.operationalStateFirstStep },
                            { value: this.operationalStateSecondStep, title: this.operationalStateSecondStep },
                            { value: this.operationalStateThirdStep, title: this.operationalStateThirdStep }
                        ]
                    }
                },
                valuePrepareFunction: (cell: NSTInstanceData, row: NSTInstanceData): string => {
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
                    } else {
                        return `<span>${row.OperationalStatus}</span>`;
                    }
                }
            },
            ConfigStatus: {
                type: 'html',
                title: this.translateService.instant('CONFIGSTATUS'),
                width: '15%',
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
                valuePrepareFunction: (cell: NSTInstanceData, row: NSTInstanceData): string => {
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
                name: 'Action', width: '10%', filter: false, sort: false, title: this.translateService.instant('ACTIONS'), type: 'custom',
                valuePrepareFunction: (cell: NSTInstanceData, row: NSTInstanceData): NSTInstanceData => row,
                renderComponent: NetsliceInstancesActionComponent
            }
        };
    }

    /** generateData initiate the net-slice-instance list @public */
    public generateData(): void {
        this.isLoadingResults = true;
        this.restService.getResource(environment.NETWORKSLICEINSTANCESCONTENT_URL)
            .subscribe((netSliceInstancesData: NSTInstanceDetails[]) => {
            this.nstInstanceData = [];
            netSliceInstancesData.forEach((netSliceInstanceData: NSTInstanceDetails) => {
                if (netSliceInstanceData['config-status'] !== undefined) {
                    this.configStatusCheck = netSliceInstanceData['config-status'];
                } else {
                    this.configStatusCheck = netSliceInstanceData['operational-status'];
                }
                const netSliceDataObj: NSTInstanceData = {
                    name: netSliceInstanceData.name,
                    identifier: netSliceInstanceData.id,
                    NstName: netSliceInstanceData['nst-ref'],
                    OperationalStatus: netSliceInstanceData['operational-status'],
                    ConfigStatus: this.configStatusCheck,
                    DetailedStatus: netSliceInstanceData['detailed-status']
                };
                this.nstInstanceData.push(netSliceDataObj);
            });
            if (this.nstInstanceData.length > 0) {
                this.checkDataClass = 'dataTables_present';
            } else {
                this.checkDataClass = 'dataTables_empty';
            }
            this.dataSource.load(this.nstInstanceData).then((data: {}) => {
                this.isLoadingResults = false;
            }).catch();
        }, (error: ERRORDATA) => {
            this.restService.handleError(error, 'get');
            this.isLoadingResults = false;
        });
    }

    /**
     * Lifecyle hook which get trigger on component destruction
     */
    public ngOnDestroy(): void {
        this.generateDataSub.unsubscribe();
    }
}
