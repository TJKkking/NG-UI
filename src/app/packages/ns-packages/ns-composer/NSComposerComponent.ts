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
import { isNullOrUndefined } from 'util';
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
import {
  CCI,
  COMPOSERNODES,
  DF,
  GRAPHDETAILS,
  NSData,
  NSDATACREATION,
  NSDDetails,
  Tick, TickPath, VLC, VLD, VNFPROFILE
} from 'NSDModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { VNFD, VNFData } from 'VNFDModel';

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
  public nsPackageDetails: NSData = { id: '', name: '', description: '', version: '', designer: '' };
  /** Contains VL Details @public */
  public virtualLinkDesc: VLD = {
    id: '',
    'mgmt-network': true
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
  public vnfData: VNFPROFILE;
  /** contains the Virtual Link connectivity Details @public */
  public virtualLinkProfileID: string;
  /** Need to show the VNF Details @public */
  public isShowVNFDetails: boolean = false;
  /** Contains the node information of CP @public */
  public cpNodes: {}[] = [];
  /** Need to show the CP Details */
  public cpData: CCI;
  /** Need to show the VNF Details @public */
  public isShowCPDetails: boolean = false;
  /** random number count @public */
  public randomNumberLength: number;
  /** Contains the vnfd information @public */
  public vnfList: VNFD[] = [];
  /** Add the activeclass for the selected @public */
  public activeClass: string = 'active';
  /** Add the fixed class for the freeze @public */
  public fixedClass: string = 'fixed';
  /** Check the loading results @public */
  public isLoadingResults: boolean = true;
  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';
  /** Get VNF selected node @public */
  public getVNFSelectedData: VNFD;
  /** Assign the forcesimulation active @public */
  public forceSimulationActive: boolean = false;
  /** Assign pinned class for the button when freezed @public */
  public classApplied: boolean = false;
  /** Contains sidebar open status @public */
  public sideBarOpened: boolean = false;
  /** Contains SVG attributes @private */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private svg: any;
  /** Contains the Drag line */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private dragLine: any;
  /** Contains VL node @private */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private vlNode: any;
  /** Contains VNFD node @private */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private vnfdnode: any;
  /** Contains CP node @private */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cpnode: any;
  /** Rendered nodes represent VL @private */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private gvlNode: any;
  /** Rendered nodes represent VL @private */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private gvnfdNode: any;
  /** Rendered nodes represent VL @private */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private gcpNode: any;
  /** Contains forced node animations @private */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private force: any;
  /** Contains all the selected node @private */
  private selectedNode: COMPOSERNODES[] = [];
  /** Contains the connected point @private */
  private connectionPoint: string;
  /** Contains id of the node @private */
  private identifier: string;
  /** Contains copy of NSD information @private */
  private nsdCopy: string;
  /** Contains the VNFD copy @private */
  private vnfdCopy: string;
  /** Contains path information of the node */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  /** Contains selected node VNF profile objects @private */
  private selectedVNFProfile: VNFPROFILE[];

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
  /** Lifecyle Hooks the trigger before component is instantiated @public */
  public ngOnInit(): void {
    this.identifier = this.activatedRoute.snapshot.paramMap.get('id');
    this.generateData();
    this.headers = new HttpHeaders({
      'Content-Type': 'application/gzip',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
  }
  /** Events handles at drag on D3 region @public */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  public drag(ev: any): void {
    if (ev.target.id === 'vl') {
      ev.dataTransfer.setData('text', ev.target.id);
    } else {
      ev.dataTransfer.setData('text', ev.target.attributes['data-id'].value);
    }
  }
  /** On clicking redirect to NS edit page @public */
  public onEdit(): void {
    this.router.navigate(['/packages/ns/edit/', this.identifier]).catch((): void => {
      // Catch Navigation Error
    });
  }
  /** Events handles drop at D3 region @public */
  public drop(ev: DragEvent): void {
    ev.preventDefault();
    const getDropedName: string = ev.dataTransfer.getData('text');
    if (getDropedName === 'vl') {
      this.svg.selectAll('*').remove();
      this.vldropComposer();
    } else {
      this.svg.selectAll('*').remove();
      const vnfdName: string = ev.dataTransfer.getData('text');
      this.vnfdropComposer(vnfdName);
    }
  }
  /** Drop VL Composer Data @public */
  public vldropComposer(): void {
    this.randomNumberLength = CONSTANTNUMBER.randomNumber;
    const generateId: string = 'ns_vl_' + this.sharedService.randomString();
    if (this.nsData['virtual-link-desc'] === undefined) {
      this.nsData['virtual-link-desc'] = [];
    }
    this.nsData['virtual-link-desc'].push({
      id: generateId,
      'mgmt-network': false
    });
    this.putType = 'nsdadd';
    this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
  }
  /** Drop VNFD Composer Data @public */
  public vnfdropComposer(vnfdName: string): void {
    const vnfID: string = 'ns_vnfd_' + this.sharedService.randomString();
    if (this.nsData.df.length > 0) {
      this.addVNFDID(vnfdName);
      this.nsData.df.forEach((res: DF): void => {
        if (res['vnf-profile'] === undefined) {
          res['vnf-profile'] = [];
        }
        res['vnf-profile'].push({
          id: vnfID,
          'virtual-link-connectivity': [],
          'vnfd-id': vnfdName
        });
      });
    } else {
      Object.assign(this.nsData.df, {
        id: 'default-df',
        'vnf-profile': [{
          id: vnfID,
          'virtual-link-connectivity': [],
          'vnfd-id': vnfdName
        }]
      });
    }
    this.putType = 'vnfdadd';
    this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
  }
  /** Add the VNFD-ID while drop VNFD if not exists @public */
  public addVNFDID(vnfdName: string): void {
    const vnfdIDArray: string[] = this.nsData['vnfd-id'];
    if (vnfdIDArray !== undefined) {
      if (vnfdIDArray.indexOf(vnfdName) === -1) {
        vnfdIDArray.push(vnfdName);
      }
    } else {
      Object.assign(this.nsData, {
        'vnfd-id': [vnfdName]
      });
    }
  }
  /** Events handles allow drop on D3 region @public */
  public allowDrop(ev: DragEvent): void {
    ev.preventDefault();
  }
  /** Save NSD Information @public */
  public saveNSD(): void {
    if (this.nsPackageDetails.id !== undefined) {
      this.nsData.id = this.nsPackageDetails.id;
    }
    if (this.nsPackageDetails.name !== undefined) {
      this.nsData.name = this.nsPackageDetails.name;
    }
    if (this.nsPackageDetails.description !== undefined) {
      this.nsData.description = this.nsPackageDetails.description;
    }
    if (this.nsPackageDetails.version !== undefined) {
      this.nsData.version = this.nsPackageDetails.version;
    }
    if (this.nsPackageDetails.designer !== undefined) {
      this.nsData.designer = this.nsPackageDetails.designer;
    }
    this.putType = 'nsdUpdate';
    this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
  }
  /** Save Virtual Link @public */
  public saveVL(vlid: string): void {
    this.nsData['virtual-link-desc'].forEach((result: VLD): void => {
      if (result.id === vlid) {
        result['mgmt-network'] = !isNullOrUndefined(this.virtualLinkDesc['mgmt-network']) ? this.virtualLinkDesc['mgmt-network'] : true;
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
    const nsData: NSDATACREATION = { nsd: { nsd: [] } };
    nsData.nsd.nsd = [];
    nsData.nsd.nsd.push(data);
    const descriptorInfo: string = jsyaml.dump(nsData, { sortKeys: true });
    this.sharedService.targzFile({ packageType: 'nsd', id: this.identifier, descriptor: descriptorInfo })
      .then((content: ArrayBuffer): void => {
        this.restService.putResource(apiURLHeader, content).subscribe((res: {}): void => {
          this.generateData();
          this.notifierService.notify('success', this.translateService.instant(successMessage));
          this.isLoadingResults = false;
        }, (error: ERRORDATA): void => {
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
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationTopologyComponent, { backdrop: 'static' });
    modalRef.componentInstance.topologyType = 'Info';
    modalRef.componentInstance.topologytitle = this.translateService.instant('PAGE.TOPOLOGY.INFO');
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        // empty
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
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
    this.nodes.forEach((d: COMPOSERNODES): void => {
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
    this.restService.getResource(environment.VNFPACKAGESCONTENT_URL).subscribe((vnfdPackageData: VNFD[]): void => {
      this.vnfList = vnfdPackageData;
    }, (error: ERRORDATA): void => {
      this.restService.handleError(error, 'get');
    });
  }
  /** Prepare information for node creation of NSD Topology @private */
  private generateDataNSDTopology(): void {
    this.nodes = [];
    this.links = [];
    this.restService.getResource(environment.NSDESCRIPTORSCONTENT_URL + '/' + this.identifier).subscribe((nsData: NSDDetails): void => {
      delete nsData._admin;
      delete nsData._id;
      delete nsData._links;
      this.nsData = nsData;
      this.generateNSInfo(nsData);
      if (nsData['virtual-link-desc'] !== undefined) {
        /** Details of the VL */
        this.nsDataVLD(nsData);
      }
      if (this.nsData.df.length > 0) {
        this.nsData.df.forEach((res: DF): void => {
          if (res['vnf-profile'] !== undefined) {
            /** Details of the VNFD */
            this.nsDataConstituentVNFD(nsData);
          }
        });
      }
      if (nsData.df.length > 0) {
        this.nsDataVLDLinkCreation(nsData);
      }
      this.separateAndCreatenode();
    }, (error: ERRORDATA): void => {
      if (error.error.status === HttpStatus.NOT_FOUND || error.error.status === HttpStatus.UNAUTHORIZED) {
        this.router.navigateByUrl('404', { skipLocationChange: true }).catch((): void => {
          // Catch Navigation Error
      });
      } else {
        this.restService.handleError(error, 'get');
      }
      this.isLoadingResults = false;
      this.isShowNSDDetails = false;
    });
  }
  /** Generate the NS Package Information */
  private generateNSInfo(nsData: NSDDetails): void {
    this.nsPackageDetails.id = nsData.id;
    this.nsPackageDetails.name = nsData.name;
    this.nsPackageDetails.description = nsData.description;
    this.nsPackageDetails.version = nsData.version;
    this.nsPackageDetails.designer = nsData.designer;
  }
  /** nsData VL node creation function @private */
  private nsDataVLD(nsData: NSDDetails): void {
    nsData['virtual-link-desc'].forEach((res: VLD): void => {
      this.nodes.push({ id: res.id, reflexive: false, type: 'vld', name: res.id, selectorId: res.id });
    });
  }
  /** nsData VNFD node creation function @private */
  private nsDataConstituentVNFD(nsData: NSDDetails): void {
    nsData.df.forEach((resDF: DF): void => {
      resDF['vnf-profile'].forEach((resVNF: VNFPROFILE): void => {
        this.nodes.push(
          {
            id: resVNF['vnfd-id'] + ':' + resVNF.id,
            reflexive: false,
            type: 'vnfd',
            name: resVNF['vnfd-id'],
            nodeIndex: resVNF.id,
            selectorId: resVNF['vnfd-id'] + '_' + resVNF.id
          });
        if (resVNF['virtual-link-connectivity'] !== undefined) {
          this.nsDataCP(resVNF, resVNF.id);
        }
      });
    });
  }
  /** nsData CP node creation function @private */
  private nsDataCP(resVNF: VNFPROFILE, vnfID: string): void {
    resVNF['virtual-link-connectivity'].forEach((resultVLC: VLC, index: number): void => {
      resultVLC['constituent-cpd-id'].forEach((resultCCI: CCI): void => {
        this.nodes.push(
          {
            id: vnfID + ':' + resultCCI['constituent-base-element-id'] + index + ':' + resultCCI['constituent-cpd-id'],
            reflexive: false,
            type: 'ns',
            name: resultCCI['constituent-cpd-id'],
            nodeIndex: resultCCI['constituent-base-element-id'],
            selectorId: 'osm-' + resultCCI['constituent-cpd-id'] + '-' + vnfID + resultCCI['constituent-base-element-id'] + index
          });
      });
    });
  }
  /** nsData Link node creation function @private */
  private nsDataVLDLinkCreation(nsData: NSDDetails): void {
    nsData.df.forEach((resDF: DF): void => {
      if (resDF['vnf-profile'] !== undefined) {
        resDF['vnf-profile'].forEach((resVNF: VNFPROFILE): void => {
          this.nsdCopy = resVNF['vnfd-id'] + ':' + resVNF.id;
          if (resVNF['virtual-link-connectivity'] !== undefined) {
            this.nsDataVNFDConnectionPointRefrence(resVNF);
          }
        });
      }
    });
  }
  /** nsDataVNFDConnectionPointRefrence undefined Call this function @private */
  private nsDataVNFDConnectionPointRefrence(resVNF: VNFPROFILE): void {
    resVNF['virtual-link-connectivity'].forEach((resultVLC: VLC, index: number): void => {
      resultVLC['constituent-cpd-id'].forEach((resultCCI: CCI): void => {
        this.vnfdCopy = resultVLC['virtual-link-profile-id'];
        this.connectionPoint = resVNF.id + ':' + resultCCI['constituent-base-element-id'] + index + ':' + resultCCI['constituent-cpd-id'];
        const connectionPointPos: number = this.nodes.map((e: COMPOSERNODES): string => e.id).indexOf(this.connectionPoint);
        const nsdPos: number = this.nodes.map((e: COMPOSERNODES): string => e.id).indexOf(this.nsdCopy);
        const vnfdPos: number = this.nodes.map((e: COMPOSERNODES): string => e.id).indexOf(this.vnfdCopy);
        this.links.push(
          {
            // eslint-disable-next-line security/detect-object-injection
            source: this.nodes[connectionPointPos],
            // eslint-disable-next-line security/detect-object-injection
            target: this.nodes[nsdPos]
          },
          {
            // eslint-disable-next-line security/detect-object-injection
            source: this.nodes[connectionPointPos],
            // eslint-disable-next-line security/detect-object-injection
            target: this.nodes[vnfdPos]
          });
      });
    });
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
    node.forEach((nodeList: COMPOSERNODES): void => {
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
    d3.select(window).on('keydown', (): void => { this.keyDown(); });
    d3.select(window).on('keyup', (): void => { this.keyUp(); });
    this.svg = d3.select('#graphContainer')
      .attr('oncontextmenu', 'return false;')
      .attr('viewBox', `0 0 ${graphContainerAttr.width} ${graphContainerAttr.height}`)
      .on('mousemove', (): void => { this.mousemove(); });
    this.force = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(graphContainerAttr.strength))
      .force('link', d3.forceLink().id((d: TickPath): string => d.id).distance(graphContainerAttr.distance))
      .force('center', d3.forceCenter(graphContainerAttr.width / graphContainerAttr.forcex,
        graphContainerAttr.height / graphContainerAttr.forcey))
      .force('x', d3.forceX(graphContainerAttr.width / graphContainerAttr.forcex))
      .force('y', d3.forceY(graphContainerAttr.height / graphContainerAttr.forcey))
      .on('tick', (): void => { this.tick(); });
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
    this.path.attr('class', 'link').attr('d', (d: Tick): string => {
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
    }).on('dblclick', (d: Tick): void => { this.getDeleteLinkConfirmation(d); });
    this.vlNode.attr('transform', (t: TickPath): string => `translate(${t.x},${t.y})`);
    this.vnfdnode.attr('transform', (t: TickPath): string => `translate(${t.x},${t.y})`);
    this.cpnode.attr('transform', (t: TickPath): string => `translate(${t.x},${t.y})`);
  }
  /** Update graph (called when needed) at D3 region @private */
  private restart(node: COMPOSERNODES[]): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.path = this.path.data(this.links);
    this.vlNode = this.vlNode.data(this.vlNodes, (d: COMPOSERNODES): string => d.id);
    this.vnfdnode = this.vnfdnode.data(this.vnfNodes, (d: COMPOSERNODES): string => d.id);
    this.cpnode = this.cpnode.data(this.cpNodes, (d: COMPOSERNODES): string => d.id);
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
      .call(this.onDragDrop())
      .attr('id', (d: COMPOSERNODES): string => d.selectorId)
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/VL.svg')
      .on('mousedown', (d: COMPOSERNODES): void => { this.mouseDown(d); })
      .on('mouseup', (d: COMPOSERNODES): void => { this.mouseUp(d); })
      .on('click', (d: COMPOSERNODES): void => { this.singleClick(this.vlNode, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: COMPOSERNODES): void => { this.getDeleteConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gvlNode.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES): string => d.id);
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
      .call(this.onDragDrop())
      .attr('id', (d: COMPOSERNODES): string => d.selectorId)
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/VNFD.svg')
      .on('mousedown', (d: COMPOSERNODES): void => { this.mouseDown(d); })
      .on('mouseup', (d: COMPOSERNODES): void => { this.mouseUp(d); })
      .on('click', (d: COMPOSERNODES): void => { this.singleClick(this.vnfdnode, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: COMPOSERNODES): void => { this.getDeleteConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gvnfdNode.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES): string => d.name);
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
      .call(this.onDragDrop())
      .attr('id', (d: COMPOSERNODES): string => d.selectorId)
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/CP.svg')
      .on('mousedown', (d: COMPOSERNODES): void => { this.mouseDown(d); })
      .on('mouseup', (d: COMPOSERNODES): void => { this.mouseUp(d); })
      .on('click', (d: COMPOSERNODES): void => { this.singleClick(this.cpnode, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: COMPOSERNODES): void => { this.getDeleteConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gcpNode.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES): string => d.name);
  }
  /** Events handles when mousemove it will capture the selected node data @private */
  private mousemove(): void {
    if (!this.mousedownNode) { return; }
    this.dragLine.attr('d',
      `M${this.mousedownNode.x},${this.mousedownNode.y}L${d3.mouse(d3.event.currentTarget)[0]},${d3.mouse(d3.event.currentTarget)[1]}`);
  }
  /** Get confirmation Before Deleting the Link in Topology @private */
  private getAddConfirmation(mouseData: COMPOSERNODES, getNsData: NSDDetails, addType: string, getVLDIndex: string): void {
    let findVNFName: string = '';
    let findVLDID: string = '';
    if (mouseData.type === 'vld') {
      findVNFName = this.mouseupNode.name;
      findVLDID = this.mousedownNode.id;
      this.vlName = this.mousedownNode.name;
    } else {
      findVNFName = this.mousedownNode.name;
      findVLDID = this.mouseupNode.id;
      this.vlName = this.mouseupNode.name;
    }
    if (getNsData['vnfd-id'] !== undefined) {
      getNsData['vnfd-id'].forEach((resVNFid: string): void => {
        if (resVNFid === findVNFName) {
          this.getVNFSelectedData = this.vnfList.filter((vnfList: VNFD): boolean => vnfList.id === findVNFName)[0];
          this.setVnfdConnectionPointRef = this.getVNFSelectedData['mgmt-cp'];
          this.setVnfdName = this.getVNFSelectedData['product-name'];
          this.selectedVNFProfile = getNsData.df[0]['vnf-profile'];
        }
      });
    }
    if (this.vlName !== undefined && this.setVnfdName !== undefined && this.setVnfdConnectionPointRef !== undefined) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const modalRef: NgbModalRef = this.modalService.open(ConfirmationTopologyComponent, { backdrop: 'static' });
      modalRef.componentInstance.topologyType = 'Add';
      modalRef.componentInstance.cpDetails = this.getVNFSelectedData['ext-cpd'];
      this.translateService.get('PAGE.TOPOLOGY.ADDINGCP', {
        vlname: '<b>' + this.vlName + '</b>',
        vnfdname: '<b>' + this.setVnfdName + '</b>',
        cpname: '<b>' + this.setVnfdConnectionPointRef + '</b>'
      }).subscribe((res: string): void => {
        modalRef.componentInstance.topologyname = res;
      });
      modalRef.componentInstance.topologytitle = this.translateService.instant('PAGE.TOPOLOGY.CONNECTIONPOINT');
      modalRef.result.then((result: MODALCLOSERESPONSEWITHCP): void => {
        if (result) {
          this.generateCPForVNF(this.selectedVNFProfile, result.connection_point, getVLDIndex);
          this.addData(environment.NSDESCRIPTORS_URL, this.identifier, getNsData, addType);
        } else {
          this.deselectPath();
        }
      }).catch((): void => {
        // Catch Navigation Error
    });
    } else {
      this.deselectPath();
      this.notifierService.notify('error', this.translateService.instant('ERROR'));
    }
  }
  /** Generate connection point for vnf using vld @private */
  private generateCPForVNF(result: VNFPROFILE[], cp: string, getVLDIndex: string): void {
    if (result !== undefined) {
      result.forEach((resultVNFPROFILE: VNFPROFILE, index: number): void => {
        if (getVLDIndex === resultVNFPROFILE.id) {
          resultVNFPROFILE['virtual-link-connectivity'].push({
            'constituent-cpd-id': [{
              'constituent-base-element-id': getVLDIndex,
              'constituent-cpd-id': cp
            }],
            'virtual-link-profile-id': this.vlName
          });
        }
      });
    } else {
      Object.assign(result, {
        'virtual-link-connectivity': [{
          'constituent-cpd-id': [{
            'constituent-base-element-id': getVLDIndex,
            'constituent-cpd-id': cp
          }],
          'virtual-link-profile-id': this.vlName
        }]
      });
    }
  }
  /** Events handles when mousedown click it will capture the selected node data @private */
  private mouseDown(d: COMPOSERNODES): void {
    // eslint-disable-next-line deprecation/deprecation
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
      const setOldVLDindex: string = getOldVLDIndex[1];
      this.putType = 'cpAdded';
      this.getAddConfirmation(this.mousedownNode, this.nsData, this.putType, setOldVLDindex);
    } else if (this.mousedownNode.type === 'vnfd' && this.mouseupNode.type === 'vld') {
      const getOldVLDIndex: string[] = this.mousedownNode.id.split(':');
      const setOldVLDindex: string = getOldVLDIndex[1];
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private singleClick(nodeSelected: any, d: COMPOSERNODES): void {
    this.selectNodeExclusive(nodeSelected, d);
  }
  /** Selected nodes @private */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private selectNodeExclusive(nodeSeleced: any, d: COMPOSERNODES): void {
    const alreadyIsActive: boolean = nodeSeleced.select('#' + d.selectorId).classed(this.activeClass);
    this.deselectAllNodes();
    nodeSeleced.select('#' + d.selectorId).classed(this.activeClass, !alreadyIsActive);
    if (d.type === 'vld' && !alreadyIsActive) {
      this.nsData['virtual-link-desc'].forEach((result: VLD): void => {
        if (result.id === d.id) {
          this.showRightSideInfo(false, true, false, false);
          this.virtualLinkDesc = result;
        }
      });
    } else if (d.type === 'vnfd' && !alreadyIsActive) {
      this.nsData.df.forEach((res: DF): void => {
        if (res['vnf-profile'] !== undefined) {
          res['vnf-profile'].forEach((resVNF: VNFPROFILE): void => {
            if (resVNF.id === d.nodeIndex && resVNF['vnfd-id'] === d.name) {
              this.showRightSideInfo(false, false, true, false);
              this.vnfData = resVNF;
            }
          });
        }
      });
    } else if (d.type === 'ns' && !alreadyIsActive) {
      this.nsData.df.forEach((resultDF: DF): void => {
        if (resultDF['vnf-profile'] !== undefined) {
          resultDF['vnf-profile'].forEach((resVNF: VNFPROFILE): void => {
            if (resVNF['virtual-link-connectivity'] !== undefined) {
              resVNF['virtual-link-connectivity'].forEach((resultVLC: VLC, index: number): void => {
                resultVLC['constituent-cpd-id'].forEach((resultCCI: CCI): void => {
                  const connectionPointID: string = resVNF.id + ':' + resultCCI['constituent-base-element-id'] + index + ':' + resultCCI['constituent-cpd-id'];
                  if (connectionPointID === d.id) {
                    this.cpData = resultCCI;
                    this.vnfData = resVNF;
                    this.virtualLinkProfileID = resultVLC['virtual-link-profile-id'];
                    this.showRightSideInfo(false, false, false, true);
                  }
                });
              });
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
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationTopologyComponent, { backdrop: 'static' });
    modalRef.componentInstance.topologyType = 'Delete';
    modalRef.componentInstance.topologyname = this.translateService.instant('PAGE.TOPOLOGY.LINK') + ' - ' + d.source.id;
    modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.LINK';
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        this.doubleClickLink(d);
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
  }
  /** Events handles when Double Click to Delete the link @private */
  private doubleClickLink(d: Tick): void {
    let getID: string = '';
    let getName: string = '';
    let getNodeIndex: string;
    if (d.source.type === 'ns') {
      getID = d.source.id;
      getName = d.source.name;
      getNodeIndex = d.source.nodeIndex;
    }
    /** Split the selected node of connectionpoint */
    const selectedNode: string[] = getID.split(':');
    this.nsData.df.forEach((resultDF: DF): void => {
      if (resultDF['vnf-profile'] !== undefined) {
        resultDF['vnf-profile'].forEach((elementVNF: VNFPROFILE): void => {
          const selectedVNFProfileID: string = selectedNode[0];
          /** If VNF ID is equal to selected VNFProfile ID check the VLC of CCI to match the id and name to remove the VLC index */
          if (selectedVNFProfileID === elementVNF.id) {
            elementVNF['virtual-link-connectivity'].forEach((elementVLC: VLC, index: number): void => {
              const posCCI: number = elementVLC['constituent-cpd-id'].findIndex((e: CCI): boolean => {
                const getCID: string = elementVNF.id + ':' + e['constituent-base-element-id'] + index + ':' + e['constituent-cpd-id'];
                return getID === getCID;
              });
              if (posCCI !== -1) {
                elementVNF['virtual-link-connectivity'].splice(index, 1);
              }
            });
          }
        });
      }
    });
    this.putType = 'linkdelete';
    this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
  }
  /** Get confirmation Before Deleting the Node in Topology @private */
  private getDeleteConfirmation(d: COMPOSERNODES): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
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
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        this.doubleClick(d);
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
  }
  /** Events handles when Double Click to Delete @private */
  private doubleClick(d: COMPOSERNODES): void {
    const deletedNode: COMPOSERNODES = d;
    this.nodes.forEach((res: COMPOSERNODES, i: number): void => {
      if (res.id === d.id) {
        if (deletedNode.type === 'vld') {
          /** Remove the virtual-link-desc related to VL */
          const pos: number = this.nsData['virtual-link-desc'].map((e: VLD): string => e.id).indexOf(d.id);
          this.nsData['virtual-link-desc'].splice(pos, 1);
          /** Remove the virtual-link-connectivity between VL and VNFD */
          this.nsData.df.forEach((resultDF: DF): void => {
            if (resultDF['vnf-profile'] !== undefined) {
              resultDF['vnf-profile'].forEach((resVNF: VNFPROFILE): void => {
                const getVLArray: number[] = resVNF['virtual-link-connectivity'].map((e: VLC, index: number): number => {
                  if (e['virtual-link-profile-id'] === d.id) {
                    return index;
                  }
                });
                if (getVLArray.length > 0) {
                  getVLArray.forEach((removeIndex: number): void => {
                    const index: string = removeIndex.toString();
                    // eslint-disable-next-line security/detect-object-injection
                    resVNF['virtual-link-connectivity'].splice(resVNF['virtual-link-connectivity'][index], 1);
                  });
                }
              });
            }
          });
          this.putType = 'nsddelete';
        } else if (deletedNode.type === 'vnfd') {
          this.nsData.df.forEach((resultDF: DF): void => {
            if (resultDF['vnf-profile'] !== undefined) {
              /** Remove the vnf-profile related to VNFD */
              const posVNF: number = resultDF['vnf-profile'].findIndex((e: VNFPROFILE): boolean => e['vnfd-id'] === d.name && e.id === d.nodeIndex);
              resultDF['vnf-profile'].splice(posVNF, 1);
              /** Check the VNFD exists in any vnf-profile */
              const isVNFDExists: boolean = resultDF['vnf-profile'].some((e: VNFPROFILE): boolean => e['vnfd-id'] === d.name);
              /** If VNFD not exists in the vnf-profile remove from vnfd-id */
              if (!isVNFDExists) {
                const posVNFD: number = this.nsData['vnfd-id'].findIndex((e: string): boolean => e === d.name);
                this.nsData['vnfd-id'].splice(posVNFD, 1);
              }
            }
          });
          this.putType = 'vnfddelete';
        } else if (deletedNode.type === 'ns') {
          /** Split the selected node */
          const selectedNode: string[] = d.id.split(':');
          this.nsData.df.forEach((resultDF: DF): void => {
            if (resultDF['vnf-profile'] !== undefined) {
              resultDF['vnf-profile'].forEach((elementVNF: VNFPROFILE): void => {
                const selectedVNFProfileID: string = selectedNode[0];
                /** If VNF ID is equal to selected VNFProfile ID check the VLC of CCI to match the id and name to remove the VLC index */
                if (selectedVNFProfileID === elementVNF.id) {
                  elementVNF['virtual-link-connectivity'].forEach((elementVLC: VLC, index: number): void => {
                    const posCCI: number = elementVLC['constituent-cpd-id'].findIndex((e: CCI): boolean => {
                      const getID: string = elementVNF.id + ':' + e['constituent-base-element-id'] + index + ':' + e['constituent-cpd-id'];
                      return d.id === getID;
                    });
                    if (posCCI !== -1) {
                      elementVNF['virtual-link-connectivity'].splice(index, 1);
                    }
                  });
                }
              });
            }
          });
          this.putType = 'nsdelete';
        }
        this.addData(environment.NSDESCRIPTORS_URL, this.identifier, this.nsData, this.putType);
      }
    });
  }
  /** drag event @private */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onDragDrop(): any {
    return d3.drag().filter(this.dragFilter)
      .on('start', this.dragstarted)
      .on('drag', this.dragged)
      .on('end', this.dragended);
  }
  /** Key press event @private */
  private keyDown(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    if (this.lastKeyDown !== -1) { return; }
    this.lastKeyDown = d3.event.keyCode;
    if (d3.event.keyCode === graphContainerAttr.shiftKeyCode) {
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
  /** Events handles when to drag using filter for the keys @private */
  private dragFilter(): boolean {
    return d3.event.ctrlKey && !d3.event.button;
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
