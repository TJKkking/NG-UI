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
 * @file Info Ns Model
 */
import { HttpClient } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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
import { ERRORDATA, URLPARAMS } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { NSDDetails } from 'NSDModel';
import { RestService } from 'RestService';
/** Set defaults json as type in information modal @constant */
const defaults: {} = {
  'text/json': ''
};
/**
 * Creating component
 * @Component takes ShowInfoComponent.html as template url
 */
@Component({
  templateUrl: './ShowInfoComponent.html',
  styleUrls: ['./ShowInfoComponent.scss']
})
/** Exporting a class @exports ShowInfoComponent */
export class ShowInfoComponent implements OnInit {
  /** Invoke service injectors @public */
  public injector: Injector;

  /** dataService to pass the data from one component to another @public */
  public dataService: DataService;

  /** Default variables holds NS data @public */
  public defaults: {} = defaults;

  /** Varaibles to hold http client @public */
  public httpClient: HttpClient;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** variables readOnly holds boolean @public */
  public readOnly: boolean = true;

  /** variables to hold mode changes of editor @public */
  public mode: string = 'text/json';

  /** To Set Mode @public */
  public modeDefault: string = 'javascript';

  /** variables to hold options of editor @public */
  public options: {} = {
    // eslint-disable-next-line no-invalid-this
    mode: this.modeDefault,
    showCursorWhenSelecting: true,
    autofocus: true,
    lineNumbers: true,
    lineWrapping: true,
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    autoCloseBrackets: true,
    matchBrackets: true,
    theme: 'neat',
    keyMap: 'sublime'
  };

  /** Reading the page Name @public */
  public titleName: string;

  /** Check the loading results @public */
  public isLoadingResults: Boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Input contains component objects @private */
  @Input() private params: URLPARAMS;

  /** Instance of the rest service @private */
  private restService: RestService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.dataService = this.injector.get(DataService);
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.isLoadingResults = true;
    this.defaults['text/json'] = '';
    this.titleName = this.params.titleName;
    // Checks page and assign URL
    if (this.params.page === 'ns-instance') {
      this.restService.getResource(environment.NSINSTANCESCONTENT_URL + '/' + this.params.id).subscribe((nsData: NSDDetails[]) => {
        this.defaults['text/json'] = JSON.stringify(nsData, null, '\t');
      }, (error: ERRORDATA) => {
        this.isLoadingResults = false;
        this.restService.handleError(error, 'get');
      }, () => {
        this.isLoadingResults = false;
      });
    } else if (this.params.page === 'ns-history-operation') {
      this.restService.getResource(environment.NSHISTORYOPERATIONS_URL + '/' +
        this.params.id).subscribe((nsHistoryOpn: {}[]) => {
          this.defaults['text/json'] = JSON.stringify(nsHistoryOpn, null, '\t');
        }, (error: ERRORDATA) => {
          this.isLoadingResults = false;
          this.restService.handleError(error, 'get');
        }, () => {
          this.isLoadingResults = false;
        });
    } else if (this.params.page === 'vnf-instance') {
      this.restService.getResource(environment.VNFINSTANCES_URL + '/' + this.params.id).subscribe((vnfData: {}[]) => {
        this.defaults['text/json'] = JSON.stringify(vnfData, null, '\t');
      }, (error: ERRORDATA) => {
        this.isLoadingResults = false;
        this.restService.handleError(error, 'get');
      }, () => {
        this.isLoadingResults = false;
      });
    } else if (this.params.page === 'net-slice-package') {
      this.restService.getResource(environment.NETWORKSLICETEMPLATECONTENT_URL + '/' + this.params.id).subscribe((netSliceData: {}[]) => {
        this.defaults['text/json'] = JSON.stringify(netSliceData, null, '\t');
      }, (error: ERRORDATA) => {
        this.isLoadingResults = false;
        this.restService.handleError(error, 'get');
      }, () => {
        this.isLoadingResults = false;
      });
    } else if (this.params.page === 'net-slice-instance') {
      this.restService.getResource(environment.NETWORKSLICEINSTANCESCONTENT_URL + '/' + this.params.id)
        .subscribe((netSliceInstanceData: {}[]) => {
          this.defaults['text/json'] = JSON.stringify(netSliceInstanceData, null, '\t');
        }, (error: ERRORDATA) => {
          this.isLoadingResults = false;
          this.restService.handleError(error, 'get');
        }, () => {
          this.isLoadingResults = false;
        });
    } else if (this.params.page === 'nst-history-operation') {
      this.restService.getResource(environment.NSTHISTORYOPERATIONS_URL + '/' +
        this.params.id).subscribe((nstHistoryOpn: {}[]) => {
          this.defaults['text/json'] = JSON.stringify(nstHistoryOpn, null, '\t');
        }, (error: ERRORDATA) => {
          this.isLoadingResults = false;
          this.restService.handleError(error, 'get');
        }, () => {
          this.isLoadingResults = false;
        });
    } else if (this.params.page === 'pdu-instances') {
      this.restService.getResource(environment.PDUINSTANCE_URL + '/' +
        this.params.id).subscribe((pduInstanceOpn: {}[]) => {
          this.defaults['text/json'] = JSON.stringify(pduInstanceOpn, null, '\t');
        }, (error: ERRORDATA) => {
          this.isLoadingResults = false;
          this.restService.handleError(error, 'get');
        }, () => {
          this.isLoadingResults = false;
        });
    } else if (this.params.page === 'k8s-cluster') {
      this.restService.getResource(environment.K8SCLUSTER_URL + '/' +
        this.params.id).subscribe((k8sclusterOpn: {}[]) => {
          this.defaults['text/json'] = JSON.stringify(k8sclusterOpn, null, '\t');
        }, (error: ERRORDATA) => {
          this.isLoadingResults = false;
          this.restService.handleError(error, 'get');
        }, () => {
          this.isLoadingResults = false;
        });
    } else if (this.params.page === 'k8s-repo') {
      this.restService.getResource(environment.K8REPOS_URL + '/' +
        this.params.id).subscribe((k8srepoOpn: {}[]) => {
          this.defaults['text/json'] = JSON.stringify(k8srepoOpn, null, '\t');
        }, (error: ERRORDATA) => {
          this.isLoadingResults = false;
          this.restService.handleError(error, 'get');
        }, () => {
          this.isLoadingResults = false;
        });
    }
  }
}
