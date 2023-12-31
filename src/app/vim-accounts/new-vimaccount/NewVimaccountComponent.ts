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
 import { isNullOrUndefined } from 'util';
import { HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/display/fullscreen';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/keymap/sublime';
import 'codemirror/lib/codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/yaml/yaml';
import {
  APIURLHEADER, ERRORDATA, TYPEAWS, TYPEAZURE, TYPEOPENSTACK, TYPEOPENVIMNEBULA, TYPEOTERS,
  TYPESECTION, TYPEVMWARE, VIM_TYPES
} from 'CommonModel';
import { environment } from 'environment';
import * as jsyaml from 'js-yaml';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { VimAccountDetails } from 'VimAccountModel';

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

  /** Form submission Add */
  public submitted: boolean = false;

  /** Showing more details of collapase */
  public isCollapsed: boolean = false;

  /** Check the Projects loading results @public */
  public isLocationLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Handle the formate Change @public */
  public defaults: {} = {
    'text/x-yaml': ''
  };

  /** To Set Mode @public */
  public mode: string = 'text/x-yaml';

  /** To Set Mode @public */
  public modeDefault: string = 'yaml';

  /** options @public */
  public options: {} = {
    // eslint-disable-next-line no-invalid-this
    mode: this.modeDefault,
    showCursorWhenSelecting: true,
    autofocus: true,
    autoRefresh: true,
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    autoCloseBrackets: true,
    matchBrackets: true,
    theme: 'neat',
    keyMap: 'sublime'
  };

  /** Data @public */
  public data: string = '';

  /** Element ref for fileInput @public */
  @ViewChild('fileInput', { static: true }) public fileInput: ElementRef;

  /** Element ref for fileInput @public */
  @ViewChild('fileInputLabel', { static: true }) public fileInputLabel: ElementRef;

  /** Contains all methods related to shared @private */
  public sharedService: SharedService;

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

  /** VIM Details @private */
  private vimDetail: VimAccountDetails[];

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.formBuilder = this.injector.get(FormBuilder);
    this.router = this.injector.get(Router);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.vimNewAccountForm.controls; }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.vimType = VIM_TYPES;
    this.headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    this.initializeForm();
  }

  /** VIM Initialize Forms @public */
  public initializeForm(): void {
    this.vimNewAccountForm = this.formBuilder.group({
      name: [null, Validators.required],
      vim_type: [null, Validators.required],
      vim_tenant_name: [null, Validators.required],
      description: [null],
      vim_url: [null, [Validators.required, Validators.pattern(this.sharedService.REGX_URL_PATTERN)]],
      schema_type: [''],
      vim_user: [null, Validators.required],
      vim_password: [null, Validators.required],
      locationName: [''],
      latitude: ['', Validators.pattern(this.sharedService.REGX_LAT_PATTERN)],
      longitude: ['', Validators.pattern(this.sharedService.REGX_LONG_PATTERN)],
      config: this.paramsBuilder()
    });
  }

  /** Generate params for config @public */
  public paramsBuilder(): FormGroup {
    return this.formBuilder.group({
      location: [null]
    });
  }

  /** On modal submit newVimAccountSubmit will called @public */
  public newVimAccountSubmit(): void {
    this.submitted = true;

    if (!this.vimNewAccountForm.invalid) {
      this.isLocationLoadingResults = true;
      this.sharedService.cleanForm(this.vimNewAccountForm, 'vim');
      if (!isNullOrUndefined(this.data) && this.data !== '') {
        Object.assign(this.vimNewAccountForm.value.config, jsyaml.load(this.data.toString(), { json: true }));
      } else {
        Object.keys(this.vimNewAccountForm.value.config).forEach((res: string): void => {
          if (res !== 'location') {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete, security/detect-object-injection
            delete this.vimNewAccountForm.value.config[res];
          }
        });
      }
      if (!isNullOrUndefined(this.vimNewAccountForm.value.latitude) && !isNullOrUndefined(this.vimNewAccountForm.value.longitude)) {
        this.vimNewAccountForm.value.config.location = this.vimNewAccountForm.value.locationName + ',' +
          this.vimNewAccountForm.value.longitude + ',' +
          this.vimNewAccountForm.value.latitude;
      }

      if (isNullOrUndefined(this.vimNewAccountForm.value.config.location)) {
        delete this.vimNewAccountForm.value.config.location;
      }

      Object.keys(this.vimNewAccountForm.value.config).forEach((res: string): void => {
        // eslint-disable-next-line security/detect-object-injection
        if (isNullOrUndefined(this.vimNewAccountForm.value.config[res]) || this.vimNewAccountForm.value.config[res] === '') {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete, security/detect-object-injection
          delete this.vimNewAccountForm.value.config[res];
        }
      });
      this.createNewVIM();
    }
  }

  /** Create a new VIM Account @public */
  public createNewVIM(): void {
    const apiURLHeader: APIURLHEADER = {
      url: environment.VIMACCOUNTS_URL,
      httpOptions: { headers: this.headers }
    };
    delete this.vimNewAccountForm.value.locationName;
    delete this.vimNewAccountForm.value.latitude;
    delete this.vimNewAccountForm.value.longitude;
    this.restService.postResource(apiURLHeader, this.vimNewAccountForm.value)
      .subscribe((result: {id: string}): void => {
        this.notifierService.notify('success', this.translateService.instant('PAGE.VIM.CREATEDSUCCESSFULLY'));
        this.isLocationLoadingResults = false;
        this.router.navigate(['vim/info/' + result.id]).catch((): void => {
          // Error Cached;
        });
      }, (error: ERRORDATA): void => {
        this.restService.handleError(error, 'post');
        this.isLocationLoadingResults = false;
      });
  }

  /** HandleChange function @public */
  public handleChange($event: string): void {
    this.data = $event;
  }

  /** Routing to VIM Account Details Page @public */
  public onVimAccountBack(): void {
    this.router.navigate(['vim/details']).catch((): void => {
      // Error Cached
    });
  }

  /** Drag and drop feature and fetchind the details of files  @private */
  public filesDropped(files: FileList): void {
    if (files && files.length === 1) {
      this.sharedService.getFileString(files, 'yaml').then((fileContent: string): void => {
        const getJson: string = jsyaml.load(fileContent, { json: true });
        this.defaults['text/x-yaml'] = fileContent;
        this.data = fileContent;
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

  /** Load sample config based on VIM type @public */
  public loadSampleConfig(): void {
    this.clearConfig();
    if (this.selectedVimType === 'openstack') {
      this.defaults['text/x-yaml'] = jsyaml.dump(TYPEOPENSTACK);
      this.data = JSON.stringify(TYPEOPENSTACK, null, '\t');
    } else if (this.selectedVimType === 'aws') {
      this.defaults['text/x-yaml'] = jsyaml.dump(TYPEAWS);
      this.data = JSON.stringify(TYPEAWS, null, '\t');
    } else if (this.selectedVimType === 'vmware') {
      this.defaults['text/x-yaml'] = jsyaml.dump(TYPEVMWARE);
      this.data = JSON.stringify(TYPEVMWARE, null, '\t');
    } else if (this.selectedVimType === 'openvim' || this.selectedVimType === 'opennebula') {
      this.defaults['text/x-yaml'] = jsyaml.dump(TYPEOPENVIMNEBULA);
      this.data = JSON.stringify(TYPEOPENVIMNEBULA, null, '\t');
    } else if (this.selectedVimType === 'azure' || this.selectedVimType === 'opennebula') {
      this.defaults['text/x-yaml'] = jsyaml.dump(TYPEAZURE);
      this.data = JSON.stringify(TYPEAZURE, null, '\t');
    } else {
      this.defaults['text/x-yaml'] = jsyaml.dump(TYPEOTERS);
      this.data = JSON.stringify(TYPEOTERS, null, '\t');
    }
  }

  /** Clear config parameters @public */
  public clearConfig(): void {
    this.defaults['text/x-yaml'] = '';
    this.data = '';
    this.fileInput.nativeElement.value = null;
  }
}
