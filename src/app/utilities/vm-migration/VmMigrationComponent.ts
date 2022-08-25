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
 * @file Vm Migration Component
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA, URLPARAMS } from 'CommonModel';
import { environment } from 'environment';
import { VMMIGRATION } from 'NSInstanceModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';
import { VDUR, VNFInstanceDetails } from 'VNFInstanceModel';

/**
 * Creating component
 * @Component takes VmMigrationComponent.html as template url
 */
@Component({
    selector: 'app-vm-migration',
    templateUrl: './VmMigrationComponent.html',
    styleUrls: ['./VmMigrationComponent.scss']
})
export class VmMigrationComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;
    /** Instance for active modal service @public */
    public activeModal: NgbActiveModal;
    /** Check the loading results @public */
    public isLoadingResults: Boolean = false;
    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';
    /** FormGroup instance added to the form @ html @public */
    public migrationForm: FormGroup;
    /** Items for the vdu-Id and count-index @public */
    public vdu: {}[];
    /** Selected VNFInstanceId @public */
    public selectedvnfId: string = '';
    /** Array holds VNFR Data filtered with nsr ID @public */
    public nsIdFilteredData: {}[] = [];
    /** Items for the member types @public */
    public memberTypes: {}[];
    /** Contains MemberVNFIndex values @public */
    public memberVnfIndex: {}[] = [];
    /** Contains vnfInstanceId of the selected MemberVnfIndex  @public */
    public instanceId: string;
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
    get f(): FormGroup['controls'] { return this.migrationForm.controls; }
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
    /** Initialize Migration Forms @public */
    public initializeForm(): void {
        this.migrationForm = this.formBuilder.group({
            memberVnfIndex: [null, [Validators.required]],
            vduId: [null],
            countIndex: [null],
            migrateToHost: [null]
        });
    }

    /** Getting MemberVnfIndex using NSDescriptor API @public */
    public getMemberVnfIndex(): void {
        const vnfInstanceData: {}[] = [];
        this.isLoadingResults = true;
        this.restService.getResource(environment.VNFINSTANCES_URL).subscribe((vnfInstancesData: VNFInstanceDetails[]): void => {
            vnfInstancesData.forEach((vnfData: VNFInstanceDetails): void => {
                const vnfDataObj: {} =
                {
                    VNFD: vnfData['vnfd-ref'],
                    VNFInstanceId: vnfData._id,
                    MemberIndex: vnfData['member-vnf-index-ref'],
                    NS: vnfData['nsr-id-ref']
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
        this.vdu = [];
        const vnfInstanceData: {}[] = [];
        this.instanceId = id;
        this.getFormControl('vduId').setValue(null);
        this.getFormControl('countIndex').setValue(null);
        if (!isNullOrUndefined(id)) {
            this.restService.getResource(environment.VNFINSTANCES_URL + '/' + id).
                subscribe((vnfInstanceDetail: VNFInstanceDetails[]): void => {
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
                        const vduName: string = 'VDU';
                        this.vduId = this.vdu.filter((vdu: {}, index: number, self: {}[]): {} =>
                            index === self.findIndex((t: {}): {} => (
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
        this.countIndex = this.vdu.filter((vnfdData: {}[]): boolean => vnfdData[VDU] === id);
    }

    /** Trigger VM Migration on submit */
    public triggerMigration(): void {
        this.submitted = true;
        this.sharedService.cleanForm(this.migrationForm);
        if (this.migrationForm.invalid) { return; } // Proceed, onces form is valid
        const migrationPayload: VMMIGRATION = {
            lcmOperationType: 'migrate',
            vnfInstanceId: this.instanceId
        };
        if (!isNullOrUndefined(this.migrationForm.value.migrateToHost)) {
            migrationPayload.migrateToHost = this.migrationForm.value.migrateToHost;
        }
        if (!isNullOrUndefined(this.migrationForm.value.vduId) && !isNullOrUndefined(this.migrationForm.value.countIndex)) {
            migrationPayload.vdu = {
                vduId: this.migrationForm.value.vduId,
                vduCountIndex: this.migrationForm.value.countIndex
            };
        } else if (!isNullOrUndefined(this.migrationForm.value.vduId)) {
            migrationPayload.vdu = {
                vduId: this.migrationForm.value.vduId
            };
        } else if (!isNullOrUndefined(this.migrationForm.value.countIndex)) {
            migrationPayload.vdu = {
                vduCountIndex: this.migrationForm.value.countIndex
            };
        }
        this.migrationInitialization(migrationPayload);

    }

    /** Initialize the Vm Migration operation @public */
    public migrationInitialization(migrationPayload: object): void {
        this.isLoadingResults = true;
        const apiURLHeader: APIURLHEADER = {
            url: environment.NSDINSTANCES_URL + '/' + this.params.id + '/migrate',
            httpOptions: { headers: this.headers }
        };
        const modalData: MODALCLOSERESPONSEDATA = {
            message: 'Done'
        };
        this.restService.postResource(apiURLHeader, migrationPayload).subscribe((result: {}): void => {
            this.activeModal.close(modalData);
            this.router.navigate(['/instances/ns/history-operations/' + this.params.id]).catch();
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'post');
            this.isLoadingResults = false;
        });
    }

    /** Used to get the AbstractControl of controlName passed @private */
    private getFormControl(controlName: string): AbstractControl {
        return this.migrationForm.controls[controlName];
    }
}
