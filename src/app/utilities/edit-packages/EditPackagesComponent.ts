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
 * @file Edit Actions Component
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { APIURLHEADER, ERRORDATA, GETAPIURLHEADER } from 'CommonModel';
import { environment } from 'environment';
import * as HttpStatus from 'http-status-codes';
import * as jsyaml from 'js-yaml';
import { NSDDetails } from 'NSDModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes EditPackagesComponent.html as template url
 */
@Component({
  selector: 'app-edit-packages',
  templateUrl: './EditPackagesComponent.html',
  styleUrls: ['./EditPackagesComponent.scss']
})

/** Exporting a class @exports EditPackagesComponent */
export class EditPackagesComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** dataService to pass the data from one component to another @public */
  public identifier: {} = {};

  /** readOnly @public */
  public readOnly: boolean = false;

  /** Handle the formate Change @public */
  public defaults: {} = {
    'text/x-yaml': '',
    'text/json': ''
  };

  /** Get & Update URL VNFD & NSD */
  public getUpdateURL: string;

  /** Pass the type of VNFD & NSD for fetching text */
  public getFileContentType: string;

  /** Pass the type of VNFD & NSD for fileUpdate */
  public updateFileContentType: string;

  /** To Set Mode @public */
  public mode: string = 'text/x-yaml';

  /** To Set Mode @public */
  public modeDefault: string = 'yaml';

  /** options @public */
  public options: {} = {
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

  /** Ymal Url for the VNFD & NSD */
  public ymalUrl: string;

  /** json Url for the VNFD & NSD */
  public jsonUrl: string;

  /** Navigation Path for the VNFD & NSD */
  public navigatePath: string;

  /** Package type */
  public pacakgeType: string;

  /** variables contains paramsID @public */
  public paramsID: string;

  /** Controls the File Type List form @public */
  public fileTypes: { value: string; viewValue: string; }[] = [];

  /** Check the loading results @public */
  public isLoadingResults: boolean = true;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Instance of the rest service @private */
  private restService: RestService;

  /** Holds teh instance of AuthService class of type AuthService @private */
  private router: Router;

  /** Holds teh instance of AuthService class of type AuthService @private */
  private activatedRoute: ActivatedRoute;

  /** Data @private */
  private data: string = '';

  /** contains http options @private */
  private httpOptions: HttpHeaders;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
  }

  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    // tslint:disable-next-line: no-backbone-get-set-outside-model
    this.paramsID = this.activatedRoute.snapshot.paramMap.get('id');
    // tslint:disable-next-line: no-backbone-get-set-outside-model
    this.pacakgeType = this.activatedRoute.snapshot.paramMap.get('type');
    this.generateURLPath();
  }

  /** generate ymalURL, JSONURL, navigation Path */
  public generateURLPath(): void {
    if (this.pacakgeType === 'vnf') {
      this.getUpdateURL = environment.VNFPACKAGES_URL;
      this.getFileContentType = 'vnfd';
      this.updateFileContentType = 'package_content';
      this.navigatePath = 'vnf';
      this.fileTypes = [{ value: 'text/x-yaml', viewValue: 'yaml' }, { value: 'text/json', viewValue: 'json' }];
      this.httpOptions = this.getHeadersWithContentAccept('application/gzip', 'application/json');
      this.getEditFileData();
    } else if (this.pacakgeType === 'netslice') {
      this.getUpdateURL = environment.NETWORKSLICETEMPLATE_URL;
      this.getFileContentType = 'nst';
      this.updateFileContentType = 'nst_content';
      this.navigatePath = 'netslice';
      this.fileTypes = [{ value: 'text/x-yaml', viewValue: 'yaml' }];
      this.httpOptions = this.getHeadersWithContentAccept('application/yaml', 'application/json');
      this.getEditFileData();
    } else {
      this.getUpdateURL = environment.NSDESCRIPTORS_URL;
      this.getFileContentType = 'nsd';
      this.updateFileContentType = 'nsd_content';
      this.pacakgeType = 'nsd';
      this.navigatePath = 'ns';
      this.fileTypes = [{ value: 'text/x-yaml', viewValue: 'yaml' }, { value: 'text/json', viewValue: 'json' }];
      this.httpOptions = this.getHeadersWithContentAccept('application/gzip', 'application/json');
      this.getEditFileData();
    }
  }

  /** Get the headers based on the type @public */
  public getHeadersWithContentAccept(contentType: string, acceptType: string): HttpHeaders {
    this.headers = new HttpHeaders({
      'Content-Type': contentType,
      Accept: acceptType,
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    return this.headers;
  }

  /** ChangeMode function @public */
  public changeMode(): void {
    if (this.mode === 'text/x-yaml') {
      this.modeDefault = 'yaml';
    } else {
      this.modeDefault = 'javascript';
    }
    this.options = {
      ...this.options,
      mode: this.modeDefault
    };
    this.data = '';
  }

  /** HandleChange function @public */
  public handleChange($event: string): void {
    this.data = $event;
  }

  /** Update function @public */
  public update(showgraph: boolean): void {
    if (this.data === '') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.TOPOLOGY.DATAEMPTY'));
    } else {
      this.updateCheck(showgraph);
    }
  }
  /** Update the file Data @public */
  public updateFileData(urlHeader: APIURLHEADER, fileData: string | ArrayBuffer, showgraph: boolean, packageType: string): void {
    this.restService.putResource(urlHeader, fileData).subscribe(() => {
      this.isLoadingResults = false;
      this.notifierService.notify('success', this.translateService.instant(
        (packageType !== 'netslice') ? 'PAGE.NSPACKAGE.EDITPACKAGES.UPDATEDSUCCESSFULLY' : 'PAGE.NETSLICE.UPDATEDSUCCESSFULLY'));
      if (showgraph) {
        if (packageType === 'nsd') {
          this.router.navigate(['/packages/ns/compose/' + this.paramsID]).catch();
        } else if (packageType === 'vnf') {
          this.router.navigate(['/packages/vnf/compose/' + this.paramsID]).catch();
        }
      }
      this.getEditFileData();
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'put');
    });
  }
  /** Update method for NS, VNF and net-slice template */
  private updateCheck(showgraph: boolean): void {
    this.isLoadingResults = true;
    const apiURLHeader: APIURLHEADER = {
      url: this.getUpdateURL + '/' + this.paramsID + '/' + this.updateFileContentType,
      httpOptions: { headers: this.httpOptions }
    };
    let descriptorInfo: string = '';
    if (this.mode === 'text/json') {
      descriptorInfo = jsyaml.dump(JSON.parse(this.data), {sortKeys: true});
    } else {
      descriptorInfo = this.data;
    }
    if (this.getFileContentType !== 'nst') {
      this.sharedService.targzFile({ packageType: this.pacakgeType, id: this.paramsID, descriptor: descriptorInfo })
        .then((content: ArrayBuffer): void => {
          this.updateFileData(apiURLHeader, content, showgraph, this.pacakgeType);
        }).catch((): void => {
          this.isLoadingResults = false;
          this.notifierService.notify('error', this.translateService.instant('ERROR'));
        });
    } else {
      this.updateFileData(apiURLHeader, descriptorInfo, showgraph, this.pacakgeType);
    }
  }
  /** Get the YAML content response as a plain/text and convert to JSON Format @private */
  private getEditFileData(): void {
    this.isLoadingResults = true;
    const gethttpOptions: HttpHeaders = this.getHeadersWithContentAccept('application/json', 'text/plain');
    const httpOptions: GETAPIURLHEADER = {
      headers: gethttpOptions,
      responseType: 'text'
    };
    this.restService.getResource(this.getUpdateURL + '/' + this.paramsID + '/' + this.getFileContentType, httpOptions)
      .subscribe((nsData: NSDDetails[]) => {
        const getJson: string = jsyaml.load(nsData.toString(), { json: true });
        //tslint:disable-next-line:no-string-literal
        this.defaults['text/x-yaml'] = nsData.toString();
        this.defaults['text/json'] = JSON.stringify(getJson, null, '\t');
        this.isLoadingResults = false;
      }, (error: ERRORDATA) => {
        error.error = typeof error.error === 'string' ? jsyaml.load(error.error) : error.error;
        if (error.error.status === HttpStatus.NOT_FOUND || error.error.status === HttpStatus.UNAUTHORIZED  ) {
          this.router.navigateByUrl('404', { skipLocationChange: true }).catch();
        } else {
          this.restService.handleError(error, 'get');
        }
        this.isLoadingResults = false;
      });
  }
}
