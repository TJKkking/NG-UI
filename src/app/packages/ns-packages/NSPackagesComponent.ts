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
 * @file NS-Packages component.
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA } from 'CommonModel';
import { ComposePackages } from 'ComposePackages';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { LocalDataSource } from 'ng2-smart-table';
import { NSData, NSDDetails } from 'NSDModel';
import { NsPackagesActionComponent } from 'NsPackagesAction';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes NSPackagesComponent.html as template url
 */
@Component({
    selector: 'app-ns-packages',
    templateUrl: './NSPackagesComponent.html',
    styleUrls: ['./NSPackagesComponent.scss']
})

/** Exporting a class @exports NSPackagesComponent */
export class NSPackagesComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;

    /** Formation of appropriate Data for LocalDatasource @public */
    public dataSource: LocalDataSource = new LocalDataSource();

    /** handle translate @public */
    public translateService: TranslateService;

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

    /** Element ref for fileInput @public */
    @ViewChild('fileInput', { static: true }) public fileInput: ElementRef;

    /** Instance of the rest service @private */
    private restService: RestService;

    /** dataService to pass the data from one component to another @private */
    private dataService: DataService;

    /** Formation of appropriate Data for LocalDatasource @private */
    private nsData: NSData[] = [];

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    /** variables holds file information @private */
    private fileData: string | ArrayBuffer;

    /** Controls the header form @private */
    private headers: HttpHeaders;

    /** Notifier service to popup notification @private */
    private notifierService: NotifierService;

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
        this.notifierService = this.injector.get(NotifierService);
        this.modalService = this.injector.get(NgbModal);
    }

    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.generateColumns();
        this.generateSettings();
        this.generateData();
        this.headers = new HttpHeaders({
            'Content-Type': 'application/gzip',
            Accept: 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
        });
        this.generateDataSub = this.sharedService.dataEvent.subscribe(() => { this.generateData(); });
    }

    /** smart table Header Colums @public */
    public generateColumns(): void {
        this.columnLists = {
            name: { title: this.translateService.instant('NAME'), width: '15%', sortDirection: 'asc' },
            identifier: { title: this.translateService.instant('IDENTIFIER'), width: '30%' },
            description: { title: this.translateService.instant('DESCRIPTION'), width: '25%' },
            version: { title: this.translateService.instant('VERSION'), width: '15%' },
            Actions: {
                name: 'Actions', width: '15%', filter: false, sort: false, type: 'custom',
                title: this.translateService.instant('ACTIONS'),
                valuePrepareFunction: (cell: NSData, row: NSData): NSData => row, renderComponent: NsPackagesActionComponent
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
                deleteButtonContent: '<i class="far fa-trash-alt" title="delete"></i>',
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

    /** smart table listing manipulation @public */
    public onChange(perPageValue: number): void {
        this.dataSource.setPaging(1, perPageValue, true);
    }

    /** smart table listing manipulation @public */
    public onUserRowSelect(event: MessageEvent): void {
        Object.assign(event.data, { page: 'ns-package' });
        this.dataService.changeMessage(event.data);
    }

    /** Drag and drop feature and fetchind the details of files  @public */
    public filesDropped(files: FileList): void {
        if (files && files.length === 1) {
            this.isLoadingResults = true;
            this.sharedService.getFileString(files, 'gz').then((fileContent: ArrayBuffer): void => {
                const apiURLHeader: APIURLHEADER = {
                    url: environment.NSDESCRIPTORSCONTENT_URL,
                    httpOptions: { headers: this.headers }
                };
                this.saveFileData(apiURLHeader, fileContent);
            }).catch((err: string): void => {
                this.isLoadingResults = false;
                if (err === 'typeError') {
                    this.notifierService.notify('error', this.translateService.instant('GZFILETYPEERRROR'));
                } else {
                    this.notifierService.notify('error', this.translateService.instant('ERROR'));
                }
            });
        } else if (files && files.length > 1) {
            this.notifierService.notify('error', this.translateService.instant('DROPFILESVALIDATION'));
        }
    }

    /** Post the droped files and reload the page @public */
    public saveFileData(urlHeader: APIURLHEADER, fileData: {}): void {
        this.fileInput.nativeElement.value = null;
        this.restService.postResource(urlHeader, fileData).subscribe((result: {}) => {
            this.notifierService.notify('success', this.translateService.instant('PAGE.NSPACKAGE.CREATEDSUCCESSFULLY'));
            this.generateData();
        }, (error: ERRORDATA) => {
            this.restService.handleError(error, 'post');
            this.isLoadingResults = false;
        });
    }

    /** Generate nsData object from loop and return for the datasource @public */
    public generateNSData(nsdpackagedata: NSDDetails): NSData {
        return {
            name: nsdpackagedata.name,
            identifier: nsdpackagedata._id,
            description: nsdpackagedata.description,
            version: nsdpackagedata.version
        };
    }

    /** Fetching the data from server to Load in the smarttable @public */
    public generateData(): void {
        this.isLoadingResults = true;
        this.restService.getResource(environment.NSDESCRIPTORSCONTENT_URL).subscribe((nsdPackageData: NSDDetails[]) => {
            this.nsData = [];
            nsdPackageData.forEach((nsdpackagedata: NSDDetails) => {
                const nsDataObj: NSData = this.generateNSData(nsdpackagedata);
                this.nsData.push(nsDataObj);
            });
            if (this.nsData.length > 0) {
                this.checkDataClass = 'dataTables_present';
            } else {
                this.checkDataClass = 'dataTables_empty';
            }
            this.dataSource.load(this.nsData).then((data: boolean) => {
                this.isLoadingResults = false;
            }).catch(() => {
                this.isLoadingResults = false;
            });
        }, (error: ERRORDATA) => {
            this.restService.handleError(error, 'get');
            this.isLoadingResults = false;
        });
    }
    /** Handle compose new ns package method  @public */
    public composeNSPackage(): void {
        this.modalService.open(ComposePackages, { backdrop: 'static' }).componentInstance.params = { page: 'ns-package' };
    }

    /**
     * Lifecyle hook which get trigger on component destruction
     */
    public ngOnDestroy(): void {
        this.generateDataSub.unsubscribe();
    }
}
