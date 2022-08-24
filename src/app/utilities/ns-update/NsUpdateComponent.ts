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
 * @file Ns Update Component
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { APIURLHEADER, CONFIGCONSTANT, ERRORDATA, MODALCLOSERESPONSEDATA, URLPARAMS } from 'CommonModel';
import { environment } from 'environment';
import { NSUPDATE, TERMINATEVNF } from 'NSInstanceModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';
import { VNFD } from 'VNFDModel';
import { VNFInstanceDetails } from 'VNFInstanceModel';
import { WarningComponent } from 'WarningComponent';

/**
 * Creating component
 * @Component takes NsUpdateComponent.html as template url
 */
@Component({
    selector: 'app-ns-update',
    templateUrl: './NsUpdateComponent.html',
    styleUrls: ['./NsUpdateComponent.scss']
})
export class NsUpdateComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;
    /** Instance for active modal service @public */
    public activeModal: NgbActiveModal;
    /** Check the loading results @public */
    public isLoadingResults: Boolean = false;
    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';
    /** FormGroup instance added to the form @ html @public */
    public nsUpdateForm: FormGroup;
    /** Items for the member types @public */
    public memberTypes: {}[];
    /** Contains objects that is used to hold types of primitive @public */
    public updateTypeList: {}[] = [];
    /** Form valid on submit trigger @public */
    public submitted: boolean = false;
    /** Give the update type @public */
    public terminateVnf: string;
    /** Model value used to hold selected MemberVNFIndex @public */
    public memberIndexValue: string;
    /** Form Check vnfdId Section @public */
    public vnfdIdShow: boolean = false;
    /** Contains MemberVNFIndex values @public */
    public memberVnfIndex: {}[] = [];
    /** Contains MemberVNFIndex content @public */
    public selectedVnf: {}[];
    /** Array holds VNFR Data filtered with nsr ID @public */
    public nsIdFilteredData: {}[] = [];
    /** Contains vnfdId value @public */
    public vnfdId: string;
    /** Contains vnfId value of the selected MemberVnfIndex @public */
    public vnfID: string;
    /** Contains version of the selected MemberVnfIndex @public */
    public version: string;
    /** Contains version of the vnfId @public */
    public vnfversion: string;
    /** Contains vnfInstanceId of the selected MemberVnfIndex  @public */
    public instanceId: string;
    /** Selected VNFInstanceId @public */
    public selectedvnfId: string = '';
    /** Input contains component objects @private */
    @Input() private params: URLPARAMS;
    /** FormBuilder instance added to the formBuilder @private */
    private formBuilder: FormBuilder;
    /** Contains tranlsate instance @private */
    private translateService: TranslateService;
    /** Instance of the rest service @private */
    private restService: RestService;
    /** Controls the header form @private */
    private headers: HttpHeaders;
    /** Contains all methods related to shared @private */
    private sharedService: SharedService;
    /** Holds the instance of AuthService class of type AuthService @private */
    private router: Router;
    /** Instance of the modal service @private */
    private modalService: NgbModal;
    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.activeModal = this.injector.get(NgbActiveModal);
        this.formBuilder = this.injector.get(FormBuilder);
        this.sharedService = this.injector.get(SharedService);
        this.translateService = this.injector.get(TranslateService);
        this.router = this.injector.get(Router);
        this.modalService = this.injector.get(NgbModal);
        this.updateTypeList = [
            {
                title: this.translateService.instant('VNFPKGCHANGE'),
                value: 'CHANGE_VNFPKG'
            },
            {
                title: this.translateService.instant('REMOVEVNF'),
                value: 'REMOVE_VNF'
            }
        ];
    }
    /** convenience getter for easy access to form fields */
    get f(): FormGroup['controls'] { return this.nsUpdateForm.controls; }
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

    /** Initialize Ns Update Forms @public */
    public initializeForm(): void {
        this.nsUpdateForm = this.formBuilder.group({
            updateType: [null, [Validators.required]],
            memberVnfIndex: [null, [Validators.required]],
            vnfdId: [null, [Validators.required]]
        });
    }

    /** Getting MemberVnfIndex using NSDescriptor API @public */
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

    /**
     *  Fetching the VNFR Information filtered with MemberVnfIndex
     *  Get the selected VNF Instance ID
     */
    public getSelectedVNF(id: string): void {
        this.instanceId = id;
        let memberIndexFilteredData: {}[] = [];
        const memberIndex: string = 'MemberIndex';
        memberIndexFilteredData = this.nsIdFilteredData.filter((vnfdData: {}[]): boolean =>
            vnfdData[memberIndex] === this.memberIndexValue);
        const vnfId: string = 'VNFID';
        const selectedvnfId: string = 'VNFD';
        this.selectedVnf = memberIndexFilteredData;
        for (const data of memberIndexFilteredData) {
            this.vnfID = data[vnfId];
            this.selectedvnfId = data[selectedvnfId];
        }
    }

    /** Trigger NsUpdate on submit */
    public triggerNsUpdate(): void {
        this.submitted = true;
        this.sharedService.cleanForm(this.nsUpdateForm);
        if (this.nsUpdateForm.invalid) { return; } // Proceed, onces form is valid
        this.vnfdId = this.nsUpdateForm.value.vnfdId;
        this.checkUpdateType();
    }

    /** Ns Update on submit */
    public onSubmit(): void {
        if (this.terminateVnf === 'REMOVE_VNF') {
            const nsUpdateTerminatePayload: TERMINATEVNF = {
                lcmOperationType: 'update',
                updateType: this.nsUpdateForm.value.updateType,
                nsInstanceId: this.params.id,
                removeVnfInstanceId: this.instanceId
            };
            this.nsUpdateInitialization(nsUpdateTerminatePayload);
        } else {
            const nsUpdatePayload: NSUPDATE = {
                lcmOperationType: 'update',
                updateType: this.nsUpdateForm.value.updateType,
                nsInstanceId: this.params.id,
                changeVnfPackageData: {
                    vnfInstanceId: this.instanceId,
                    vnfdId: this.nsUpdateForm.value.vnfdId
                }
            };
            this.nsUpdateInitialization(nsUpdatePayload);
        }
    }

    /**
     *  Open Modal based on selected NS-UPDATE Type
     */
    public checkUpdateType(): void {
        this.isLoadingResults = true;
        if (this.nsUpdateForm.value.updateType === 'CHANGE_VNFPKG') {
            this.checkVersion();
        } else {
            const modalRef: NgbModalRef = this.modalService.open(WarningComponent, { backdrop: 'static' });
            modalRef.componentInstance.heading = this.translateService.instant('TERMINATEVNF');
            modalRef.componentInstance.confirmationMessage = this.translateService.instant('TERMINATEVNFCONTENT');
            modalRef.componentInstance.submitMessage = this.translateService.instant('TERMINATEVNF');
            modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
                if (result.message === CONFIGCONSTANT.done) {
                    this.onSubmit();
                }
            }).catch((): void => { //empty
             });
        }
        this.isLoadingResults = false;
    }

    /** To check the versions are matching or not for 'CHANGE_VNFPKG' type */
    public checkVersion(): void {
        this.isLoadingResults = true;
        const vnfDetails: {}[] = [];
        this.restService.getResource(environment.VNFPACKAGESCONTENT_URL + '/' + this.vnfdId).subscribe((vnfData: VNFD[]): void => {
            if (!isNullOrUndefined(vnfData['software-version'])) {
                this.version = vnfData['software-version'];
            }
            this.restService.getResource(environment.VNFPACKAGESCONTENT_URL).subscribe((vnfDetail: VNFD[]): void => {
                vnfDetail.forEach((vnfDatas: VNFD): void => {
                    const vnfDataObj: {} =
                    {
                        VNFID: vnfDatas._id,
                        version: vnfDatas['software-version']
                    };
                    vnfDetails.push(vnfDataObj);
                });
                let vnfIdFilteredData: {}[] = [];
                const vnfID: string = 'VNFID';
                const version: string = 'version';
                vnfIdFilteredData = vnfDetails.filter((vnfdData: {}[]): boolean => vnfdData[vnfID] === this.vnfID);
                for (const data of vnfIdFilteredData) {
                    this.vnfversion = data[version];
                }
                if (this.version === this.vnfversion) {
                    const modalRef: NgbModalRef = this.modalService.open(WarningComponent, { backdrop: 'static' });
                    modalRef.componentInstance.heading = this.translateService.instant('UPDATENS');
                    modalRef.componentInstance.confirmationMessage = this.translateService.instant('GENERICCONTENT');
                    modalRef.componentInstance.submitMessage = this.translateService.instant('UPDATENS');
                    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
                        if (result.message === CONFIGCONSTANT.done) {
                            this.onSubmit();
                        }
                    }).catch((): void => { //empty
                     }
                    );
                } else {
                    const modalRef: NgbModalRef = this.modalService.open(WarningComponent, { backdrop: 'static' });
                    modalRef.componentInstance.heading = this.translateService.instant('REDEPLOY');
                    modalRef.componentInstance.confirmationMessage = this.translateService.instant('REDEPLOYCONTENT');
                    modalRef.componentInstance.submitMessage = this.translateService.instant('REDEPLOY');
                    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
                        if (result.message === CONFIGCONSTANT.done) {
                            this.onSubmit();
                        }
                    }).catch((): void => { //empty
                     });
                }
            }, (error: ERRORDATA): void => {
                this.restService.handleError(error, 'get');
                this.isLoadingResults = false;
            });
            this.isLoadingResults = false;
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'get');
            this.isLoadingResults = false;
        });
    }

    /** Initialize the Ns Update @public */
    public nsUpdateInitialization(nsUpdatePayload: object): void {
        this.isLoadingResults = true;
        const apiURLHeader: APIURLHEADER = {
            url: environment.NSDINSTANCES_URL + '/' + this.params.id + '/update',
            httpOptions: { headers: this.headers }
        };
        const modalData: MODALCLOSERESPONSEDATA = {
            message: 'Done'
        };
        this.restService.postResource(apiURLHeader, nsUpdatePayload).subscribe((result: {}): void => {
            this.activeModal.close(modalData);
            this.router.navigate(['/instances/ns/history-operations/' + this.params.id]).catch();
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'post');
            this.isLoadingResults = false;
        });
    }

    /** To enable or disable vnfdId field @public */
    public terminateVNF(value: string): void {
        this.terminateVnf = value;
        if (this.terminateVnf === 'REMOVE_VNF') {
            this.vnfdIdShow = true;
            this.getFormControl('vnfdId').disable();
        } else {
            this.vnfdIdShow = false;
            this.getFormControl('vnfdId').enable();
        }
    }

    /** Used to get the AbstractControl of controlName passed @private */
    private getFormControl(controlName: string): AbstractControl {
        return this.nsUpdateForm.controls[controlName];
    }
}
