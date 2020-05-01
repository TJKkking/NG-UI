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
 * @file PDU Instance Component
 */
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AddPDUInstancesComponent } from 'AddPDUInstancesComponent';
import { ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { LocalDataSource } from 'ng2-smart-table';
import { PDUInstanceDetails } from 'PDUInstanceModel';
import { PDUInstancesActionComponent } from 'PDUInstancesActionComponent';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes PDUInstancesComponent.html as template url
 */
@Component({
    templateUrl: './PDUInstancesComponent.html',
    styleUrls: ['./PDUInstancesComponent.scss']
})
/** Exporting a class @exports PDUInstancesComponent */
export class PDUInstancesComponent implements OnInit, OnDestroy {
    /** Injector to invoke other services @public */
    public injector: Injector;

    /** NS Instance array @public */
    public pduInstanceData: object[] = [];

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
            identifier: { title: this.translateService.instant('IDENTIFIER'), width: '25%' },
            name: { title: this.translateService.instant('NAME'), width: '20%', sortDirection: 'asc' },
            type: { title: this.translateService.instant('TYPE'), width: '15%' },
            usageState: { title: this.translateService.instant('USAGESTATE'), width: '15%' },
            CreatedAt: { title: this.translateService.instant('CREATEDAT'), width: '15%' },
            Actions: {
                name: 'Action', width: '10%', filter: false, sort: false, type: 'custom',
                title: this.translateService.instant('ACTIONS'),
                valuePrepareFunction: (cell: PDUInstanceDetails, row: PDUInstanceDetails): PDUInstanceDetails => row,
                renderComponent: PDUInstancesActionComponent
            }
        };
    }

    /** generateData initiate the ns-instance list @public */
    public generateData(): void {
        this.pduInstanceData = [];
        this.isLoadingResults = true;
        this.restService.getResource(environment.PDUINSTANCE_URL).subscribe((pduInstancesData: PDUInstanceDetails[]) => {
            pduInstancesData.forEach((pduInstanceData: PDUInstanceDetails) => {
                const pduDataObj: {} = {
                    name: pduInstanceData.name,
                    identifier: pduInstanceData._id,
                    type: pduInstanceData.type,
                    usageState: pduInstanceData._admin.usageState,
                    CreatedAt: this.sharedService.convertEpochTime(Number(pduInstanceData._admin.created))
                };
                this.pduInstanceData.push(pduDataObj);
            });
            if (this.pduInstanceData.length > 0) {
                this.checkDataClass = 'dataTables_present';
            } else {
                this.checkDataClass = 'dataTables_empty';
            }
            this.dataSource.load(this.pduInstanceData).then((data: {}) => {
                this.isLoadingResults = false;
            }).catch();
        }, (error: ERRORDATA) => {
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
        Object.assign(event.data, { page: 'pdu-instances' });
        this.dataService.changeMessage(event.data);
    }

    /** Add PDU Instance modal using modalservice @public */
    public addPDUInstanceModal(): void {
        const modalRef: NgbModalRef = this.modalService.open(AddPDUInstancesComponent, { backdrop: 'static' });
        modalRef.componentInstance.title = this.translateService.instant('PAGE.PDUINSTANCE.NEWPDUINSTANCE');
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
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
