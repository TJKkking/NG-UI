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
 * @file WIM Account Component.
 */
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CONFIGCONSTANT, ERRORDATA, MODALCLOSERESPONSEDATA, WIM_TYPES } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { NewWIMAccountComponent } from 'NewWIMAccount';
import { LocalDataSource } from 'ng2-smart-table';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';
import { WIMAccountData, WIMAccountModel } from 'WIMAccountModel';
import { WIMAccountsActionComponent } from 'WIMAccountsAction';
/**
 * Creating component
 * @Component takes WIMAccountDetailsComponent.html as template url
 */
@Component({
    templateUrl: './WIMAccountDetailsComponent.html',
    styleUrls: ['./WIMAccountDetailsComponent.scss']
})
/** Exporting a class @exports WIMAccountDetailsComponent */
export class WIMAccountDetailsComponent implements OnInit, OnDestroy {
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

    /** Class for empty and present data @public */
    public checkDataClass: string;

    /** operational State init data @public */
    public operationalStateFirstStep: string = CONFIGCONSTANT.wimOperationalStateFirstStep;

    /** operational State running data @public */
    public operationalStateSecondStep: string = CONFIGCONSTANT.wimOperationalStateStateSecondStep;

    /** operational State failed data @public */
    public operationalStateThirdStep: string = CONFIGCONSTANT.wimOperationalStateThirdStep;

    /** Instance of the rest service @private */
    private restService: RestService;

    /** dataService to pass the data from one component to another @private */
    private dataService: DataService;

    /** Formation of appropriate Data for LocalDatasource @private */
    private wimData: {}[] = [];

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

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
            name: { title: this.translateService.instant('NAME'), width: '20%', sortDirection: 'asc' },
            identifier: { title: this.translateService.instant('IDENTIFIER'), width: '20%' },
            type: {
                title: this.translateService.instant('TYPE'), width: '15%',
                filter: {
                    type: 'list',
                    config: {
                        selectText: 'Select',
                        list: WIM_TYPES
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
                valuePrepareFunction: (cell: WIMAccountData, row: WIMAccountData): string => {
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
            description: { title: this.translateService.instant('DESCRIPTION'), width: '25%' },
            Actions: {
                name: 'Action', width: '5%', filter: false, sort: false, title: this.translateService.instant('ACTIONS'), type: 'custom',
                valuePrepareFunction: (cell: WIMAccountData, row: WIMAccountData): WIMAccountData => row,
                renderComponent: WIMAccountsActionComponent
            }
        };
    }

    /** smart table Data Settings @public */
    public generateSettings(): void {
        this.settings = {
            edit: {
                editButtonContent: '<i class="fa fa-edit" title="Edit"></i>', confirmSave: true
            },
            delete: {
                deleteButtonContent: '<i class="far fa-trash-alt" title="delete"></i>', confirmDelete: true
            },
            columns: this.columnLists,
            actions: {
                add: false, edit: false, delete: false, position: 'right'
            },
            attr: this.sharedService.tableClassConfig(),
            pager: this.sharedService.paginationPagerConfig(),
            noDataMessage: this.translateService.instant('NODATAMSG')
        };
    }

    /** smart table listing manipulation @public */
    public onChange(perPageValue: number): void {
        this.dataSource.setPaging(1, perPageValue, true);
    }

    /** smart table listing manipulation @public */
    public onUserRowSelect(event: MessageEvent): void {
        Object.assign(event.data, { page: 'wim-account' });
        this.dataService.changeMessage(event.data);
    }

    /** Compose new WIM Accounts @public */
    public composeWIM(): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const modalRef: NgbModalRef = this.modalService.open(NewWIMAccountComponent, { backdrop: 'static' });
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch((): void => {
            // Catch Navigation Error
        });
    }

    /** Generate generateWIMData object from loop and return for the datasource @public */
    public generateWIMData(wimAccountData: WIMAccountModel): WIMAccountData {
        return {
            name: wimAccountData.name,
            identifier: wimAccountData._id,
            type: wimAccountData.wim_type,
            operationalState: wimAccountData._admin.operationalState,
            description: wimAccountData.description
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
        this.wimData = [];
        this.restService.getResource(environment.WIMACCOUNTS_URL).subscribe((wimAccountsDetails: {}[]) => {
            wimAccountsDetails.forEach((wimAccountsData: WIMAccountModel) => {
                const wimDataObj: WIMAccountData = this.generateWIMData(wimAccountsData);
                this.wimData.push(wimDataObj);
            });
            if (this.wimData.length > 0) {
                this.checkDataClass = 'dataTables_present';
            } else {
                this.checkDataClass = 'dataTables_empty';
            }
            this.dataSource.load(this.wimData).then((data: {}) => {
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
