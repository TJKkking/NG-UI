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
 * @file SDN Controller details Component.
 */
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CONFIGCONSTANT, ERRORDATA, MODALCLOSERESPONSEDATA, SDN_TYPES } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { NewSDNControllerComponent } from 'NewSDNControllerComponent';
import { LocalDataSource } from 'ng2-smart-table';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SDNControllerActionComponent } from 'SDNControllerActionComponent';
import { SDNControllerList, SDNControllerModel } from 'SDNControllerModel';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes SDNControllerDetailsComponent.html as template url
 */
@Component({
    templateUrl: './SDNControllerDetailsComponent.html',
    styleUrls: ['./SDNControllerDetailsComponent.scss']
})
/** Exporting a class @exports SDNControllerDetailsComponent */
export class SDNControllerDetailsComponent implements OnInit, OnDestroy {
    /** Injector to invoke other services @public */
    public injector: Injector;

    /** Selected list array @public */
    public selectList: object[] = [];

    /** Instance component are stored in settings @public */
    public settings: {} = {};

    /** Contains objects for menu settings @public */
    public columnList: {} = {};

    /** Data of smarttable populate through LocalDataSource @public */
    public dataSource: LocalDataSource = new LocalDataSource();

    /** Check the loading results @public */
    public isLoadingResults: boolean = true;

    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';

    /** Class for empty and present data @public */
    public checkDataClass: string;

    /** operational State init data @public */
    public operationalStateFirstStep: string = CONFIGCONSTANT.sdnOperationalStateFirstStep;

    /** operational State running data @public */
    public operationalStateSecondStep: string = CONFIGCONSTANT.sdnOperationalStateStateSecondStep;

    /** operational State failed data @public */
    public operationalStateThirdStep: string = CONFIGCONSTANT.sdnOperationalStateThirdStep;

    /** Instance of the rest service @private */
    private restService: RestService;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    /** dataService to pass the data from one component to another @private */
    private dataService: DataService;

    /** Contains tranlsate instance @private */
    private translateService: TranslateService;

    /** Formation of appropriate Data for LocalDatasource @private */
    private sdnData: {}[] = [];

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Instance of subscriptions @private */
    private generateDataSub: Subscription;

    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.translateService = this.injector.get(TranslateService);
        this.sharedService = this.injector.get(SharedService);
        this.dataService = this.injector.get(DataService);
        this.modalService = this.injector.get(NgbModal);
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
            type: {
                title: this.translateService.instant('TYPE'), width: '15%',
                filter: {
                    type: 'list',
                    config: {
                        selectText: 'Select',
                        list: SDN_TYPES
                    }
                }
            },
            operationalState: {
                title: this.translateService.instant('OPERATIONALSTATUS'), width: '15%', type: 'html',
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
                valuePrepareFunction: (cell: SDNControllerList, row: SDNControllerList): string => {
                    if (row.operationalState === this.operationalStateFirstStep) {
                        return `<span class="icon-label" title="${row.operationalState}">
                        <i class="fas fa-clock text-warning"></i>
                        </span>`;
                    } else if (row.operationalState === this.operationalStateSecondStep) {
                        return `<span class="icon-label" title="${row.operationalState}">
                        <i class="fas fa-check-circle text-success"></i>
                        </span>`;
                    } else if (row.operationalState === this.operationalStateThirdStep) {
                        return `<span class="icon-label" title="${row.operationalState}">
                        <i class="fas fa-times-circle text-danger"></i>
                        </span>`;
                    } else {
                        return `<span>${row.operationalState}</span>`;
                    }
                }
            },
            url: { title: this.translateService.instant('URL'), width: '30%' },
            Actions: {
                name: 'Action', width: '5%', filter: false, sort: false, type: 'custom',
                title: this.translateService.instant('ACTIONS'),
                valuePrepareFunction: (cell: SDNControllerList, row: SDNControllerList): SDNControllerList => row,
                renderComponent: SDNControllerActionComponent
            }
        };
    }

    /** smart table listing manipulation @public */
    public onChange(perPageValue: number): void {
        this.dataSource.setPaging(1, perPageValue, true);
    }

    /** smart table listing manipulation @public */
    public onUserRowSelect(event: MessageEvent): void {
        Object.assign(event.data, { page: 'sdn-controller' });
        this.dataService.changeMessage(event.data);
    }

    /** Generate generateSDNData object from loop and return for the datasource @public */
    public generateSDNList(sdn: SDNControllerModel): SDNControllerList {
        return {
            name: sdn.name,
            identifier: sdn._id,
            type: sdn.type,
            operationalState: sdn._admin.operationalState,
            url: sdn.url
        };
    }

    /** Compose new SDN Controller @public */
    public composeSDN(): void {
        const modalRef: NgbModalRef = this.modalService.open(NewSDNControllerComponent, { backdrop: 'static' });
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch();
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
        this.sdnData = [];
        this.restService.getResource(environment.SDNCONTROLLER_URL).subscribe((sdnDetails: {}[]) => {
            sdnDetails.forEach((res: SDNControllerModel) => {
                const sdnDataObj: SDNControllerList = this.generateSDNList(res);
                this.sdnData.push(sdnDataObj);
            });
            if (this.sdnData.length > 0) {
                this.checkDataClass = 'dataTables_present';
            } else {
                this.checkDataClass = 'dataTables_empty';
            }
            this.dataSource.load(this.sdnData).then((data: {}) => {
                this.isLoadingResults = false;
            }).catch();
        }, (error: ERRORDATA) => {
            this.restService.handleError(error, 'get');
            this.isLoadingResults = false;
        });
    }

}
