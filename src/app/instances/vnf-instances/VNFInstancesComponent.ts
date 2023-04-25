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
 * @file NVF Instance Component
 */
import { Component, Injector, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ERRORDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { LocalDataSource } from 'ng2-smart-table';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';
import { VNFInstanceData, VNFInstanceDetails } from 'VNFInstanceModel';
import { VNFInstancesActionComponent } from 'VNFInstancesActionComponent';
import { VNFLinkComponent } from 'VNFLinkComponent';

/**
 * Creating component
 * @Component takes VNFInstancesComponent.html as template url
 */
@Component({
    templateUrl: './VNFInstancesComponent.html',
    styleUrls: ['./VNFInstancesComponent.scss']
})
/** Exporting a class @exports VNFInstancesComponent */
export class VNFInstancesComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;

    /** smart table data service collections @public */
    public dataSource: LocalDataSource = new LocalDataSource();

    /** Instance component are stored in settings @public */
    public settings: {} = {};

    /** Contains objects for menu settings @public */
    public columnList: {} = {};

    /** vnf instance array @public */
    public vnfInstanceData: {}[] = [];

    /** selected rows array @public */
    public selectedRows: string[] = [];

    /** selected list array @public */
    public selectList: string[] = [];

    /** Check the loading results @public */
    public isLoadingResults: boolean = true;

    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';

    /** Class for empty and present data @public */
    public checkDataClass: string;

    /** Utilizes rest service for any CRUD operations @private */
    private restService: RestService;

    /** packages data service collections @private */
    private dataService: DataService;

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
            actions: { add: false, edit: false, delete: false, position: 'right' },
            columns: this.columnList,
            attr: this.sharedService.tableClassConfig(),
            pager: this.sharedService.paginationPagerConfig(),
            noDataMessage: this.translateService.instant('NODATAMSG')
        };
    }

    /** Generate smart table row title and filters @public  */
    public generateTableColumn(): void {
        this.columnList = {
            identifier: { title: this.translateService.instant('IDENTIFIER'), width: '25%', sortDirection: 'asc' },
            VNFD: {
                title: this.translateService.instant('VNFD'), width: '20%', type: 'custom',
                valuePrepareFunction: (cell: VNFInstanceData, row: VNFInstanceData): VNFInstanceData => row,
                renderComponent: VNFLinkComponent
            },
            MemberIndex: { title: this.translateService.instant('MEMBERINDEX'), width: '15%' },
            NS: { title: this.translateService.instant('NS'), width: '20%' },
            CreatedAt: { title: this.translateService.instant('CREATEDAT'), width: '15%' },
            Actions: {
                name: 'Action', width: '5%', filter: false, sort: false, type: 'custom',
                title: this.translateService.instant('ACTIONS'),
                valuePrepareFunction: (cell: VNFInstanceData, row: VNFInstanceData): VNFInstanceData => row,
                renderComponent: VNFInstancesActionComponent
            }
        };
    }

    /** generateData initiate the vnf-instance list */
    public generateData(): void {
        this.isLoadingResults = true;
        this.restService.getResource(environment.VNFINSTANCES_URL).subscribe((vnfInstancesData: VNFInstanceDetails[]) => {
            this.vnfInstanceData = [];
            vnfInstancesData.forEach((vnfInstanceData: VNFInstanceDetails): void => {
                const vnfDataObj: {} =
                {
                    VNFD: vnfInstanceData['vnfd-ref'],
                    identifier: vnfInstanceData._id,
                    MemberIndex: vnfInstanceData['member-vnf-index-ref'],
                    NS: vnfInstanceData['nsr-id-ref'],
                    VNFID: vnfInstanceData['vnfd-id'],
                    CreatedAt: this.sharedService.convertEpochTime(Number(vnfInstanceData['created-time']))
                };
                this.vnfInstanceData.push(vnfDataObj);
            });
            if (this.vnfInstanceData.length > 0) {
                this.checkDataClass = 'dataTables_present';
            } else {
                this.checkDataClass = 'dataTables_empty';
            }
            this.dataSource.load(this.vnfInstanceData).then((data: {}) => {
                this.isLoadingResults = false;
            }).catch((): void => {
                // Catch Navigation Error
            });
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
        Object.assign(event.data, { page: 'vnf-instance' });
        this.dataService.changeMessage(event.data);
    }

    /**
     * Lifecyle hook which get trigger on component destruction
     */
    public ngOnDestroy(): void {
        this.generateDataSub.unsubscribe();
    }
}
