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
 * @file StartStopRebuild Component
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA, URLPARAMS } from 'CommonModel';
import { environment } from 'environment';
import { StartStopRebuild } from 'NSInstanceModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';
import { DF, VNFD } from 'VNFDModel';
import { VDUR, VNFInstanceDetails } from 'VNFInstanceModel';

/**
 * Creating component
 * @Component takes StartStopRebuildComponent.html as template url
 */
@Component({
    selector: 'app-start-stop-rebuild',
    templateUrl: './StartStopRebuildComponent.html',
    styleUrls: ['./StartStopRebuildComponent.scss']
})
export class StartStopRebuildComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;
    /** Instance for active modal service @public */
    public activeModal: NgbActiveModal;
    /** Check the loading results @public */
    public isLoadingResults: Boolean = false;
    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';
    /** FormGroup instance added to the form @ html @public */
    public startForm: FormGroup;
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
    /** Check day1-2 operation  @public */
    public 'day1-2': boolean;
    /** Array holds VNFR Data filtered with nsr ID @public */
    public nsIdFilteredData: {}[] = [];
    /** Form valid on submit trigger @public */
    public submitted: boolean = false;
    /** Input contains Modal dialog component Instance @public */
    @Input() public instanceType: string;
    /** Input contains Modal dialog component Instance @public */
    @Input() public instanceTitle: string;
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
    /** Holds the instance of AuthService class of type AuthService @private */
    private router: Router;
    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.activeModal = this.injector.get(NgbActiveModal);
        this.formBuilder = this.injector.get(FormBuilder);
        this.sharedService = this.injector.get(SharedService);
        this.router = this.injector.get(Router);
    }
    /** convenience getter for easy access to form fields */
    get f(): FormGroup['controls'] { return this.startForm.controls; }
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
    /** Initialize start, stop or rebuild Forms @public */
    public initializeForm(): void {
        this.startForm = this.formBuilder.group({
            memberVnfIndex: [null, [Validators.required]],
            vduId: [null, [Validators.required]],
            countIndex: [null, [Validators.required]]
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
            this.nsIdFilteredData = vnfInstanceData.filter((vnfdData: {}[]): boolean => vnfdData[nsId] === this.params.id);
            this.nsIdFilteredData.forEach((resVNF: {}[]): void => {
                const memberIndex: string = 'MemberIndex';
                const vnfinstanceID: string = 'VNFInstanceId';
                const assignMemberIndex: {} = {
                    id: resVNF[memberIndex],
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

    /** Getting vdu-id & count-index from VNFInstance API */
    public getVdu(id: string): void {
        const vnfInstanceData: {}[] = [];
        const vnfrDetails: {}[] = [];
        this.getFormControl('vduId').setValue(null);
        this.getFormControl('countIndex').setValue(null);
        if (!isNullOrUndefined(id)) {
            this.restService.getResource(environment.VNFINSTANCES_URL + '/' + id).
                subscribe((vnfInstanceDetail: VNFInstanceDetails[]): void => {
                    this.instanceId = id;
                    this.selectedvnfId = vnfInstanceDetail['vnfd-ref'];
                    const VDU: string = 'vdur';
                    if (vnfInstanceDetail[VDU] !== undefined) {
                        vnfInstanceDetail[VDU].forEach((vdu: VDUR): void => {
                            const vnfInstanceDataObj: {} =
                            {
                                'count-index': vdu['count-index'],
                                VDU: vdu['vdu-id-ref']

                            };
                            vnfInstanceData.push(vnfInstanceDataObj);
                        });
                        this.vdu = vnfInstanceData;
                    }
                    this.checkDay12Operation(this.selectedvnfId);
                }, (error: ERRORDATA): void => {
                    this.restService.handleError(error, 'get');
                    this.isLoadingResults = false;
                });
        }
    }

    /** To check primitve actions from VNFR  */
    public checkDay12Operation(id: string): void {
        const apiUrl: string = environment.VNFPACKAGES_URL + '?id=' + id;
        this.restService.getResource(apiUrl).subscribe((vnfdInfo: VNFD[]): void => {
            const vnfInstances: VNFD = vnfdInfo[0];
            if (!isNullOrUndefined(vnfInstances.df)) {
                vnfInstances.df.forEach((df: DF): void => {
                    if (df['lcm-operations-configuration'] !== undefined) {
                        if (df['lcm-operations-configuration']['operate-vnf-op-config']['day1-2'] !== undefined) {
                            this['day1-2'] = true;
                        }
                    } else {
                        this['day1-2'] = false;
                    }
                });
            }
        }, (error: ERRORDATA): void => {
            this.isLoadingResults = false;
            this.restService.handleError(error, 'get');
        });
    }
    /** Check Instance type is start or stop or rebuild and proceed action */
    public instanceCheck(instanceType: string): void {
        this.submitted = true;
        this.sharedService.cleanForm(this.startForm);
        if (this.startForm.invalid) { return; } // Proceed, onces form is valid
        if (instanceType === 'start') {
            const startPayload: StartStopRebuild = {
                updateType: 'OPERATE_VNF',
                operateVnfData: {
                    vnfInstanceId: this.instanceId,
                    changeStateTo: 'start',
                    additionalParam: {
                        'run-day1': false,
                        vdu_id: this.startForm.value.vduId,
                        'count-index': this.startForm.value.countIndex
                    }
                }
            };
            this.startInitialization(startPayload);
        } else if (instanceType === 'stop') {
            const stopPayload: StartStopRebuild = {
                updateType: 'OPERATE_VNF',
                operateVnfData: {
                    vnfInstanceId: this.instanceId,
                    changeStateTo: 'stop',
                    additionalParam: {
                        'run-day1': false,
                        vdu_id: this.startForm.value.vduId,
                        'count-index': this.startForm.value.countIndex
                    }
                }
            };
            this.startInitialization(stopPayload);
        } else {
            const rebuildPayload: StartStopRebuild = {
                updateType: 'OPERATE_VNF',
                operateVnfData: {
                    vnfInstanceId: this.instanceId,
                    changeStateTo: 'rebuild',
                    additionalParam: {
                        'run-day1': (this['day1-2'] === true) ? true : false,
                        vdu_id: this.startForm.value.vduId,
                        'count-index': this.startForm.value.countIndex
                    }
                }
            };
            this.startInitialization(rebuildPayload);
        }
    }

    /** Initialize the start, stop or rebuild operation @public */
    public startInitialization(startPayload: object): void {
        this.isLoadingResults = true;
        const apiURLHeader: APIURLHEADER = {
            url: environment.NSDINSTANCES_URL + '/' + this.params.id + '/update',
            httpOptions: { headers: this.headers }
        };
        const modalData: MODALCLOSERESPONSEDATA = {
            message: 'Done'
        };
        this.restService.postResource(apiURLHeader, startPayload).subscribe((result: {}): void => {
            this.activeModal.close(modalData);
            this.router.navigate(['/instances/ns/history-operations/' + this.params.id]).catch();
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'post');
            this.isLoadingResults = false;
        });
    }

    /** Used to get the AbstractControl of controlName passed @private */
    private getFormControl(controlName: string): AbstractControl {
        return this.startForm.controls[controlName];
    }
}
