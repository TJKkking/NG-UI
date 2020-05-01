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
 * @file NS Compose Component
 */
// tslint:disable: no-increment-decrement
import { HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, CONSTANTNUMBER, ERRORDATA, MODALCLOSERESPONSEDATA, MODALCLOSERESPONSEWITHCP } from 'CommonModel';
import { ConfirmationTopologyComponent } from 'ConfirmationTopology';
import * as d3 from 'd3';
import { DataService } from 'DataService';
import { environment } from 'environment';
import * as HttpStatus from 'http-status-codes';
import * as jsyaml from 'js-yaml';
import { COMPOSERNODES, CONSTITUENTVNFD, GRAPHDETAILS, NSDDetails, Tick, TickPath, VLD, VNFDCONNECTIONPOINTREF } from 'NSDModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';
import { VNFData, VNFDDetails } from 'VNFDModel';

/**
 * Creating component
 * @Component takes NSComposerComponent.html as template url
 */
@Component({
  selector: 'app-ns-composer',
  templateUrl: './NSComposerComponent.html',
  styleUrls: ['./NSComposerComponent.scss'],
  encapsulation: ViewEncapsulation.None
})
/** Exporting a class @exports NSComposerComponent */
export class NSComposerComponent {
  /** To inject services @public */
  public injector: Injector;
  /** View child contains graphContainer ref @public  */
  @ViewChild('graphContainer', { static: true }) public graphContainer: ElementRef;
  /** dataService to pass the data from one component to another @public */
  public dataService: DataService;
  /** Contains VNFD Informations @public */
  public vnfdPackageDetails: VNFData = { identifier: '', shortName: '', vendor: '', description: '', version: '', id: '', name: '' };
  /** Contains VL Details @public */
  public vlDetails: VLD = {
    name: '',
    'mgmt-network': true,
    'vim-network-name': '',
    type: '',
    id: ''
  };
  /** Contains the information of the type of modification @public  */
  public putType: string;
  /** Conatins mousedown action @public */
  public mousedownNode: COMPOSERNODES = null;
  /** Conatins mouseup action @public */
  public mouseupNode: COMPOSERNODES = null;
  /** Conatins mousedownLink action @public */
  public mousedownLink: COMPOSERNODES = null;
  /** Conatins current Selection node action @public */
  public currentSelectedNode: COMPOSERNODES = null;
  /** Conatins current Selection node action @public */
  public currentSelectedLink: COMPOSERNODES = null;
  /** Need to show the NSD Details @public */
  public isShowNSDDetails: boolean = true;
  /** Contains the node information of VL @public */
  public vlNodes: {}[] = [];
  /** Need to show the VL Details @public */
  public isShowVLDetails: boolean = false;
  /** Contains the node information of VNF @public */
  public vnfNodes: {}[] = [];
  /** contains the VNF Details @public */
  public vnfData: CONSTITUENTVNFD;
  /** Need to show the VNF Details @public */
  public isShowVNFDetails: boolean = false;
  /** Contains the node information of CP @public */
  public cpNodes: {}[] = [];
  /** Need to show the CP Details */
  public cpData: VNFDCONNECTIONPOINTREF;
  /** Need to show the VNF Details @public */
  public isShowCPDetails: boolean = false;
  /** random number count @public */
  public randomNumberLength: number;
  /** Contains the vnfd information @public */
  public vnfList: VNFDDetails[] = [];
  /** Add the activeclass for the selected @public */
  public activeClass: string = 'active';
  /** Add the fixed class for the freeze @public */
  public fixedClass: string = 'fixed';
  /** Check the loading results @public */
  public isLoadingResults: boolean = true;
  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';
  /** Get VNF selected node @public */
  public getVNFSelectedData: VNFDDetails[];
  /** Assign the forcesimulation active @public */
  public forceSimulationActive: boolean = false;
  /** Assign pinned class for the button when freezed @public */
  public classApplied: boolean = false;
  /** Contains sidebar open status @public */
  public sideBarOpened: boolean = false;
  /** Contains SVG attributes @private */
  // tslint:disable-next-line:no-any
  private svg: any;
  /** Contains the Drag line */
  // tslint:disable-next-line: no-any
  private dragLine: any;
  /** Contains VL node @private */
  // tslint:disable-next-line:no-any
  private vlNode: any;
  /** Contains VNFD node @private */
  // tslint:disable-next-line:no-any
  private vnfdnode: any;
  /** Contains CP node @private */
  // tslint:disable-next-line:no-any
  private cpnode: any;
  /** Rendered nodes represent VL @private */
  // tslint:disable-next-line:no-any
  private gvlNode: any;
  /** Rendered nodes represent VL @private */
  // tslint:disable-next-line:no-any
  private gvnfdNode: any;
  /** Rendered nodes represent VL @private */
  // tslint:disable-next-line:no-any
  private gcpNode: any;
  /** Contains forced node animations @private */
  // tslint:disable-next-line:no-any
  private force: any;
  /** Contains all the selected node @private */
  private selectedNode: COMPOSERNODES[] = [];
  /** variables used for CP @private */
  private iConnectionPointRef: number = 0;
  /** Contains the connected point @private */
  private connectionPoint: string;
  /** Contains all the NSD information @private */
  private nsd: string;
  /** Contains all the VNFD information @private */
  private vnfd: string;
  /** Contains id of the node @private */
  private identifier: string;
  /** Variables used for cp @private */
  private jConnectionPointRef: number = 0;
  /** Contains copy of NSD information @private */
  private nsdCopy: string;
  /** Contains the VNFD copy @private */
  private vnfdCopy: string;
  /** Contains name of the node @private */
  private name: string;
  /** Contains member vnf index value of the node @private */
  private memberVnfIndexValue: number = 0;
  /** Contains path information of the node */
  // tslint:disable-next-line:no-any
  private path: any;
  /** Contains the node information @private */
  private nodes: COMPOSERNODES[] = [];
  /** Contains the link information of nodes @private */
  private links: {}[] = [];
  /** Contains the NS information @private */
  private nsData: NSDDetails;
  /** Instance of the rest service @private */
  private restService: RestService;
  /** Service holds the router information @private */
  private router: Router;
  /** Holds teh instance of AuthService class of type AuthService @private */
  private activatedRoute: ActivatedRoute;
  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;
  /** Controls the header form @private */
  private headers: HttpHeaders;
  /** Contains tranlsate instance @private */
  private translateService: TranslateService;
  /** Contains lastkeypressed instance @private */
  private lastKeyDown: number = -1;
  /** Instance of the modal service @private */
  private modalService: NgbModal;
  /** Setting the Value of connection point refrence of the CP @private */
  private setVnfdConnectionPointRef: string;
  /** Setting the Value of VL name for confirmation @private */
  private vlName: string;
  /** Setting the Value of VNFD name for confirmation @private */
  private setVnfdName: string;
  /** Contains all methods related to shared @private */
  private sharedService: SharedService;
  /** Contains selected node VLD objects @private */
  private selectedVLDResult: VLD;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.dataService = this.injector.get(DataService);
    this.router = this.injector.get(Router);
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.modalService = this.injector.get(NgbModal);
    this.sharedService = this.injector.get(SharedService);
  }
  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    // tslint:disable-next-line:no-backbone-get-set-outside-model
    this.identifier = this.activatedRoute.snapshot.paramMap.get('id');
    this.generateData();
    this.headers = new HttpHeaders({
      'Content-Type': 'application/zip',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
  }
  /** Events handles at drag on D3 region @public */
  // tslint:disable-next-line:no-any
  public drag(ev: any): void {
    if (ev.target.id === 'vl') {
      ev.dataTransfer.setData('text', ev.target.id);
    } else {
      ev.dataTransfer.setData('text', ev.target.attributes['data-id'].value);
    }
  }
  /** On clicking redirect to NS edit page @public */
  public onEdit(): void {
    this.router.navigate(['/packages/ns/edit/', this.identifier]).catch(() => {
      // Catch Navigation Error
    });
  }
  /** Events handles drop at D3 region @public */
  public drop(ev: DragEvent): void {
    event.preventDefault();
    this.name = ev.dataTransfer.getData('text');
    if (this.name === 'vl') {
      this.svg.selectAll('*').remove();
      this.vldropComposer();
    } else {
      this.svg.selectAll('*').remove();
      this.vnfd = ev.dataTransfer.getData('text');
      this.vnfdropComposer();
    }
  }
  /** Drop VL Composer Data @public */
  public vldropComposer(): void {
    this.randomNumberLength = CONSTANTNUMBER.randomNumber;
    const generateId: string = 'ns_vl_' + this.randomString(
      this.randomNumberLength,
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    );
    if (this.nsData.vld !== undefined) {
      this.nsData.vld.push({
        'vim-network-name': 'PUBLIC',
        name: generateId,
        'mgmt-network': true,
        type: 'ELAN',
        id: generateId
      });
    } else {
      Object.assign(this.nsData, {
        vld: [{
          'vim-network-name': 'PUBLIC',
          name: generateId,
          'mgmt-network': true,
          type: 'ELAN',
          id: generateId
        }]
      });
    }
    this.putType = 'nsdadd';
    this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
  }
  /** Drop VNFD Composer Data @public */
  public vnfdropComposer(): void {
    if (this.nsData['constituent-vnfd'] !== undefined) {
      this.nsData['constituent-vnfd'].push({
        'vnfd-id-ref': this.vnfd,
        'member-vnf-index': ++this.memberVnfIndexValue
      });
    } else {
      Object.assign(this.nsData, {
        'constituent-vnfd': [{
          'vnfd-id-ref': this.vnfd,
          'member-vnf-index': ++this.memberVnfIndexValue
        }]
      });
    }
    this.putType = 'vnfdadd';
    this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
  }
  /** Events handles allow drop on D3 region @public */
  public allowDrop(ev: DragEvent): void {
    ev.preventDefault();
  }
  /** Save NSD Information @public */
  public saveNSD(): void {
    if (this.vnfdPackageDetails.shortName !== undefined) {
      this.nsData['short-name'] = this.vnfdPackageDetails.shortName;
    }
    if (this.vnfdPackageDetails.vendor !== undefined) {
      this.nsData.vendor = this.vnfdPackageDetails.vendor;
    }
    if (this.vnfdPackageDetails.description !== undefined) {
      this.nsData.description = this.vnfdPackageDetails.description;
    }
    if (this.vnfdPackageDetails.version !== undefined) {
      this.nsData.version = this.vnfdPackageDetails.version;
    }
    if (this.vnfdPackageDetails.id !== undefined) {
      this.nsData.id = this.vnfdPackageDetails.id;
    }
    if (this.vnfdPackageDetails.name !== undefined) {
      this.nsData.name = this.vnfdPackageDetails.name;
    }
    this.putType = 'nsdUpdate';
    this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
  }
  /** Save Virtual Link @public */
  public saveVL(vlid: string): void {
    this.nsData.vld.forEach((result: VLD) => {
      if (result.id === vlid) {
        result.name = this.vlDetails.name;
        result['mgmt-network'] = !isNullOrUndefined(this.vlDetails['mgmt-network']) ? this.vlDetails['mgmt-network'] : true;
        result['vim-network-name'] = !isNullOrUndefined(this.vlDetails['vim-network-name']) ? this.vlDetails['vim-network-name'] : '';
        result.type = this.vlDetails.type;
        result.id = this.vlDetails.id;
      }
    });
    this.putType = 'vlUpdate';
    this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
  }
  /** Add the new Data @public */
  public addData(apiURL: string, identifier: string, data: NSDDetails, putType: string): void {
    this.isLoadingResults = true;
    let successMessage: string = '';
    if (putType === 'nsdadd') {
      successMessage = 'PAGE.NSPACKAGE.NSCOMPOSE.ADDNSD';
    } else if (putType === 'vnfdadd') {
      successMessage = 'PAGE.NSPACKAGE.NSCOMPOSE.ADDVNFD';
    } else if (putType === 'cpAdded') {
      successMessage = 'PAGE.NSPACKAGE.NSCOMPOSE.ADDNS';
    } else if (putType === 'nsdUpdate') {
      successMessage = 'PAGE.NSPACKAGE.NSCOMPOSE.UPDATEDSUCCESSFULLY';
    } else if (putType === 'vlUpdate') {
      successMessage = 'PAGE.NSPACKAGE.NSCOMPOSE.UPDATEDSUCCESSFULLY';
    } else if (putType === 'nsddelete') {
      successMessage = 'PAGE.NSPACKAGE.NSCOMPOSE.DELETENSD';
    } else if (putType === 'vnfddelete') {
      successMessage = 'PAGE.NSPACKAGE.NSCOMPOSE.DELETEVNFD';
    } else if (putType === 'nsdelete') {
      successMessage = 'PAGE.NSPACKAGE.NSCOMPOSE.DELETENS';
    } else if (putType === 'linkdelete') {
      successMessage = 'PAGE.NSPACKAGE.NSCOMPOSE.DELETELINK';
    }
    /** Below hide for conflicts with light weight UI */
    const apiURLHeader: APIURLHEADER = {
      url: apiURL + '/' + identifier + '/nsd_content',
      httpOptions: { headers: this.headers }
    };
    const nsData: {} = {};
    nsData['nsd:nsd-catalog'] = {};
    nsData['nsd:nsd-catalog'].nsd = [];
    nsData['nsd:nsd-catalog'].nsd.push(data);
    const descriptorInfo: string = jsyaml.dump(nsData, {sortKeys: true});
    this.sharedService.targzFile({ packageType: 'nsd', id: this.identifier, descriptor: descriptorInfo })
      .then((content: ArrayBuffer): void => {
        this.restService.putResource(apiURLHeader, content).subscribe((res: {}) => {
          this.generateData();
          this.notifierService.notify('success', this.translateService.instant(successMessage));
          this.isLoadingResults = false;
        }, (error: ERRORDATA) => {
          this.generateData();
          this.restService.handleError(error, 'put');
          this.isLoadingResults = false;
        });
      }).catch((): void => {
        this.notifierService.notify('error', this.translateService.instant('ERROR'));
        this.isLoadingResults = false;
      });
  }
  /** Show Info @public */
  public showInfo(): void {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationTopologyComponent, { backdrop: 'static' });
    modalRef.componentInstance.topologyType = 'Info';
    modalRef.componentInstance.topologytitle = this.translateService.instant('PAGE.TOPOLOGY.INFO');
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        // empty
      }
    }).catch();
  }
  /** Event to freeze the animation @public */
  public onFreeze(): void {
    this.classApplied = !this.classApplied;
    const alreadyFixedIsActive: boolean = d3.select('svg#graphContainer').classed(this.fixedClass);
    d3.select('svg#graphContainer').classed(this.fixedClass, !alreadyFixedIsActive);
    if (alreadyFixedIsActive) {
      this.force.stop();
    }
    this.forceSimulationActive = alreadyFixedIsActive;
    this.nodes.forEach((d: COMPOSERNODES) => {
      d.fx = (alreadyFixedIsActive) ? null : d.x;
      d.fy = (alreadyFixedIsActive) ? null : d.y;
    });
    if (alreadyFixedIsActive) {
      this.force.restart();
    }
  }
  /** Events handles when dragended @public */
  public toggleSidebar(): void {
    this.sideBarOpened = !this.sideBarOpened;
    this.deselectAllNodes();
    this.showRightSideInfo(true, false, false, false);
  }
  /** Prepare information for node creation of VNFD @private */
  private generateData(): void {
    this.generateVNFData();
    this.generateDataNSDTopology();
    this.sideBarOpened = false;
  }
  /** Prepare the information of the VNFD @private */
  private generateVNFData(): void {
    this.restService.getResource(environment.VNFPACKAGESCONTENT_URL).subscribe((vnfdPackageData: VNFDDetails[]) => {
      this.vnfList = vnfdPackageData;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
    });
  }
  /** Prepare information for node creation of NSD Topology @private */
  private generateDataNSDTopology(): void {
    this.nodes = [];
    this.links = [];
    this.iConnectionPointRef = 0;
    this.jConnectionPointRef = 0;
    this.restService.getResource(environment.NSDESCRIPTORSCONTENT_URL + '/' + this.identifier).subscribe((nsData: NSDDetails) => {
      delete nsData._admin;
      delete nsData._id;
      this.nsData = nsData;
      this.vnfdPackageDetails.shortName = nsData['short-name'];
      this.vnfdPackageDetails.vendor = nsData.vendor;
      this.vnfdPackageDetails.description = nsData.description;
      this.vnfdPackageDetails.version = nsData.version;
      this.vnfdPackageDetails.id = nsData.id;
      this.vnfdPackageDetails.name = nsData.name;
      if (nsData.vld !== undefined) {
        /** Details of the VL */
        this.nsDataVLD(nsData);
      }
      if (nsData['constituent-vnfd'] !== undefined) {
        /** Details of the VNFD */
        this.nsDataConstituentVNFD(nsData);
      }
      if (nsData.vld !== undefined) {
        this.nsDataVLDLinkCreation(nsData);
      }
      this.separateAndCreatenode();
    }, (error: ERRORDATA) => {
      if (error.error.status === HttpStatus.NOT_FOUND || error.error.status === HttpStatus.UNAUTHORIZED) {
        this.router.navigateByUrl('404', { skipLocationChange: true }).catch();
      } else {
        this.restService.handleError(error, 'get');
      }
      this.isLoadingResults = false;
      this.isShowNSDDetails = false;
    });
  }
  /** nsData-vld undefined Call this function @private */
  private nsDataVLD(nsData: NSDDetails): void {
    nsData.vld.forEach((res: VLD) => {
      this.nodes.push({ id: res.id, reflexive: false, type: 'vld', name: res.id, selectorId: res.id });
      this.nsd = res.id;
      if (res['vnfd-connection-point-ref'] !== undefined) {
        res['vnfd-connection-point-ref'].forEach((result: VNFDCONNECTIONPOINTREF) => {
          this.nodes.push(
            {
              id: this.nsd + ++this.iConnectionPointRef + ':' + result['vnfd-connection-point-ref'],
              reflexive: false,
              type: 'ns',
              name: result['vnfd-connection-point-ref'],
              nodeIndex: result['member-vnf-index-ref'],
              selectorId: result['vnfd-connection-point-ref'] + '_' + result['member-vnf-index-ref'] + '-osm-' + this.nsd
            });
        });
      }
    });
  }
  /** nsData constituent-vnfd undefined Call this function @private */
  private nsDataConstituentVNFD(nsData: NSDDetails): void {
    nsData['constituent-vnfd'].forEach((res: CONSTITUENTVNFD) => {
      this.nodes.push(
        {
          id: res['vnfd-id-ref'] + ':' + res['member-vnf-index'],
          reflexive: false,
          type: 'vnfd',
          name: res['vnfd-id-ref'],
          nodeIndex: res['member-vnf-index'],
          selectorId: res['vnfd-id-ref'] + '_' + res['member-vnf-index']
        });
      this.vnfd = res['vnfd-id-ref'];
      this.memberVnfIndexValue = res['member-vnf-index'];
    });
  }

  /** nsData-vld undefined Call this function @private */
  private nsDataVLDLinkCreation(nsData: NSDDetails): void {
    nsData.vld.forEach((res: VLD) => {
      this.nsdCopy = res.id;
      if (res['vnfd-connection-point-ref'] !== undefined) {
        this.nsDataVNFDConnectionPointRefrence(res);
      }
    });
  }
  /** nsData-vnfd-connection-point-ref undefined Call this function @private */
  private nsDataVNFDConnectionPointRefrence(res: VLD): void {
    res['vnfd-connection-point-ref'].forEach((result: VNFDCONNECTIONPOINTREF) => {
      this.connectionPoint = this.nsdCopy + ++this.jConnectionPointRef + ':' + result['vnfd-connection-point-ref'];
      this.vnfdCopy = result['vnfd-id-ref'] + ':' + result['member-vnf-index-ref'];
      const connectionPointPos: number = this.nodes.map((e: COMPOSERNODES) => { return e.id; }).indexOf(this.connectionPoint);
      const nsdPos: number = this.nodes.map((e: COMPOSERNODES) => { return e.id; }).indexOf(this.nsdCopy);
      const vnfdPos: number = this.nodes.map((e: COMPOSERNODES) => { return e.id; }).indexOf(this.vnfdCopy);
      this.links.push(
        {
          source: this.nodes[connectionPointPos],
          target: this.nodes[nsdPos]
        },
        {
          source: this.nodes[connectionPointPos],
          target: this.nodes[vnfdPos]
        });
    });
  }
  /** Generate random string @private  */
  private randomString(length: number, chars: string): string {
    let result: string = '';
    for (let randomStringRef: number = length; randomStringRef > 0; --randomStringRef) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
  /** Separate and create node @private */
  private separateAndCreatenode(): void {
    this.seprateNodes(this.nodes);
    this.createnode(this.nodes);
    this.isLoadingResults = false;
  }
  /** Get the default Configuration of containers @private */
  private getGraphContainerAttr(): GRAPHDETAILS {
    return {
      width: 700,
      height: 400,
      nodeHeight: 50,
      nodeWidth: 35,
      textX: -35,
      textY: 30,
      radius: 5,
      distance: 50,
      strength: -500,
      forcex: 2,
      forcey: 2,
      sourcePaddingYes: 17,
      sourcePaddingNo: 12,
      targetPaddingYes: 4,
      targetPaddingNo: 3,
      alphaTarget: 0.3,
      imageX: -25,
      imageY: -25,
      shiftKeyCode: 17
    };
  }
  /** Separate the nodes along with its tyep @private */
  private seprateNodes(node: COMPOSERNODES[]): void {
    this.vlNodes = []; this.vnfNodes = []; this.cpNodes = [];
    node.forEach((nodeList: COMPOSERNODES) => {
      if (nodeList.type === 'vld') {
        this.vlNodes.push(nodeList);
      } else if (nodeList.type === 'vnfd') {
        this.vnfNodes.push(nodeList);
      } else if (nodeList.type === 'ns') {
        this.cpNodes.push(nodeList);
      }
    });
  }
  /** Node is created and render at D3 region @private */
  private createnode(node: COMPOSERNODES[]): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    d3.selectAll('svg#graphContainer > *').remove();
    d3.select(window).on('keydown', () => { this.keyDown(); });
    d3.select(window).on('keyup', () => { this.keyUp(); });
    this.svg = d3.select('#graphContainer')
      .attr('oncontextmenu', 'return false;')
      .attr('width', graphContainerAttr.width)
      .attr('height', graphContainerAttr.height)
      .on('mousemove', () => { this.mousemove(); });
    this.force = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(graphContainerAttr.strength))
      .force('link', d3.forceLink().id((d: TickPath) => d.id).distance(graphContainerAttr.distance))
      .force('center', d3.forceCenter(graphContainerAttr.width / graphContainerAttr.forcex,
        graphContainerAttr.height / graphContainerAttr.forcey))
      .force('x', d3.forceX(graphContainerAttr.width / graphContainerAttr.forcex))
      .force('y', d3.forceY(graphContainerAttr.height / graphContainerAttr.forcey))
      .on('tick', () => { this.tick(); });
    this.dragLine = this.svg.append('svg:path').attr('class', 'link dragline hidden').attr('d', 'M0,0L0,0');
    this.path = this.svg.append('svg:g').selectAll('path');
    this.vlNode = this.svg.append('svg:g').selectAll('vlnode');
    this.vnfdnode = this.svg.append('svg:g').selectAll('vnfdnode');
    this.cpnode = this.svg.append('svg:g').selectAll('cpnode');
    // app starts here
    this.restart(node);
  }
  /** update force layout (called automatically each iteration) @private */
  private tick(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    // draw directed edges with proper padding from node centers
    this.path.attr('class', 'link').attr('d', (d: Tick) => {
      const deltaX: number = d.target.x - d.source.x;
      const deltaY: number = d.target.y - d.source.y;
      const dist: number = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normX: number = deltaX / dist;
      const normY: number = deltaY / dist;
      const sourcePadding: number = d.left ? graphContainerAttr.sourcePaddingYes : graphContainerAttr.sourcePaddingNo;
      const targetPadding: number = d.right ? graphContainerAttr.targetPaddingYes : graphContainerAttr.targetPaddingNo;
      const sourceX: number = d.source.x + (sourcePadding * normX);
      const sourceY: number = d.source.y + (sourcePadding * normY);
      const targetX: number = d.target.x - (targetPadding * normX);
      const targetY: number = d.target.y - (targetPadding * normY);
      return `M${sourceX},${sourceY}L${targetX},${targetY}`;
    }).on('dblclick', (d: Tick) => { this.getDeleteLinkConfirmation(d); });
    this.vlNode.attr('transform', (t: TickPath) => `translate(${t.x},${t.y})`);
    this.vnfdnode.attr('transform', (t: TickPath) => `translate(${t.x},${t.y})`);
    this.cpnode.attr('transform', (t: TickPath) => `translate(${t.x},${t.y})`);
  }
  /** Update graph (called when needed) at D3 region @private */
  private restart(node: COMPOSERNODES[]): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.path = this.path.data(this.links);
    this.vlNode = this.vlNode.data(this.vlNodes, (d: COMPOSERNODES) => d.id);
    this.vnfdnode = this.vnfdnode.data(this.vnfNodes, (d: COMPOSERNODES) => d.id);
    this.cpnode = this.cpnode.data(this.cpNodes, (d: COMPOSERNODES) => d.id);
    this.resetAndCreateNodes();
    this.force.nodes(node).force('link').links(this.links);
    this.force.alphaTarget(graphContainerAttr.alphaTarget).restart();
  }
  /** Rest and create nodes @private */
  private resetAndCreateNodes(): void {
    this.path.exit().remove();
    this.vlNode.exit().remove();
    this.vnfdnode.exit().remove();
    this.cpnode.exit().remove();
    this.getPathNodes();
    this.getVLNodes();
    this.getVNFDNodes();
    this.getCPNodes();
    this.path.merge(this.path);
    this.vlNode = this.gvlNode.merge(this.vlNode);
    this.vnfdnode = this.gvnfdNode.merge(this.vnfdnode);
    this.cpnode = this.gcpNode.merge(this.cpnode);
  }
  /** setting the Path @private */
  private getPathNodes(): void {
    this.path = this.path.enter().append('svg:path');
  }
  /** Setting all the VL nodes @private */
  private getVLNodes(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.gvlNode = this.vlNode.enter().append('svg:g');
    this.gvlNode.append('svg:circle').attr('r', graphContainerAttr.radius).style('fill', '#eeeeee');
    this.gvlNode.append('svg:image')
      .style('opacity', 1)
      .attr('x', graphContainerAttr.imageX)
      .attr('y', graphContainerAttr.imageY)
      .attr('id', (d: COMPOSERNODES) => { return d.selectorId; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/VL.svg')
      .on('mousedown', (d: COMPOSERNODES) => { this.mouseDown(d); })
      .on('mouseup', (d: COMPOSERNODES) => { this.mouseUp(d); })
      .on('click', (d: COMPOSERNODES) => { this.singleClick(this.vlNode, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: COMPOSERNODES) => { this.getDeleteConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gvlNode.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES) => d.id);
  }
  /** Setting all the VNFD nodes @private */
  private getVNFDNodes(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.gvnfdNode = this.vnfdnode.enter().append('svg:g');
    this.gvnfdNode.append('svg:circle').attr('r', graphContainerAttr.radius).style('fill', '#eeeeee');
    this.gvnfdNode.append('svg:image')
      .style('opacity', 1)
      .attr('x', graphContainerAttr.imageX)
      .attr('y', graphContainerAttr.imageY)
      .attr('id', (d: COMPOSERNODES) => { return d.selectorId; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/VNFD.svg')
      .on('mousedown', (d: COMPOSERNODES) => { this.mouseDown(d); })
      .on('mouseup', (d: COMPOSERNODES) => { this.mouseUp(d); })
      .on('click', (d: COMPOSERNODES) => { this.singleClick(this.vnfdnode, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: COMPOSERNODES) => { this.getDeleteConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gvnfdNode.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES) => d.id);
  }
  /** Setting all the CP nodes @private */
  private getCPNodes(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.gcpNode = this.cpnode.enter().append('svg:g');
    this.gcpNode.append('svg:circle').attr('r', graphContainerAttr.radius).style('fill', '#eeeeee');
    this.gcpNode.append('svg:image')
      .style('opacity', 1)
      .attr('x', graphContainerAttr.imageX)
      .attr('y', graphContainerAttr.imageY)
      .attr('id', (d: COMPOSERNODES) => { return d.selectorId; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/CP.svg')
      .on('mousedown', (d: COMPOSERNODES) => { this.mouseDown(d); })
      .on('mouseup', (d: COMPOSERNODES) => { this.mouseUp(d); })
      .on('click', (d: COMPOSERNODES) => { this.singleClick(this.cpnode, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: COMPOSERNODES) => { this.getDeleteConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gcpNode.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES) => d.id);
  }
  /** Events handles when mousemove it will capture the selected node data @private */
  private mousemove(): void {
    if (!this.mousedownNode) { return; }
    this.dragLine.attr('d',
      `M${this.mousedownNode.x},${this.mousedownNode.y}L${d3.mouse(d3.event.currentTarget)[0]},${d3.mouse(d3.event.currentTarget)[1]}`);
  }
  /** Get confirmation Before Deleting the Link in Topology @private */
  private getAddConfirmation(mouseData: COMPOSERNODES, getNsData: NSDDetails, addType: string, getVLDIndex: number): void {
    let findVNFName: string = '';
    let findVLDID: string = '';
    if (mouseData.type === 'vld') {
      findVNFName = this.mouseupNode.name;
      findVLDID = this.mousedownNode.id;
    } else {
      findVNFName = this.mousedownNode.name;
      findVLDID = this.mouseupNode.id;
    }
    getNsData.vld.forEach((result: VLD) => {
      if (result.id === findVLDID) {
        this.vlName = result.name;
        this.getVNFSelectedData = this.vnfList.filter((vnfList: VNFDDetails) => vnfList.id === findVNFName);
        this.setVnfdConnectionPointRef = this.getVNFSelectedData[0]['mgmt-interface'].cp;
        this.setVnfdName = this.getVNFSelectedData[0].name;
        this.selectedVLDResult = result;
      }
    });
    if (this.vlName !== undefined && this.setVnfdName !== undefined && this.setVnfdConnectionPointRef !== undefined) {
      const modalRef: NgbModalRef = this.modalService.open(ConfirmationTopologyComponent, { backdrop: 'static' });
      modalRef.componentInstance.topologyType = 'Add';
      modalRef.componentInstance.cpDetails = this.getVNFSelectedData[0]['connection-point'];
      this.translateService.get('PAGE.TOPOLOGY.ADDINGCP', {
        vlname: '<b>' + this.vlName + '</b>',
        vnfdname: '<b>' + this.setVnfdName + '</b>',
        cpname: '<b>' + this.setVnfdConnectionPointRef + '</b>'
      }).subscribe((res: string) => {
        modalRef.componentInstance.topologyname = res;
      });
      modalRef.componentInstance.topologytitle = this.translateService.instant('PAGE.TOPOLOGY.CONNECTIONPOINT');
      modalRef.result.then((result: MODALCLOSERESPONSEWITHCP) => {
        if (result) {
          this.nsData = getNsData;
          this.generateCPForVNF(this.selectedVLDResult, result.connection_point, getVLDIndex);
          this.addData(environment.NSDESCRIPTORS_URL, this.identifier, getNsData, addType);
        } else {
          this.deselectPath();
        }
      }).catch();
    } else {
      this.deselectPath();
      this.notifierService.notify('error', this.translateService.instant('ERROR'));
    }
  }

  /** Generate connection point for vnf using vld @private */
  private generateCPForVNF(result: VLD, cp: string, getVLDIndex: number): void {
    if (result['vnfd-connection-point-ref'] !== undefined) {
      result['vnfd-connection-point-ref'].push({
        'member-vnf-index-ref': getVLDIndex,
        'vnfd-connection-point-ref': cp,
        'vnfd-id-ref': this.getVNFSelectedData[0].name
      });
    } else {
      Object.assign(result, {
        'vnfd-connection-point-ref': [{
          'member-vnf-index-ref': getVLDIndex,
          'vnfd-connection-point-ref': cp,
          'vnfd-id-ref': this.getVNFSelectedData[0].name
        }]
      });
    }
  }

  /** Events handles when mousedown click it will capture the selected node data @private */
  private mouseDown(d: COMPOSERNODES): void {
    event.preventDefault();
    if (d3.event.ctrlKey) { return; }
    if (d3.event.shiftKey) {
      if (d.type === 'vnfd') {
        this.selectedNode.push(d);
      }
      this.mousedownNode = d;
      this.currentSelectedNode = (this.mousedownNode === this.currentSelectedNode) ? null : this.mousedownNode;
      this.currentSelectedLink = null;
      this.dragLine.style('marker-end', 'url(#end-arrow)').classed('hidden', false)
        .attr('d', `M${this.mousedownNode.x},${this.mousedownNode.y}L${this.mousedownNode.x},${this.mousedownNode.y}`);
    }
  }
  /** Event handles when mouseup event occures @private */
  private mouseUp(d: COMPOSERNODES): void {
    if (!this.mousedownNode) { return; }
    this.dragLine.classed('hidden', true).style('marker-end', '');
    this.mouseupNode = d;
    if (this.mousedownNode.type === 'vld' && this.mouseupNode.type === 'vnfd') {
      const getOldVLDIndex: string[] = this.mouseupNode.id.split(':');
      const setOldVLDindex: number = +getOldVLDIndex[1];
      this.putType = 'cpAdded';
      this.getAddConfirmation(this.mousedownNode, this.nsData, this.putType, setOldVLDindex);
    } else if (this.mousedownNode.type === 'vnfd' && this.mouseupNode.type === 'vld') {
      const getOldVLDIndex: string[] = this.mousedownNode.id.split(':');
      const setOldVLDindex: number = +getOldVLDIndex[1];
      this.putType = 'cpAdded';
      this.getAddConfirmation(this.mousedownNode, this.nsData, this.putType, setOldVLDindex);
    } else if (this.mousedownNode.type === 'vnfd' && this.mouseupNode.type === 'ns') {
      this.deselectPath();
      this.notifierService.notify('warning', this.translateService.instant('PAGE.NSPACKAGE.NSCOMPOSE.CANNOTLINKVNFCP'));
    } else if (this.mousedownNode.type === 'vld' && this.mouseupNode.type === 'ns') {
      this.deselectPath();
      this.notifierService.notify('warning', this.translateService.instant('PAGE.NSPACKAGE.NSCOMPOSE.CANNOTLINKVNFCP'));
    } else if (this.mousedownNode.type === 'vld' && this.mouseupNode.type === 'vld') {
      this.deselectPath();
      this.notifierService.notify('warning', this.translateService.instant('PAGE.NSPACKAGE.NSCOMPOSE.CANNOTLINKVL'));
    } else if (this.mousedownNode.type === 'vnfd' && this.mouseupNode.type === 'vnfd') {
      this.deselectPath();
      this.notifierService.notify('warning', this.translateService.instant('PAGE.NSPACKAGE.NSCOMPOSE.CANNOTLINKVNF'));
    } else if (this.mousedownNode.type === 'ns' && this.mouseupNode.type === 'ns') {
      this.deselectPath();
      this.notifierService.notify('warning', this.translateService.instant('PAGE.NSPACKAGE.NSCOMPOSE.CANNOTLINKCP'));
    } else {
      this.deselectPath();
      this.notifierService.notify('warning', this.translateService.instant('PAGE.NSPACKAGE.NSCOMPOSE.CANNOTLINKVLVNF'));
    }
    this.resetMouseVars();
    // select new link
    this.currentSelectedLink = d;
    this.currentSelectedNode = null;
  }
  /** Mosue Drag Line false if it is not satisfied @private */
  private deselectPath(): void {
    this.dragLine.classed('hidden', true).style('marker-end', '').attr('d', 'M0,0L0,0');
  }
  /** reset Mouse varaibles @private */
  private resetMouseVars(): void {
    this.mousedownNode = null;
    this.mouseupNode = null;
    this.mousedownLink = null;
  }
  /** De-select all the selected nodes @private */
  private deselectAllNodes(): void {
    this.vlNode.select('image').classed(this.activeClass, false);
    this.vnfdnode.select('image').classed(this.activeClass, false);
    this.cpnode.select('image').classed(this.activeClass, false);
  }
  /** Show the right-side information @private */
  private showRightSideInfo(nsdDetails: boolean, vldDetails: boolean, vnfDeails: boolean, cpDetails: boolean): void {
    this.isShowNSDDetails = nsdDetails;
    this.isShowVLDetails = vldDetails;
    this.isShowVNFDetails = vnfDeails;
    this.isShowCPDetails = cpDetails;
  }
  /** Events handles when Shift Click to perform create cp @private */
  // tslint:disable-next-line: no-any
  private singleClick(nodeSelected: any, d: COMPOSERNODES): void {
    this.selectNodeExclusive(nodeSelected, d);
  }
  /** Selected nodes @private */
  // tslint:disable-next-line: no-any
  private selectNodeExclusive(nodeSeleced: any, d: COMPOSERNODES): void {
    const alreadyIsActive: boolean = nodeSeleced.select('#' + d.selectorId).classed(this.activeClass);
    this.deselectAllNodes();
    nodeSeleced.select('#' + d.selectorId).classed(this.activeClass, !alreadyIsActive);
    if (d.type === 'vld' && !alreadyIsActive) {
      this.nsData.vld.forEach((result: VLD) => {
        if (result.id === d.id) {
          this.showRightSideInfo(false, true, false, false);
          this.vlDetails = result;
        }
      });
    } else if (d.type === 'vnfd' && !alreadyIsActive) {
      this.nsData['constituent-vnfd'].forEach((result: CONSTITUENTVNFD) => {
        if (result['member-vnf-index'] === d.nodeIndex && result['vnfd-id-ref'] === d.name) {
          this.showRightSideInfo(false, false, true, false);
          this.vnfData = result;
        }
      });
    } else if (d.type === 'ns' && !alreadyIsActive) {
      this.nsData.vld.forEach((result: VLD) => {
        if (result['vnfd-connection-point-ref'] !== undefined) {
          result['vnfd-connection-point-ref'].forEach((resultCP: VNFDCONNECTIONPOINTREF) => {
            if (resultCP['member-vnf-index-ref'] === d.nodeIndex && resultCP['vnfd-connection-point-ref'] === d.name) {
              this.cpData = resultCP;
              this.vlDetails = result;
              this.showRightSideInfo(false, false, false, true);
            }
          });
        }
      });
    } else {
      this.showRightSideInfo(true, false, false, false);
    }
  }
  /** Get confirmation Before Deleting the Link in Topology @private */
  private getDeleteLinkConfirmation(d: Tick): void {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationTopologyComponent, { backdrop: 'static' });
    modalRef.componentInstance.topologyType = 'Delete';
    modalRef.componentInstance.topologyname = this.translateService.instant('PAGE.TOPOLOGY.LINK');
    modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.LINK';
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.doubleClickLink(d);
      }
    }).catch();
  }
  /** Events handles when Double Click to Delete the link @private */
  private doubleClickLink(d: Tick): void {
    let getID: string = '';
    if (d.target.type === 'vld') {
      getID = d.target.id;
    } else if (d.source.type === 'vld') {
      getID = d.source.id;
    }
    this.nodes.forEach((res: COMPOSERNODES) => {
      if (res.id === getID) {
        if (this.nsData.vld !== undefined) {
          this.nsData.vld.forEach((vldresult: VLD) => {
            if (vldresult.id === getID) {
              delete vldresult['vnfd-connection-point-ref'];
            }
          });
        }
      }
    });
    this.putType = 'linkdelete';
    this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
  }
  /** Get confirmation Before Deleting the Node in Topology @private */
  private getDeleteConfirmation(d: COMPOSERNODES): void {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationTopologyComponent, { backdrop: 'static' });
    modalRef.componentInstance.topologyType = 'Delete';
    modalRef.componentInstance.topologyname = d.name;
    if (d.type === 'vld') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.VIRTUALLINK';
    } else if (d.type === 'vnfd') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.VNF';
    } else if (d.type === 'ns') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.CONNECTIONPOINT';
    }
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.doubleClick(d);
      }
    }).catch();
  }
  /** Events handles when Double Click to Delete @private */
  private doubleClick(d: COMPOSERNODES): void {
    const deletedNode: COMPOSERNODES = d;
    this.nodes.forEach((res: COMPOSERNODES) => {
      if (res.id === d.id) {
        if (deletedNode.type === 'vld') {
          const pos: number = this.nsData.vld.map((e: VLD) => { return e.id; }).indexOf(d.id);
          this.nsData.vld.splice(pos, 1);
          this.putType = 'nsddelete';
        } else if (deletedNode.type === 'vnfd') {
          const constituentVNFD: string[] = [];
          if (this.nsData['constituent-vnfd'] !== undefined) {
            this.nsData['constituent-vnfd'].forEach((ref: CONSTITUENTVNFD) => {
              constituentVNFD.push(ref['vnfd-id-ref'] + ':' + ref['member-vnf-index']);
            });
          }
          const pos: number = constituentVNFD.map((e: string) => { return e; }).indexOf(d.id);
          this.nsData['constituent-vnfd'].splice(pos, 1);
          const getCP: string[] = d.id.split(':');
          const memberVnfIndexRef: number = +getCP[1];
          const vnfdIDRef: string = getCP[0];
          if (this.nsData.vld !== undefined) {
            this.nsData.vld.forEach((resf: VLD) => {
              if (resf['vnfd-connection-point-ref'] !== undefined) {
                resf['vnfd-connection-point-ref'].forEach((connectionPoint: VNFDCONNECTIONPOINTREF, index: number) => {
                  if (+connectionPoint['member-vnf-index-ref'] === memberVnfIndexRef && connectionPoint['vnfd-id-ref'] === vnfdIDRef) {
                    resf['vnfd-connection-point-ref'].splice(index, 1);
                  }
                });
              }
            });
          }
          this.putType = 'vnfddelete';
        } else if (deletedNode.type === 'ns') {
          const getCP: string[] = d.selectorId.split('-osm-');
          const memberVnfIndexRef: number = d.nodeIndex;
          const vnfdIDRef: string = getCP[getCP.length - 1];
          if (this.nsData.vld !== undefined) {
            this.nsData.vld.forEach((resf: VLD) => {
              if (resf['vnfd-connection-point-ref'] !== undefined && resf.id === vnfdIDRef) {
                resf['vnfd-connection-point-ref'].forEach((connectionPoint: VNFDCONNECTIONPOINTREF, index: number) => {
                  if (connectionPoint['member-vnf-index-ref'] === memberVnfIndexRef) {
                    resf['vnfd-connection-point-ref'].splice(index, 1);
                  }
                });
              }
            });
          }
          this.putType = 'nsdelete';
        }
        this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
      }
    });
  }
  /** Key press event @private */
  private keyDown(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    if (this.lastKeyDown !== -1) { return; }
    this.lastKeyDown = d3.event.keyCode;
    if (d3.event.keyCode === graphContainerAttr.shiftKeyCode) {
      this.gvlNode.call(d3.drag()
        .on('start', this.dragstarted).on('drag', this.dragged).on('end', this.dragended)
      );
      this.gvnfdNode.call(d3.drag()
        .on('start', this.dragstarted).on('drag', this.dragged).on('end', this.dragended)
      );
      this.gcpNode.call(d3.drag()
        .on('start', this.dragstarted).on('drag', this.dragged).on('end', this.dragended)
      );
      this.svg.classed('ctrl', true);
    }
  }
  /** Key realse event @private */
  private keyUp(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.lastKeyDown = -1;
    if (d3.event.keyCode === graphContainerAttr.shiftKeyCode) {
      this.gvlNode.on('.drag', null);
      this.gvnfdNode.on('.drag', null);
      this.gcpNode.on('.drag', null);
      this.svg.classed('ctrl', false);
    }
  }
  /** Events handles when dragstarted @private */
  private dragstarted(d: COMPOSERNODES): void {
    d.fx = d.x;
    d.fy = d.y;
  }
  /** Events handles when dragged @private */
  private dragged(d: COMPOSERNODES): void {
    d.fx = d.x = d3.event.x;
    d.fy = d.y = d3.event.y;
  }
  /** Events handles when dragended @private */
  private dragended(d: COMPOSERNODES): void {
    if (this.forceSimulationActive) {
      d.fx = null;
      d.fy = null;
    } else {
      d.fx = d.x;
      d.fy = d.y;
      this.forceSimulationActive = false;
    }
  }
  /** Events handles when node double click   @private */
  private onNodedblClickToggleSidebar(): void {
    this.sideBarOpened = false;
  }
  /** Events handles when node single click   @private */
  private onNodeClickToggleSidebar(): void {
    this.sideBarOpened = true;
  }
}
