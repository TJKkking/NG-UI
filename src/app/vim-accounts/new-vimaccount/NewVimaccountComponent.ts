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
 * @file Vim Account Component.
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, TYPESECTION, VIM_TYPES } from 'CommonModel';
import { environment } from 'environment';
import * as jsyaml from 'js-yaml';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';
import { FEATURES, VIMLOCATION, VIMLOCATIONDATA } from 'VimAccountModel';

/**
 * Creating component
 * @Component takes NewVimaccountComponent.html as template url
 */
@Component({
  selector: 'app-new-vimaccount',
  templateUrl: './NewVimaccountComponent.html',
  styleUrls: ['./NewVimaccountComponent.scss']
})
/** Exporting a class @exports NewVimaccountComponent */
export class NewVimaccountComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** FormGroup vim New Account added to the form @ html @public */
  public vimNewAccountForm: FormGroup;

  /** Supported Vim type for the dropdown */
  public vimType: TYPESECTION[];

  /** Supported Vim type for the dropdown */
  public selectedVimType: string;

  /** Supported true and false value for the dropdown */
  public boolValue: {}[];

  /** Form submission Add */
  public submitted: boolean = false;

  /** Showing more details of collapase */
  public isCollapsed: boolean = false;

  /** Vim location values @public */
  public getVIMLocation: VIMLOCATIONDATA[] = [];

  /** Check the Projects loading results @public */
  public isLocationLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** set the longitude value of the selected place @public */
  public setLong: number;

  /** set the latitude value of the selected place @public */
  public setLat: number;

  /** Element ref for fileInput @public */
  @ViewChild('fileInput', { static: true }) public fileInput: ElementRef;

  /** Element ref for fileInput @public */
  @ViewChild('fileInputLabel', { static: true }) public fileInputLabel: ElementRef;

  /** Instance of the rest service @private */
  private restService: RestService;

  /** Holds the instance of router class @private */
  private router: Router;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Contains configuration key variables @private */
  private configKeys: string[] = [];

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.formBuilder = this.injector.get(FormBuilder);
    this.router = this.injector.get(Router);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);

    /** Initializing Form Action */
    this.vimNewAccountForm = this.formBuilder.group({
      name: [null, Validators.required],
      vim_type: [null, Validators.required],
      vim_tenant_name: [null, Validators.required],
      description: [null],
      vim_url: [null, [Validators.required, Validators.pattern(this.sharedService.REGX_URL_PATTERN)]],
      schema_type: [''],
      vim_user: [null, Validators.required],
      vim_password: [null, Validators.required],
      vimconfig: this.paramsBuilder()
    });
  }

  /** Generate params for config @public */
  public paramsBuilder(): FormGroup {
    return this.formBuilder.group({
      use_existing_flavors: [null],
      location: [null],
      sdn_controller: [null],
      APIversion: [null],
      sdn_port_mapping: [null],
      project_domain_id: [null],
      vim_network_name: [null],
      project_domain_name: [null],
      config_vim_ype: [null],
      user_domain_id: [null],
      security_groups: [null],
      user_domain_name: [null],
      availabilityZone: [null],
      keypair: [null],
      region_name: [null],
      dataplane_physical_net: [null],
      insecure: [null],
      use_floating_ip: [null],
      microversion: [null],
      use_internal_endpoint: [null],
      additional_conf: [null],
      orgname: [null],
      vcenter_ip: [null],
      vcenter_port: [null],
      admin_username: [null],
      vcenter_user: [null],
      admin_password: [null],
      vcenter_password: [null],
      nsx_manager: [null],
      vrops_site: [null],
      nsx_user: [null],
      vrops_user: [null],
      nsx_password: [null],
      vrops_password: [null],
      vpc_cidr_block: [null],
      flavor_info: [null],
      subscription_id: [null],
      resource_group: [null],
      vnet_name: [null],
      flavors_pattern: [null]
    });
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.vimNewAccountForm.controls; }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.vimType = VIM_TYPES;
    this.boolValue = [
      { id: '', name: 'None' },
      { id: true, name: 'True' },
      { id: false, name: 'False' }
    ];
    this.headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
  }

  /** On modal submit newVimAccountSubmit will called @public */
  public newVimAccountSubmit(): void {
    this.submitted = true;
    if (!this.vimNewAccountForm.invalid) {
      this.isLocationLoadingResults = true;
      this.configKeys.forEach((key: string) => {
        this.vimNewAccountForm.controls.vimconfig.get(key).setValue(JSON.parse(this.vimNewAccountForm.controls.vimconfig.get(key).value));
      });
      this.sharedService.cleanForm(this.vimNewAccountForm);
      Object.keys(this.vimNewAccountForm.value.vimconfig).forEach((key: string) => {
        if (this.vimNewAccountForm.value.vimconfig[key] === undefined || this.vimNewAccountForm.value.vimconfig[key] === null ||
          this.vimNewAccountForm.value.vimconfig[key] === '') {
          delete this.vimNewAccountForm.value.vimconfig[key];
        }
      });
      this.vimNewAccountForm.value.config = this.vimNewAccountForm.value.vimconfig;
      delete this.vimNewAccountForm.value.vimconfig;
      const apiURLHeader: APIURLHEADER = {
        url: environment.VIMACCOUNTS_URL,
        httpOptions: { headers: this.headers }
      };
      this.restService.postResource(apiURLHeader, this.vimNewAccountForm.value)
        .subscribe((result: {}) => {
          this.notifierService.notify('success', this.translateService.instant('PAGE.VIM.CREATEDSUCCESSFULLY'));
          this.isLocationLoadingResults = false;
          this.router.navigate(['vim/details']).catch(() => {
            // Error Cached;
          });
          // Post the New Vim data and reflect in the VIM Details Page.
        }, (error: ERRORDATA) => {
          this.configKeys.forEach((key: string) => {
            this.vimNewAccountForm.controls.vimconfig.get(key)
              .setValue(JSON.stringify(this.vimNewAccountForm.controls.vimconfig.get(key).value));
          });
          this.restService.handleError(error, 'post');
          this.isLocationLoadingResults = false;
        });
    }
  }

  /** Routing to VIM Account Details Page @public */
  public onVimAccountBack(): void {
    this.router.navigate(['vim/details']).catch(() => {
      // Error Cached
    });
  }

  /** Fetching the location with name,latitude,longitude @public */
  public fetchLocationLatLong(value: string): void {
    this.isLocationLoadingResults = true;
    const newVIMLocation: VIMLOCATIONDATA[] = [];
    const locationTrack: string = environment.MAPLATLONGAPI_URL;
    const locationAPIURL: string = locationTrack.replace('{value}', value);
    this.restService.getResource(locationAPIURL).subscribe((result: VIMLOCATION) => {
      result.features.forEach((getFeturesResult: FEATURES) => {
        if ('extent' in getFeturesResult.properties) {
          getFeturesResult.properties.extent.forEach((extentResult: number, index: number) => {
            if (index === 0) {
              this.setLong = extentResult;
            }
            if (index === 1) {
              this.setLat = extentResult;
            }
          });
        } else {
          getFeturesResult.geometry.coordinates.forEach((coordinateResult: number, index: number) => {
            if (index === 0) {
              this.setLong = coordinateResult;
            }
            if (index === 1) {
              this.setLat = coordinateResult;
            }
          });
        }
        newVIMLocation.push({
          label: getFeturesResult.properties.name + ',' + getFeturesResult.properties.state + ', ' + getFeturesResult.properties.country,
          value: getFeturesResult.properties.name + ',' + this.setLong + ',' + this.setLat
        });
      });
      this.getVIMLocation = newVIMLocation;
      this.isLocationLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLocationLoadingResults = false;
    });
  }

  /** Drag and drop feature and fetchind the details of files  @private */
  public filesDropped(files: FileList): void {
    this.configKeys = [];
    if (files && files.length === 1) {
      this.sharedService.getFileString(files, 'yaml').then((fileContent: string): void => {
        const getJson: string = jsyaml.load(fileContent, { json: true });
        Object.keys(getJson).forEach((item: string) => {
          if (!isNullOrUndefined(this.vimNewAccountForm.controls.vimconfig.get(item))) {
            if (typeof getJson[item] === 'object') {
              // tslint:disable-next-line: no-backbone-get-set-outside-model
              this.vimNewAccountForm.controls.vimconfig.get(item).setValue(JSON.stringify(getJson[item]));
              this.configKeys.push(item);
            } else {
              // tslint:disable-next-line: no-backbone-get-set-outside-model
              this.vimNewAccountForm.controls.vimconfig.get(item).setValue(getJson[item]);
            }
          }
        });
      }).catch((err: string): void => {
        if (err === 'typeError') {
          this.notifierService.notify('error', this.translateService.instant('YAMLFILETYPEERRROR'));
        } else {
          this.notifierService.notify('error', this.translateService.instant('ERROR'));
        }
        this.fileInputLabel.nativeElement.innerText = this.translateService.instant('CHOOSEFILE');
        this.fileInput.nativeElement.value = null;
      });
    } else if (files && files.length > 1) {
      this.notifierService.notify('error', this.translateService.instant('DROPFILESVALIDATION'));
    }
    this.fileInputLabel.nativeElement.innerText = files[0].name;
    this.fileInput.nativeElement.value = null;
  }
}
