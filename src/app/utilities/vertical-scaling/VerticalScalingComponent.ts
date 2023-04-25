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

 Author: SANDHYA JS (sandhya.j@tataelxsi.co.in)
*/
/**
 * @file VerticalScaling Component
 */
import { isNullOrUndefined } from 'util';
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA, URLPARAMS } from 'CommonModel';
import { environment } from 'environment';
import { VerticalScaling } from 'NSInstanceModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { VDUR, VNFInstanceDetails } from 'VNFInstanceModel';

/**
 * Creating component
 * @Component takes VerticalScalingComponent.html as template url
 */
@Component({
    selector: 'app-vertical-scaling',
    templateUrl: './VerticalScalingComponent.html',
    styleUrls: ['./VerticalScalingComponent.scss']
})
export class VerticalScalingComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;
    /** Instance for active modal service @public */
    public activeModal: NgbActiveModal;
    /** Check the loading results @public */
    public isLoadingResults: Boolean = false;
    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';
    /** FormGroup instance added to the form @ html @public */
    public scalingForm: FormGroup;
    /** Items for the memberVNFIndex @public */
    public memberTypes: {}[];
    /** Contains MemberVNFIndex values @public */
    public memberVnfIndex: {}[] = [];
    /** Contains vnfInstanceId of the selected MemberVnfIndex  @public */
    public instanceId: string;
    /** Items for vduId & countIndex @public */
    public vdu: {}[];
    /** Selected VNFInstanceId @public */
    public selectedvnfId: string = '';
    /** Array holds VNFR Data filtered with nsr ID @public */
    public nsIdFilteredData: {}[] = [];
    /** Form valid on submit trigger @public */
    public submitted: boolean = false;
    /** Contains vduId @public */
    public vduId: {};
    /** Items for countIndex @public */
    public countIndex: {}[];
    /** Input contains component objects @private */
    @Input() private params: URLPARAMS;
    /** FormBuilder instance added to the formBuilder @private */
    private formBuilder: FormBuilder;
    /** Instance of the rest service @private */
    private restService: RestService;
    /** Controls the header form @private */
    private headers: HttpHeaders;
    /** Contains all methods related to shared @private */
    private sharedService: SharedService;
    /** Notifier service to popup notification @private */
    private notifierService: NotifierService;
    /** Contains tranlsate instance @private */
    private translateService: TranslateService;
    /** Holds the instance of AuthService class of type AuthService @private */
    private router: Router;
    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.activeModal = this.injector.get(NgbActiveModal);
        this.formBuilder = this.injector.get(FormBuilder);
        this.sharedService = this.injector.get(SharedService);
        this.notifierService = this.injector.get(NotifierService);
        this.translateService = this.injector.get(TranslateService);
        this.router = this.injector.get(Router);
    }
    /** convenience getter for easy access to form fields */
    get f(): FormGroup['controls'] { return this.scalingForm.controls; }
    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        this.initializeForm();
        this.getMemberVnfIndex();
        this.headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
        });
    }
    /** Initialize Scaling Forms @public */
    public initializeForm(): void {
        this.scalingForm = this.formBuilder.group({
            memberVnfIndex: [null, [Validators.required]],
            vduId: [null, [Validators.required]],
            countIndex: [null, [Validators.required]],
            virtualMemory: [null, [Validators.required]],
            sizeOfStorage: [null, [Validators.required]],
            numVirtualCpu: [null, [Validators.required]]
        });
    }

    /** Getting MemberVnfIndex using VNFInstances API @public */
    public getMemberVnfIndex(): void {
        const vnfInstanceData: {}[] = [];
        this.restService.getResource(environment.VNFINSTANCES_URL).subscribe((vnfInstancesData: VNFInstanceDetails[]): void => {
            vnfInstancesData.forEach((vnfData: VNFInstanceDetails): void => {
                const vnfDataObj: {} =
                {
                    VNFD: vnfData['vnfd-ref'],
                    VNFInstanceId: vnfData._id,
                    MemberIndex: vnfData['member-vnf-index-ref'],
                    NS: vnfData['nsr-id-ref'],
                    VNFID: vnfData['vnfd-id']
                };
                vnfInstanceData.push(vnfDataObj);
            });
            const nsId: string = 'NS';
            // eslint-disable-next-line security/detect-object-injection
            this.nsIdFilteredData = vnfInstanceData.filter((vnfdData: {}[]): boolean => vnfdData[nsId] === this.params.id);
            this.nsIdFilteredData.forEach((resVNF: {}[]): void => {
                const memberIndex: string = 'MemberIndex';
                const vnfinstanceID: string = 'VNFInstanceId';
                const assignMemberIndex: {} = {
                    // eslint-disable-next-line security/detect-object-injection
                    id: resVNF[memberIndex],
                    // eslint-disable-next-line security/detect-object-injection
                    vnfinstanceId: resVNF[vnfinstanceID]
                };
                this.memberVnfIndex.push(assignMemberIndex);
            });
            this.memberTypes = this.memberVnfIndex;
            this.isLoadingResults = false;
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'get');
            this.isLoadingResults = false;
        });
    }

    /** Getting vdu-id & count-index from API */
    public getVdu(id: string): void {
        const vnfInstanceData: {}[] = [];
        this.getFormControl('vduId').setValue(null);
        this.getFormControl('countIndex').setValue(null);
        if (!isNullOrUndefined(id)) {
            this.restService.getResource(environment.VNFINSTANCES_URL + '/' + id).
                subscribe((vnfInstanceDetail: VNFInstanceDetails[]): void => {
                    this.instanceId = id;
                    this.selectedvnfId = vnfInstanceDetail['vnfd-ref'];
                    const VDU: string = 'vdur';
                    // eslint-disable-next-line security/detect-object-injection
                    if (vnfInstanceDetail[VDU] !== undefined) {
                        // eslint-disable-next-line security/detect-object-injection
                        vnfInstanceDetail[VDU].forEach((vdu: VDUR): void => {
                            const vnfInstanceDataObj: {} =
                            {
                                'count-index': vdu['count-index'],
                                VDU: vdu['vdu-id-ref']

                            };
                            vnfInstanceData.push(vnfInstanceDataObj);
                        });
                        this.vdu = vnfInstanceData;
                        const vduName: string = 'VDU';
                        this.vduId = this.vdu.filter((vdu: {}, index: number, self: {}[]): {} =>
                            index === self.findIndex((t: {}): {} => (
                                // eslint-disable-next-line security/detect-object-injection
                                t[vduName] === vdu[vduName]
                            ))
                        );
                    }
                }, (error: ERRORDATA): void => {
                    this.restService.handleError(error, 'get');
                    this.isLoadingResults = false;
                });
        }
    }

    /** Getting count-index by filtering id  */
    public getCountIndex(id: string): void {
        const VDU: string = 'VDU';
        // eslint-disable-next-line security/detect-object-injection
        this.countIndex = this.vdu.filter((vnfdData: {}[]): boolean => vnfdData[VDU] === id);
    }

    /** Vertical Scaling on submit */
    public triggerVerticalScaling(): void {
        this.submitted = true;
        this.sharedService.cleanForm(this.scalingForm);
        if (!this.scalingForm.invalid) {
            const scalingPayload: VerticalScaling = {
                lcmOperationType: 'verticalscale',
                verticalScale: 'CHANGE_VNFFLAVOR',
                nsInstanceId: this.params.id,
                changeVnfFlavorData: {
                    vnfInstanceId: this.instanceId,
                    additionalParams: {
                        vduid: this.scalingForm.value.vduId,
                        vduCountIndex: this.scalingForm.value.countIndex,
                        virtualMemory: Number(this.scalingForm.value.virtualMemory),
                        sizeOfStorage: Number(this.scalingForm.value.sizeOfStorage),
                        numVirtualCpu: Number(this.scalingForm.value.numVirtualCpu)
                    }
                }
            };
            this.verticalscaleInitialization(scalingPayload);
        }
    }

    /** Initialize the vertical scaling operation @public */
    public verticalscaleInitialization(scalingPayload: object): void {
        this.isLoadingResults = true;
        const apiURLHeader: APIURLHEADER = {
            url: environment.NSDINSTANCES_URL + '/' + this.params.id + '/verticalscale',
            httpOptions: { headers: this.headers }
        };
        const modalData: MODALCLOSERESPONSEDATA = {
            message: 'Done'
        };
        this.restService.postResource(apiURLHeader, scalingPayload).subscribe((result: {}): void => {
            this.activeModal.close(modalData);
            this.router.navigate(['/instances/ns/history-operations/' + this.params.id]).catch((): void => {
                // Catch Navigation Error
            });
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'post');
            this.isLoadingResults = false;
        });
    }

    /** Used to get the AbstractControl of controlName passed @private */
    private getFormControl(controlName: string): AbstractControl {
        // eslint-disable-next-line security/detect-object-injection
        return this.scalingForm.controls[controlName];
    }
}
