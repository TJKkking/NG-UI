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
 * @file ADD PDU Instances Component
 */
import { Component, Injector, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { PDUInstanceDetails } from 'PDUInstanceModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { VimAccountDetails } from 'VimAccountModel';

/**
 * Creating component
 * @Component takes AddPDUInstancesComponent.html as template url
 */
@Component({
    templateUrl: './AddPDUInstancesComponent.html',
    styleUrls: ['./AddPDUInstancesComponent.scss']
})
/** Exporting a class @exports AddPDUInstancesComponent */
export class AddPDUInstancesComponent implements OnInit {
    /** Form valid on submit trigger @public */
    public submitted: boolean = false;

    /** To inject services @public */
    public injector: Injector;

    /** Instance for active modal service @public */
    public activeModal: NgbActiveModal;

    /** FormGroup instance added to the form @ html @public */
    public pduInstancesForm: FormGroup;

    /** Primitive params array @public */
    public pduInterfaces: FormArray;

    /** Variable set for twoway binding @public */
    public pduInstanceId: string;

    /** Set mgmt field to empty on load @public */
    public selectedMgmt: string;

    /** Set vim field to empty on load @public */
    public selectedVIM: string;

    /** Contains boolean value as select options for mgmt @public */
    public mgmtState: {}[] = [{ name: 'True', value: true }, { name: 'False', value: false }];

    /** Input contains Modal dialog component Instance @private */
    @Input() public title: string;

    /** Contains all the vim accounts list @public */
    public vimAccountSelect: VimAccountDetails;

    /** Check the loading results @public */
    public isLoadingResults: boolean = false;

    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';

    /** FormBuilder instance added to the formBuilder @private */
    private formBuilder: FormBuilder;

    /** Utilizes rest service for any CRUD operations @private */
    private restService: RestService;

    /** packages data service collections @private */
    private dataService: DataService;

    /** Contains tranlsate instance @private */
    private translateService: TranslateService;

    /** Notifier service to popup notification @private */
    private notifierService: NotifierService;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.dataService = this.injector.get(DataService);
        this.translateService = this.injector.get(TranslateService);
        this.notifierService = this.injector.get(NotifierService);
        this.sharedService = this.injector.get(SharedService);
        this.activeModal = this.injector.get(NgbActiveModal);
        this.formBuilder = this.injector.get(FormBuilder);
    }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        /** Setting up initial value for NSD */
        this.dataService.currentMessage.subscribe((event: PDUInstanceDetails) => {
            if (event.identifier !== undefined || event.identifier !== '' || event.identifier !== null) {
                this.pduInstanceId = event.identifier;
            }
        });
        this.generateVIMAccounts();
        this.initializeForm();
    }

    /** convenience getter for easy access to form fields */
    get f(): FormGroup['controls'] { return this.pduInstancesForm.controls; }

    /** initialize Forms @public */
    public initializeForm(): void {
        this.pduInstancesForm = this.formBuilder.group({
            name: ['', [Validators.required]],
            type: ['', [Validators.required]],
            vim_accounts: ['', [Validators.required]],
            interfaces: this.formBuilder.array([this.interfacesBuilder()])
        });
    }

    /** Generate interfaces fields @public */
    public interfacesBuilder(): FormGroup {
        return this.formBuilder.group({
            name: ['', [Validators.required]],
            'ip-address': ['', [Validators.required, Validators.pattern(this.sharedService.REGX_IP_PATTERN)]],
            mgmt: ['', [Validators.required]],
            'vim-network-name': ['', [Validators.required]]
        });
    }

    /** Handle FormArray Controls @public */
    public getControls(): AbstractControl[] {
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        return (this.pduInstancesForm.get('interfaces') as FormArray).controls;
    }

    /** Push all primitive params on user's action @public */
    public createInterfaces(): void {
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        this.pduInterfaces = this.pduInstancesForm.get('interfaces') as FormArray;
        this.pduInterfaces.push(this.interfacesBuilder());
    }

    /** Remove interfaces on user's action @public */
    public removeInterfaces(index: number): void {
        this.pduInterfaces.removeAt(index);
    }

    /** Execute New PDU Instances @public */
    public createPDUInstances(): void {
        this.submitted = true;
        this.sharedService.cleanForm(this.pduInstancesForm);
        if (this.pduInstancesForm.invalid) { return; } // Proceed, onces form is valid
        this.isLoadingResults = true;
        const modalData: MODALCLOSERESPONSEDATA = {
            message: 'Done'
        };
        const apiURLHeader: APIURLHEADER = {
            url: environment.PDUINSTANCE_URL
        };
        this.restService.postResource(apiURLHeader, this.pduInstancesForm.value).subscribe((result: {}) => {
            this.activeModal.close(modalData);
            this.notifierService.notify('success', this.translateService.instant('PAGE.PDUINSTANCE.CREATEDSUCCESSFULLY'));
            this.isLoadingResults = false;
        }, (error: ERRORDATA) => {
                this.restService.handleError(error, 'post');
                this.isLoadingResults = false;
        });
    }

    /** Generate vim accounts list @public */
    public generateVIMAccounts(): void {
        this.restService.getResource(environment.VIMACCOUNTS_URL).subscribe((vimData: VimAccountDetails) => {
            this.vimAccountSelect = vimData;
        }, (error: ERRORDATA) => {
            this.restService.handleError(error, 'get');
        });
    }
}
