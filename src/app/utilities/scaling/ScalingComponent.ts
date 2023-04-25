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

 Author: BARATH KUMAR R (barath.r@tataelxsi.co.in)
*/
/**
 * @file Scaling Component
 */
import { isNullOrUndefined } from 'util';
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA, URLPARAMS } from 'CommonModel';
import { environment } from 'environment';
import { DF as NSDF, VNFPROFILE } from 'NSDModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { DF, SCALING, VNFD } from 'VNFDModel';

/**
 * Creating component
 * @Component takes ScalingComponent.html as template url
 */
@Component({
    selector: 'app-scaling',
    templateUrl: './ScalingComponent.html',
    styleUrls: ['./ScalingComponent.scss']
})
export class ScalingComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;
    /** Instance for active modal service @public */
    public activeModal: NgbActiveModal;
    /** Check the loading results @public */
    public isLoadingResults: Boolean = false;
    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';
    /** Contains the scaling group descriptor names @public */
    public scalingGroup: {}[];
    /** Member index of the NS @public */
    public memberVNFIndex: {}[];
    /** handles the selected VNFID @public */
    public selectedVNFID: string = '';
    /** Items for the Scale Types @public */
    public scaleTypes: {}[];
    /** FormGroup instance added to the form @ html @public */
    public scalingForm: FormGroup;
    /** Form valid on submit trigger @public */
    public submitted: boolean = false;
    /** FormBuilder instance added to the formBuilder @private */
    private formBuilder: FormBuilder;
    /** Instance of the rest service @private */
    private restService: RestService;
    /** Controls the header form @private */
    private headers: HttpHeaders;
    /** Contains tranlsate instance @private */
    private translateService: TranslateService;
    /** Input contains component objects @private */
    @Input() private params: URLPARAMS;
    /** Contains all methods related to shared @private */
    private sharedService: SharedService;
    /** Holds teh instance of AuthService class of type AuthService @private */
    private router: Router;

    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.activeModal = this.injector.get(NgbActiveModal);
        this.translateService = this.injector.get(TranslateService);
        this.formBuilder = this.injector.get(FormBuilder);
        this.sharedService = this.injector.get(SharedService);
        this.router = this.injector.get(Router);
    }

    /** convenience getter for easy access to form fields */
    get f(): FormGroup['controls'] { return this.scalingForm.controls; }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        this.initializeForm();
        this.getmemberIndex();
        this.scaleTypes = [
            { id: 'SCALE_OUT', name: this.translateService.instant('SCALEOUT') },
            { id: 'SCALE_IN', name: this.translateService.instant('SCALEIN') }
        ];
        this.headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
        });
    }

    /** Initialize Scaling Forms @public */
    public initializeForm(): void {
        this.scalingForm = this.formBuilder.group({
            memberIndex: [null, [Validators.required]],
            scalingname: [null, [Validators.required]],
            scaleType: [null, [Validators.required]]
        });
    }

    /** Get the member-vnf-index from NS Package -> vnf-profile @public */
    public getmemberIndex(): void {
        if (this.params.nsd.df.length > 0) {
            const getconstituentVNFD: {}[] = [];
            this.params.nsd.df.forEach((data: NSDF): void => {
                data['vnf-profile'].forEach((vnfProfile: VNFPROFILE): void => {
                    const assignMemberIndex: {} = {
                        id: vnfProfile.id,
                        name: vnfProfile['vnfd-id']
                    };
                    getconstituentVNFD.push(assignMemberIndex);
                });
            });
            this.memberVNFIndex = getconstituentVNFD;
        }
    }

    /** Get the scaling-group-descriptor name @public */
    public getScalingGroupDescriptorName(vnfID: string): void {
        this.selectedVNFID = vnfID;
        this.scalingGroup = [];
        this.getFormControl('scalingname').setValue(null);
        const scalingGroupDescriptorName: SCALING[] = [];
        if (!isNullOrUndefined(this.params.data)) {
            const vnfdPackageDetails: VNFD = this.params.data.filter((vnfdData: VNFD): boolean => vnfdData.id === vnfID)[0];
            if (vnfdPackageDetails.df.length > 0) {
                vnfdPackageDetails.df.forEach((df: DF): void => {
                    if (!isNullOrUndefined(df['scaling-aspect']) && df['scaling-aspect'].length > 0) {
                        df['scaling-aspect'].forEach((scalingAspect: SCALING): void => {
                            scalingGroupDescriptorName.push(scalingAspect);
                        });
                    }
                });
                this.scalingGroup = scalingGroupDescriptorName;
            }
        }
    }

    /** If form is valid and call scaleInstances method to initialize scaling @public */
    public manualScalingTrigger(): void {
        this.submitted = true;
        this.sharedService.cleanForm(this.scalingForm);
        if (this.scalingForm.invalid) { return; } // Proceed, onces form is valid
        const scalingPayload: object = {
            scaleType: 'SCALE_VNF',
            scaleVnfData:
            {
                scaleVnfType: this.scalingForm.value.scaleType,
                scaleByStepData: {
                    'scaling-group-descriptor': this.scalingForm.value.scalingname,
                    'member-vnf-index': this.scalingForm.value.memberIndex
                }
            }
        };
        this.scaleInstances(scalingPayload);
    }

    /** Initialize the scaling @public */
    public scaleInstances(scalingPayload: object): void {
        this.isLoadingResults = true;
        const apiURLHeader: APIURLHEADER = {
            url: environment.NSDINSTANCES_URL + '/' + this.params.id + '/scale',
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
