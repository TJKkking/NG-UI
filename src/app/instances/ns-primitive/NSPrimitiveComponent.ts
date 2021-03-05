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
 * @file NS Instance Primitive Component
 */
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, PRIMITIVEDATA, PRIMITIVETYPES, URLPARAMS } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { KDUPRIMITIVELEVEL, NSData, VDUPRIMITIVELEVEL, VNFPROFILE } from 'NSDModel';
import { NSPrimitiveParams } from 'NSInstanceModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';
import { CONFIGPRIMITIVE, DF, VDUCONFIG, VDUPROFILE, VNFCONFIG, VNFD } from 'VNFDModel';

/**
 * Creating component
 * @Component takes NSPrimitiveComponent.html as template url
 */
@Component({
    templateUrl: './NSPrimitiveComponent.html',
    styleUrls: ['./NSPrimitiveComponent.scss']
})
/** Exporting a class @exports NSPrimitiveComponent */
export class NSPrimitiveComponent implements OnInit {
    /** Form valid on submit trigger @public */
    public submitted: boolean = false;

    /** To inject services @public */
    public injector: Injector;

    /** Instance for active modal service @public */
    public activeModal: NgbActiveModal;

    /** FormGroup instance added to the form @ html @public */
    public primitiveForm: FormGroup;

    /** Primitive params array @public */
    public primitiveParams: FormArray;

    /** Variable set for twoway binding @public */
    public nsdId: string;

    /** Check the loading results @public */
    public isLoadingResults: boolean = false;

    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';

    /** Contains list of primitive parameter @public */
    public primitiveParameter: {}[] = [];

    /** Input contains component objects @public */
    @Input() public params: URLPARAMS;

    /** Contains list of primitive actions @public */
    public primitiveList: {}[];

    /** Contains objects that is used to hold types of primitive @public */
    public primitiveTypeList: PRIMITIVETYPES[] = [];

    /** Model value used to hold selected primitive type @public */
    public primitiveType: string;

    /** Contains list of VDU primitive lists @public */
    public vduList: VDUPROFILE[];

    /** Contains list of KDU primitive lists @public */
    public kduList: {}[];

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

    /** Contains objects that is used to convert key/value pair @private */
    private objectPrimitiveParams: {} = {};

    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.dataService = this.injector.get(DataService);
        this.translateService = this.injector.get(TranslateService);
        this.notifierService = this.injector.get(NotifierService);
        this.sharedService = this.injector.get(SharedService);
        this.activeModal = this.injector.get(NgbActiveModal);
        this.formBuilder = this.injector.get(FormBuilder);
        this.primitiveTypeList = [
            {
                title: this.translateService.instant('NSPRIMITIVE'),
                value: 'NS_Primitive'
            },
            {
                title: this.translateService.instant('VNFPRIMITIVE'),
                value: 'VNF_Primitive'
            },
            {
                title: this.translateService.instant('VDUPRIMITIVE'),
                value: 'VDU_Primitive'
            },
            {
                title: this.translateService.instant('KDUPRIMITIVE'),
                value: 'KDU_Primitive'
            }
        ];
    }

    /** convenience getter for easy access to form fields */
    get f(): FormGroup['controls'] { return this.primitiveForm.controls; }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        /** Setting up initial value for NSD */
        this.dataService.currentMessage.subscribe((event: NSData): void => {
            if (event.identifier !== undefined || event.identifier !== '' || event.identifier !== null) {
                this.nsdId = event.identifier;
            }
        });
        this.initializeForm();
    }

    /** initialize Forms @public */
    public initializeForm(): void {
        this.primitiveForm = this.formBuilder.group({
            primitive: [null, [Validators.required]],
            member_vnf_index: [null, [Validators.required]],
            vdu_id: [null, [Validators.required]],
            kdu_name: [null, [Validators.required]],
            primitive_params: this.formBuilder.array([this.primitiveParamsBuilder()])
        });
    }

    /** Generate primitive params @public */
    public primitiveParamsBuilder(): FormGroup {
        return this.formBuilder.group({
            primitive_params_name: [null, [Validators.required]],
            primitive_params_value: ['', [Validators.required]]
        });
    }

    /** Handle FormArray Controls @public */
    public getControls(): AbstractControl[] {
        return (this.getFormControl('primitive_params') as FormArray).controls;
    }

    /** Push all primitive params on user's action @public */
    public createPrimitiveParams(): void {
        this.primitiveParams = this.getFormControl('primitive_params') as FormArray;
        this.primitiveParams.push(this.primitiveParamsBuilder());
    }

    /** Remove primitive params on user's action @public */
    public removePrimitiveParams(index: number): void {
        this.primitiveParams.removeAt(index);
    }

    /** Execute Primitive @public */
    public execPrimitive(): void {
        this.submitted = true;
        this.objectPrimitiveParams = {};
        this.sharedService.cleanForm(this.primitiveForm);
        if (this.primitiveForm.invalid) { return; } // Proceed, onces form is valid
        this.primitiveForm.value.primitive_params.forEach((params: NSPrimitiveParams): void => {
            if (params.primitive_params_name !== null && params.primitive_params_value !== '') {
                this.objectPrimitiveParams[params.primitive_params_name] = params.primitive_params_value;
            }
        });
        //Prepare primitive params
        const primitiveParamsPayLoads: {} = {
            primitive: this.primitiveForm.value.primitive,
            primitive_params: this.objectPrimitiveParams
        };
        if (this.primitiveType === 'VNF_Primitive') {
            // tslint:disable-next-line: no-string-literal
            primitiveParamsPayLoads['member_vnf_index'] = this.primitiveForm.value.member_vnf_index;
        }
        if (this.primitiveType === 'VDU_Primitive') {
            // tslint:disable-next-line: no-string-literal
            primitiveParamsPayLoads['member_vnf_index'] = this.primitiveForm.value.member_vnf_index;
            // tslint:disable-next-line: no-string-literal
            primitiveParamsPayLoads['vdu_id'] = this.primitiveForm.value.vdu_id;
        }
        if (this.primitiveType === 'KDU_Primitive') {
            // tslint:disable-next-line: no-string-literal
            primitiveParamsPayLoads['member_vnf_index'] = this.primitiveForm.value.member_vnf_index;
            // tslint:disable-next-line: no-string-literal
            primitiveParamsPayLoads['kdu_name'] = this.primitiveForm.value.kdu_name;
        }
        const apiURLHeader: APIURLHEADER = {
            url: environment.NSDINSTANCES_URL + '/' + this.nsdId + '/action'
        };
        this.isLoadingResults = true;
        this.restService.postResource(apiURLHeader, primitiveParamsPayLoads).subscribe((result: {}): void => {
            this.activeModal.dismiss();
            this.notifierService.notify('success', this.translateService.instant('PAGE.NSPRIMITIVE.EXECUTEDSUCCESSFULLY'));
            this.isLoadingResults = false;
        }, (error: ERRORDATA): void => {
            this.isLoadingResults = false;
            this.restService.handleError(error, 'post');
        });
    }
    /** Primitive type change event @public */
    public primitiveTypeChange(data: PRIMITIVETYPES): void {
        this.primitiveList = [];
        this.primitiveParameter = [];
        this.initializeForm();
        if (data.value === 'NS_Primitive') {
            this.getNSInfo(this.params.name);
            this.setUpdateValueandValidation('member_vnf_index');
        }
        if (data.value === 'VNF_Primitive' || data.value === 'KDU_Primitive' || data.value === 'NS_Primitive') {
            this.setUpdateValueandValidation('vdu_id');
        }
        if (data.value === 'VDU_Primitive' || data.value === 'VNF_Primitive' || data.value === 'NS_Primitive') {
            this.setUpdateValueandValidation('kdu_name');
        }
    }
    /** Member index change event */
    public indexChange(data: VNFPROFILE, getType?: string): void {
        this.getFormControl('vdu_id').setValue(null);
        this.getFormControl('kdu_name').setValue(null);
        if (data['vnfd-id'] !== null) {
            this.getVnfdInfo(data['vnfd-id'], getType);
        } else {
            this.primitiveList = [];
            this.getFormControl('primitive').setValue(null);
            this.primitiveParameter = [];
        }
    }
    /** Get VDU/KDU primitive List for the selected event @public */
    public getPrimitiveList(data: {}, selectedType: string): void {
        this.primitiveList = data[selectedType + '-configuration']['config-primitive'];
    }
    /** Primivtive change event */
    public primitiveChange(data: PRIMITIVEDATA): void {
        this.primitiveParameter = [];
        const formArr: FormArray = this.getFormControl('primitive_params') as FormArray;
        formArr.controls = [];
        this.createPrimitiveParams();
        if (data) {
            this.updatePrimitive(data);
        }
    }
    /** Generate vdu section @public */
    public generateVDUData(vduConfig: VDUCONFIG): VDUPROFILE {
        return {
            id: vduConfig.id,
            name: vduConfig.id,
            'vdu-configuration': vduConfig
        };
    }
    /** Generate kdu section @public */
    public generateKDUData(kduData: KDUPRIMITIVELEVEL, kduConfig: VDUCONFIG): KDUPRIMITIVELEVEL {
        return {
            name: kduData.name,
            'juju-bundle': kduData['juju-bundle'],
            'kdu-configuration': kduConfig
        };
    }
    /** Used to set the validation and value and update the validation and value @public */
    public setUpdateValueandValidation(formName: string): void {
        this.getFormControl(formName).setValidators([]);
        this.getFormControl(formName).updateValueAndValidity();
    }
    /** Update primitive value based on parameter */
    private updatePrimitive(primitive: PRIMITIVEDATA): void {
        if (primitive.parameter) {
            this.primitiveParameter = primitive.parameter;
        } else {
            this.primitiveParameter = [];
            const formArr: AbstractControl[] = this.getControls();
            formArr.forEach((formGp: FormGroup): void => {
                formGp.controls.primitive_params_name.setValidators([]);
                formGp.controls.primitive_params_name.updateValueAndValidity();
                formGp.controls.primitive_params_value.setValidators([]);
                formGp.controls.primitive_params_value.updateValueAndValidity();
            });
        }
    }
    /** Get primivitive actions from vnfd data */
    private getVnfdInfo(vnfdRef: string, getType?: string): void {
        this.primitiveList = [];
        this.primitiveParameter = [];
        this.getFormControl('primitive').setValue(null);
        const apiUrl: string = environment.VNFPACKAGES_URL + '?id=' + vnfdRef;
        this.isLoadingResults = true;
        this.restService.getResource(apiUrl).subscribe((vnfdInfo: VNFD[]): void => {
                const vnfInstances: VNFD = vnfdInfo[0];
                if (!isNullOrUndefined(vnfInstances.df)) {
                    this.getFormControl('vdu_id').setValidators([]);
                    this.getFormControl('kdu_name').setValidators([]);
                    vnfInstances.df.forEach((df: DF): void => {
                        if (df['lcm-operations-configuration'] !== undefined) {
                            if (df['lcm-operations-configuration']['operate-vnf-op-config'] !== undefined) {
                                const day12Operation: VDUCONFIG[] = df['lcm-operations-configuration']['operate-vnf-op-config']['day1-2'];
                                if (day12Operation !== undefined) {
                                    const vnfprimitiveList: VNFCONFIG = day12Operation
                                        .filter((itemData: VNFCONFIG): boolean => itemData.id === vnfInstances.id)[0];
                                    if (vnfprimitiveList !== undefined) {
                                        this.primitiveList = vnfprimitiveList['config-primitive'];
                                    }
                                    /** VDU Primitive */
                                    if (getType === 'VDU_Primitive') {
                                        this.kduList = [];
                                        this.vduList = [];
                                        this.primitiveList = [];
                                        df['vdu-profile'].forEach((vduProfile: VDUPROFILE): void => {
                                            day12Operation.forEach((element: VDUCONFIG): void => {
                                                if (element.id === vduProfile.id){
                                                    const vduDataObj: VDUPROFILE = this.generateVDUData(element);
                                                    this.vduList.push(vduDataObj);
                                                }
                                            });
                                        });
                                    }
                                    /** KDU Primitive */
                                    if (getType === 'KDU_Primitive') {
                                        this.kduList = [];
                                        this.vduList = [];
                                        this.primitiveList = [];
                                        if (!isNullOrUndefined(vnfInstances.kdu)) {
                                            vnfInstances.kdu.forEach((kduData: KDUPRIMITIVELEVEL): void => {
                                                day12Operation.forEach((element: VDUCONFIG): void => {
                                                    if (element.id === kduData.name){
                                                        const kduDataObj: KDUPRIMITIVELEVEL = this.generateKDUData(kduData, element);
                                                        this.kduList.push(kduDataObj);
                                                    }
                                                });
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
                this.isLoadingResults = false;
            }, (error: ERRORDATA): void => {
                this.isLoadingResults = false;
                this.restService.handleError(error, 'get');
            });
    }
    /** Get primivitive actions from NSD data */
    private getNSInfo(nsdRef: string): void {
        this.primitiveList = [];
        this.primitiveParameter = [];
        this.getFormControl('primitive').setValue(null);
        const apiUrl: string = environment.NSDESCRIPTORS_URL + '?id=' + nsdRef;
        this.isLoadingResults = true;
        this.restService.getResource(apiUrl)
            .subscribe((nsdInfo: {}): void => {
                if (!isNullOrUndefined(nsdInfo[0]['ns-configuration'])) {
                    this.primitiveList = !isNullOrUndefined(nsdInfo[0]['ns-configuration']['config-primitive']) ?
                        nsdInfo[0]['ns-configuration']['config-primitive'] : [];
                } else {
                    this.primitiveList = [];
                }
                this.isLoadingResults = false;
            }, (error: ERRORDATA): void => {
                this.isLoadingResults = false;
                this.restService.handleError(error, 'get');
            });
    }
    /** Used to get the AbstractControl of controlName passed @private */
    private getFormControl(controlName: string): AbstractControl {
        return this.primitiveForm.controls[controlName];
    }
}
