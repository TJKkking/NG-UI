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
 * @file VNFComposerComponent
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, GETAPIURLHEADER, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { ConfirmationTopologyComponent } from 'ConfirmationTopology';
import * as d3 from 'd3';
import { DataService } from 'DataService';
import { environment } from 'environment';
import * as HttpStatus from 'http-status-codes';
import * as jsyaml from 'js-yaml';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';
import {
  COMPOSERNODES, CONNECTIONPOINT, GRAPHDETAILS, InternalVLD, Tick, TickPath,
  VDU, VDUInternalConnectionPoint, VLDInternalConnectionPoint, VNFDInterface, VNFDNODE
} from 'VNFDModel';

/**
 * Creating component
 * @Component takes VNFComposerComponent.html as template url
 */
@Component({
  templateUrl: './VNFComposerComponent.html',
  styleUrls: ['./VNFComposerComponent.scss'],
  encapsulation: ViewEncapsulation.None
})
/** Exporting a class @exports VNFComposerComponent */
export class VNFComposerComponent {
  /** To inject services @public */
  public injector: Injector;
  /** View child contains graphContainer ref @public  */
  @ViewChild('graphContainer', { static: true }) public graphContainer: ElementRef;
  /** dataService to pass the data from one component to another @public */
  public dataService: DataService;
  /** random number count @public */
  public randomNumberLength: number;
  /** Contains the vnfd information @public */
  public vnfList: string[] = [];
  /** Contains node type @public */
  public nodeTypeRef: string;
  /** Contains VNFD Information @public */
  public vnfdInfo: VNFDNODE = { shortName: '', description: '', version: '', id: '', name: '' };
  /** Contains right panel box information @public */
  public showRightSideInfo: string = '';
  /** Add the fixed class for the freeze @public */
  public fixedClass: string = 'fixed';
  /** Check the loading results @public */
  public isLoadingResults: boolean = true;
  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';
  /** Assign the forcesimulation active @public */
  public forceSimulationActive: boolean = false;
  /** Assign pinned class for the button when freezed @public */
  public classApplied: boolean = false;
  /** Contains sidebar open status @public */
  public sideBarOpened: boolean = false;

  /** Contains SVG attributes @private */
  // tslint:disable-next-line:no-any
  private svg: any;
  /** Contains forced node animations @private */
  // tslint:disable-next-line:no-any
  private force: any;
  /** Contains the Drag line */
  // tslint:disable-next-line: no-any
  private dragLine: any;
  /** Contains id of the node @private */
  private identifier: string;
  /** Contains path information of the node */
  // tslint:disable-next-line:no-any
  private path: any;
  /** Contains node network @private */
  // tslint:disable-next-line:no-any
  private network: any;
  /** Contains node network @private */
  // tslint:disable-next-line:no-any
  private virutualDeploymentUnit: any;
  /** Contains node connectionPoint @private */
  // tslint:disable-next-line:no-any
  private connectionPoint: any;
  /** Contains node intConnectionPoint @private */
  // tslint:disable-next-line:no-any
  private intConnectionPoint: any;
  /** Contains the node information @private */
  private nodes: VNFDNODE[] = [];
  /** Contains the link information of nodes @private */
  private links: {}[] = [];
  /** Instance of the rest service @private */
  private restService: RestService;
  /** Service holds the router information @private */
  private router: Router;
  /** Service contails all the shared service information @private */
  private sharedService: SharedService;
  /** Holds teh instance of AuthService class of type AuthService @private */
  private activatedRoute: ActivatedRoute;
  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;
  /** Controls the header form @private */
  private headers: HttpHeaders;
  /** Contains tranlsate instance @private */
  private translateService: TranslateService;
  /** Rendered nodes represent network @private */
  // tslint:disable-next-line:no-any
  private gNetwork: any;
  /** Rendered nodes represent VDU @private */
  // tslint:disable-next-line:no-any
  private gVirutualDeploymentUnit: any;
  /** Rendered nodes represent connection point @private */
  // tslint:disable-next-line:no-any
  private gConnectionPoint: any;
  /** Rendered nodes represent internal connection point @private */
  // tslint:disable-next-line:no-any
  private gIntConnectionPoint: any;
  /** Contains all the information about VNF Details @private */
  private vnfdPackageDetails: VNFDNODE;
  /** Conatins mousedown action @private */
  private mousedownNode: COMPOSERNODES = null;
  /** Conatins mouseup action @private */
  private mouseupNode: COMPOSERNODES = null;
  /** Conatins current Selection node action @private */
  private currentSelectedNode: COMPOSERNODES = null;
  /** Add the activeNode for the selected @private */
  private activeNode: string = 'active';
  /** Contains lastkeypressed instance @private */
  private lastKeyDown: number = -1;
  /** Contains VDU Information @private */
  private vduInfo: VDU;
  /** Contains Internal VL Information @private */
  private intvlInfo: InternalVLD;
  /** Contains Connection Point Information @private */
  private cpInfo: CONNECTIONPOINT;
  /** Contains Internal Connection Point Information @private */
  private intcpInfo: VLDInternalConnectionPoint;
  /** Instance of the modal service @private */
  private modalService: NgbModal;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.dataService = this.injector.get(DataService);
    this.router = this.injector.get(Router);
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
    this.modalService = this.injector.get(NgbModal);
  }
  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
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

  /** Prepare information for node creation of VNFD @public */
  public generateData(): void {
    this.nodes = []; this.links = []; this.vnfdPackageDetails = null;
    this.showRightSideInfo = 'vnfdInfo';
    const httpOptions: GETAPIURLHEADER = {
      headers: new HttpHeaders({
        'Content-Type': 'application/zip',
        Accept: 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
      }),
      responseType: 'text'
    };
    this.restService.getResource(environment.VNFPACKAGES_URL + '/' + this.identifier + '/vnfd', httpOptions)
      .subscribe((vnfdPackageDetails: VNFDNODE) => {
        try {
          const getJson: string = jsyaml.load(vnfdPackageDetails.toString(), { json: true });
          if (getJson.hasOwnProperty('vnfd-catalog')) {
            this.vnfdPackageDetails = getJson['vnfd-catalog'].vnfd[0];
          } else if (getJson.hasOwnProperty('vnfd:vnfd-catalog')) {
            this.vnfdPackageDetails = getJson['vnfd:vnfd-catalog'].vnfd[0];
          } else if (getJson.hasOwnProperty('vnfd')) {
            // tslint:disable-next-line: no-string-literal
            this.vnfdPackageDetails = getJson['vnfd'][0];
          }
          this.generateCPPoint(this.vnfdPackageDetails);
          this.generateVDU(this.vnfdPackageDetails);
          this.generateInternalVLD(this.vnfdPackageDetails);
          this.generateInternalCP(this.vnfdPackageDetails);
          this.generateIntVLCPLinks(this.vnfdPackageDetails);
          this.generateVDUCPLinks(this.vnfdPackageDetails);
          this.createNode(this.nodes);
          this.vnfdInfo.shortName = this.vnfdPackageDetails['short-name'];
          this.vnfdInfo.description = this.vnfdPackageDetails.description;
          this.vnfdInfo.version = this.vnfdPackageDetails.version;
          this.vnfdInfo.id = this.vnfdPackageDetails.id;
          this.vnfdInfo.name = this.vnfdPackageDetails.name;
        } catch (e) {
          this.notifierService.notify('error', this.translateService.instant('ERROR'));
        }
        this.isLoadingResults = false;
      }, (error: ERRORDATA) => {
        error.error = typeof error.error === 'string' ? jsyaml.load(error.error) : error.error;
        if (error.error.status === HttpStatus.NOT_FOUND || error.error.status === HttpStatus.UNAUTHORIZED) {
          this.router.navigateByUrl('404', { skipLocationChange: true }).catch();
        } else {
          this.restService.handleError(error, 'get');
        }
        this.isLoadingResults = false;
        this.showRightSideInfo = '';
      });
  }
  /** Events handles at drag on D3 region @public */
  // tslint:disable-next-line:no-any
  public drag(ev: any): void {
    ev.dataTransfer.setData('text', ev.target.id);
  }
  /** Events handles drop at D3 region @public */
  public drop(ev: DragEvent): void {
    ev.preventDefault();
    this.nodeTypeRef = ev.dataTransfer.getData('text');
    if (this.nodeTypeRef === 'vdu') {
      this.svg.selectAll('*').remove();
      this.vduDropCompose();
    } else if (this.nodeTypeRef === 'cp') {
      this.svg.selectAll('*').remove();
      this.cpDropCompose();
    } else if (this.nodeTypeRef === 'intvl') {
      this.svg.selectAll('*').remove();
      this.intvlDropCompose();
    }
  }
  /** Events handles allow drop on D3 region @public */
  public allowDrop(ev: DragEvent): void {
    ev.preventDefault();
  }
  /** Generate and list CP points @public */
  public generateCPPoint(vnfdPackageDetails: VNFDNODE): void {
    if (vnfdPackageDetails['connection-point'] !== undefined) {
      vnfdPackageDetails['connection-point'].forEach((cp: CONNECTIONPOINT) => {
        this.nodes.push({ id: cp.name, nodeTypeRef: 'cp', name: cp.name, type: cp.type });
      });
    }
  }
  /** Generate and list VDU @public */
  public generateVDU(vnfdPackageDetails: VNFDNODE): void {
    if (vnfdPackageDetails.vdu !== undefined) {
      vnfdPackageDetails.vdu.forEach((vdu: VDU) => {
        this.nodes.push({
          id: vdu.name, nodeTypeRef: 'vdu', 'cloud-init-file': vdu['cloud-init-file'], count: vdu.count, description: vdu.description,
          vduID: vdu.id, name: vdu.name, interface: vdu.interface, 'vm-flavor': vdu['vm-flavor']
        });
      });
    }
  }
  /** Generate and list Internal VLD @public */
  public generateInternalVLD(vnfdPackageDetails: VNFDNODE): void {
    if (vnfdPackageDetails['internal-vld'] !== undefined) {
      vnfdPackageDetails['internal-vld'].forEach((internalVLD: InternalVLD) => {
        this.nodes.push({
          id: internalVLD.name, nodeTypeRef: 'intvl', intVLID: internalVLD.id,
          'internal-connection-point': internalVLD['internal-connection-point'],
          'ip-profile-ref': internalVLD['ip-profile-ref'], name: internalVLD.name, 'short-name': internalVLD['short-name'],
          type: internalVLD.type
        });
      });
    }
  }
  /** Generate and list Internal CP @public */
  public generateInternalCP(vnfdPackageDetails: VNFDNODE): void {
    if (vnfdPackageDetails.vdu !== undefined) {
      vnfdPackageDetails.vdu.forEach((intCP: VDUInternalConnectionPoint) => {
        if (intCP['internal-connection-point'] !== undefined) {
          intCP['internal-connection-point'].forEach((internalCP: VDUInternalConnectionPoint) => {
            this.nodes.push({
              id: internalCP.name, nodeTypeRef: 'intcp', name: internalCP.name,
              'short-name': internalCP['short-name'], type: internalCP.type
            });
          });
        }
      });
    }
  }
  /** Generate VDU External and Internal CP Links @public */
  public generateVDUCPLinks(vnfdPackageDetails: VNFDNODE): void {
    if (vnfdPackageDetails.vdu !== undefined) {
      vnfdPackageDetails.vdu.forEach((vdu: VDU) => {
        const vduLink: string = vdu.name;
        if (vdu.interface !== undefined) {
          vdu.interface.forEach((interfaceDetails: VNFDInterface) => {
            if (interfaceDetails['external-connection-point-ref'] !== undefined) {
              this.links.push({ source: vduLink, target: interfaceDetails['external-connection-point-ref'] });
            }
            if (interfaceDetails['internal-connection-point-ref'] !== undefined) {
              this.links.push({ source: vduLink, target: interfaceDetails['internal-connection-point-ref'] });
            }
          });
        }
      });
    }
  }
  /** Generate Network/VLD/Internal VirtualLink, CP Links @public */
  public generateIntVLCPLinks(vnfdPackageDetails: VNFDNODE): void {
    if (vnfdPackageDetails['internal-vld'] !== undefined) {
      vnfdPackageDetails['internal-vld'].forEach((internalVLD: InternalVLD) => {
        const vldName: string = internalVLD.name;
        if (internalVLD['internal-connection-point'] !== undefined) {
          internalVLD['internal-connection-point'].forEach((intCP: VLDInternalConnectionPoint) => {
            this.links.push({ source: vldName, target: intCP['id-ref'] });
          });
        }
      });
    }
  }
  /** VNFD details can be saved on users inputs @public */
  public saveVNFD(): void {
    this.vnfdPackageDetails['short-name'] = this.vnfdInfo.shortName;
    this.vnfdPackageDetails.description = this.vnfdInfo.description;
    this.vnfdPackageDetails.version = this.vnfdInfo.version;
    this.vnfdPackageDetails.id = this.vnfdInfo.id;
    this.vnfdPackageDetails.name = this.vnfdInfo.name;
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
    delete this.vnfdPackageDetails.shortName;
  }
  /** VDU details can be saved on users inputs @public */
  public saveVDU(vduID: string): void {
    this.vnfdPackageDetails.vdu.forEach((ref: VDU) => {
      if (ref.id === vduID) {
        ref.count = this.vduInfo.count;
        ref.description = this.vduInfo.description;
        ref.image = this.vduInfo.image;
        ref.id = this.vduInfo.id;
        ref.name = this.vduInfo.name;
      }
    });
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** IntVL details can be saved on users inputs @public */
  public saveIntVL(intVLID: string): void {
    this.vnfdPackageDetails['internal-vld'].forEach((ref: InternalVLD) => {
      if (ref.id === intVLID) {
        ref['short-name'] = this.intvlInfo.shortName;
        ref.name = this.intvlInfo.name;
        ref.type = this.intvlInfo.type;
        ref['ip-profile-ref'] = !isNullOrUndefined(this.intvlInfo.ipProfileRef) ? this.intvlInfo.ipProfileRef : '';
        ref.id = this.intvlInfo.id;
        delete ref.shortName;
        delete ref.ipProfileRef;
      }
    });
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** IntVL details can be saved on users inputs @public */
  public saveCP(cpName: string): void {
    this.vnfdPackageDetails['connection-point'].forEach((ref: CONNECTIONPOINT) => {
      if (ref.name === cpName) {
        if (!isNullOrUndefined(this.cpInfo.type)) {
          ref.type = this.cpInfo.type;
        }
        ref.name = this.cpInfo.name;
      }
    });
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** Edit topology @public */
  public onEdit(): void {
    this.router.navigate(['/packages/vnf/edit/', this.identifier]).catch();
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
    this.showRightSideInfo = 'vnfdInfo';
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
  /** Node is created and render at D3 region @private */
  private createNode(nodes: VNFDNODE[]): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    d3.selectAll('svg#graphContainer > *').remove();
    d3.select(window).on('keydown', () => { this.keyDown(); });
    d3.select(window).on('keyup', () => { this.keyUp(); });
    this.svg = d3.select('#graphContainer').attr('oncontextmenu', 'return false;').attr('width', graphContainerAttr.width)
      .attr('height', graphContainerAttr.height).on('mousemove', () => { this.mousemove(); });
    this.force = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: TickPath) => d.id).distance(graphContainerAttr.distance))
      .force('charge', d3.forceManyBody().strength(graphContainerAttr.strength))
      .force('x', d3.forceX(graphContainerAttr.width / graphContainerAttr.forcex))
      .force('y', d3.forceY(graphContainerAttr.height / graphContainerAttr.forcey))
      .on('tick', () => { this.tick(); });
    this.path = this.svg.append('svg:g').selectAll('path');
    this.dragLine = this.svg.append('svg:path').attr('class', 'link dragline hidden').attr('d', 'M0,0L0,0');
    this.network = this.svg.append('svg:g').selectAll('network');
    this.virutualDeploymentUnit = this.svg.append('svg:g').selectAll('virutualDeploymentUnit');
    this.connectionPoint = this.svg.append('svg:g').selectAll('connectionPoint');
    this.intConnectionPoint = this.svg.append('svg:g').selectAll('intConnectionPoint');
    this.restart(nodes);
  }
  /** Update force layout (called automatically each iteration) @private */
  private tick(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.path.attr('d', (d: Tick) => {
      const deltaX: number = d.target.x - d.source.x; const deltaY: number = d.target.y - d.source.y;
      const dist: number = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normX: number = deltaX / dist; const normY: number = deltaY / dist;
      const sourcePadding: number = d.left ? graphContainerAttr.sourcePaddingYes : graphContainerAttr.sourcePaddingNo;
      const targetPadding: number = d.right ? graphContainerAttr.targetPaddingYes : graphContainerAttr.targetPaddingNo;
      const sourceX: number = d.source.x + (sourcePadding * normX); const sourceY: number = d.source.y + (sourcePadding * normY);
      const targetX: number = d.target.x - (targetPadding * normX); const targetY: number = d.target.y - (targetPadding * normY);
      return `M${sourceX},${sourceY}L${targetX},${targetY}`;
    }).on('dblclick', (d: Tick) => { this.getDeleteLinkConfirmation(d); });
    this.network.attr('transform', (d: TickPath) => `translate(${d.x},${d.y})`);
    this.virutualDeploymentUnit.attr('transform', (d: TickPath) => `translate(${d.x},${d.y})`);
    this.connectionPoint.attr('transform', (d: TickPath) => `translate(${d.x},${d.y})`);
    this.intConnectionPoint.attr('transform', (d: TickPath) => `translate(${d.x},${d.y})`);
  }
  /** Update graph (called when needed) @private */
  private restart(nodes: VNFDNODE[]): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.path = this.path.data(this.links);
    const cpNodes: {}[] = []; const vduNodes: {}[] = []; const vlNodes: {}[] = []; const intcpNodes: {}[] = []; //Nodes are known by id
    nodes.forEach((nodeList: VNFDNODE) => {
      if (nodeList.nodeTypeRef === 'cp') { cpNodes.push(nodeList); }
      else if (nodeList.nodeTypeRef === 'vdu') { vduNodes.push(nodeList); }
      else if (nodeList.nodeTypeRef === 'intvl') { vlNodes.push(nodeList); }
      else if (nodeList.nodeTypeRef === 'intcp') { intcpNodes.push(nodeList); }
    });
    this.network = this.network.data(vlNodes, (d: { id: number }) => d.id);
    this.virutualDeploymentUnit = this.virutualDeploymentUnit.data(vduNodes, (d: { id: number }) => d.id);
    this.connectionPoint = this.connectionPoint.data(cpNodes, (d: { id: number }) => d.id);
    this.intConnectionPoint = this.intConnectionPoint.data(intcpNodes, (d: { id: number }) => d.id);
    this.resetAndCreateNodes();
    this.force.nodes(nodes).force('link').links(this.links); //Set the graph in motion
    this.force.alphaTarget(graphContainerAttr.alphaTarget).restart();
  }
  /** Rest and create nodes @private */
  private resetAndCreateNodes(): void {
    this.path.exit().remove();
    this.network.exit().remove();
    this.virutualDeploymentUnit.exit().remove();
    this.connectionPoint.exit().remove();
    this.intConnectionPoint.exit().remove();
    this.getPathNodes();
    this.getgNetwork();
    this.getgVirutualDeploymentUnit();
    this.getgConnectionPoint();
    this.getgIntConnectionPoint();
    this.network = this.gNetwork.merge(this.network);
    this.virutualDeploymentUnit = this.gVirutualDeploymentUnit.merge(this.virutualDeploymentUnit);
    this.connectionPoint = this.gConnectionPoint.merge(this.connectionPoint);
    this.intConnectionPoint = this.gIntConnectionPoint.merge(this.intConnectionPoint);
    this.path.merge(this.path);
  }
  /** Setting the Path @private */
  private getPathNodes(): void {
    this.path = this.path.enter().append('svg:path').attr('class', 'link');
  }
  /** Settings all the network attributes of nodes @private */
  private getgNetwork(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.gNetwork = this.network.enter().append('svg:g');
    this.gNetwork.append('svg:circle').attr('r', graphContainerAttr.radius).style('fill', '#eeeeee');
    this.gNetwork.append('svg:image')
      .style('opacity', 1)
      .attr('x', graphContainerAttr.imageX)
      .attr('y', graphContainerAttr.imageY)
      .attr('id', (d: VNFDNODE) => { return d.id; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/INTVL.svg')
      .on('mousedown', (d: VNFDNODE) => { this.mouseDown(d); })
      .on('mouseup', (d: VNFDNODE) => { this.mouseUp(d); })
      .on('click', (d: VNFDNODE) => { this.singleClick(this.network, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: VNFDNODE) => { this.getDeleteNodeConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gNetwork.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: { id: number }) => d.id);
  }
  /** Settings all the connection point attributes of nodes @private */
  private getgVirutualDeploymentUnit(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.gVirutualDeploymentUnit = this.virutualDeploymentUnit.enter().append('svg:g');
    this.gVirutualDeploymentUnit.append('svg:circle').attr('r', graphContainerAttr.radius).style('fill', '#eeeeee');
    this.gVirutualDeploymentUnit.append('svg:image')
      .style('opacity', 1)
      .attr('x', graphContainerAttr.imageX)
      .attr('y', graphContainerAttr.imageY)
      .attr('id', (d: VNFDNODE) => { return d.id; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/VDU.svg')
      .on('mousedown', (d: VNFDNODE) => { this.mouseDown(d); })
      .on('mouseup', (d: VNFDNODE) => { this.mouseUp(d); })
      .on('click', (d: VNFDNODE) => { this.singleClick(this.virutualDeploymentUnit, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: VNFDNODE) => { this.getDeleteNodeConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gVirutualDeploymentUnit.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: { id: string }) => d.id);
  }
  /** Settings all the connection point attributes of nodes @private */
  private getgConnectionPoint(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.gConnectionPoint = this.connectionPoint.enter().append('svg:g');
    this.gVirutualDeploymentUnit.append('svg:circle').attr('r', graphContainerAttr.radius).style('fill', '#eeeeee');
    this.gConnectionPoint.append('svg:image')
      .style('opacity', 1)
      .attr('x', graphContainerAttr.imageX)
      .attr('y', graphContainerAttr.imageY)
      .attr('id', (d: VNFDNODE) => { return d.id; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/CP-VNF.svg')
      .on('mousedown', (d: VNFDNODE) => { this.mouseDown(d); })
      .on('mouseup', (d: VNFDNODE) => { this.mouseUp(d); })
      .on('click', (d: VNFDNODE) => { this.singleClick(this.connectionPoint, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: VNFDNODE) => { this.getDeleteNodeConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gConnectionPoint.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: { id: string }) => d.id);
  }
  /** Settings all the internal connection point attributes of nodes @private */
  private getgIntConnectionPoint(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.gIntConnectionPoint = this.intConnectionPoint.enter().append('svg:g');
    this.gIntConnectionPoint.append('svg:circle').attr('r', graphContainerAttr.radius).style('fill', '#eeeeee');
    this.gIntConnectionPoint.append('svg:image')
      .style('opacity', 1)
      .attr('x', graphContainerAttr.imageX)
      .attr('y', graphContainerAttr.imageY)
      .attr('id', (d: VNFDNODE) => { return d.id; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/INTCP.svg')
      .on('mousedown', (d: VNFDNODE) => { this.mouseDown(d); })
      .on('mouseup', (d: VNFDNODE) => { this.mouseUp(d); })
      .on('click', (d: VNFDNODE) => { this.singleClick(this.intConnectionPoint, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: VNFDNODE) => { this.getDeleteNodeConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gIntConnectionPoint.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: { id: string }) => d.id);
  }
  /** Drop VDU Composer Data @private */
  private vduDropCompose(): void {
    const randomID: string = this.sharedService.randomString();
    const vduNode: VNFDNODE[] = [{
      nodeTypeRef: 'vdu', id: 'vdu_' + randomID, count: 1, description: '', name: 'vdu_' + randomID, image: 'ubuntu',
      interface: [], 'internal-connection-point': [], 'monitoring-param': [], 'vm-flavor': {}
    }];
    const nodeCopy: VNFDNODE[] = this.nodes;
    Array.prototype.push.apply(vduNode, nodeCopy);
    this.nodes = vduNode;
    if (this.vnfdPackageDetails.vdu === undefined) { this.vnfdPackageDetails.vdu = []; }
    this.vnfdPackageDetails.vdu.push({
      id: 'vdu_' + randomID, count: 1, description: '', name: 'vdu_' + randomID, image: 'ubuntu',
      interface: [], 'internal-connection-point': [], 'monitoring-param': [], 'vm-flavor': {}
    });
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** Drop CP Composer Data @private */
  private cpDropCompose(): void {
    const randomID: string = this.sharedService.randomString();
    const cpNode: VNFDNODE[] = [{ nodeTypeRef: 'cp', id: 'cp_' + randomID, name: 'cp_' + randomID }];
    const nodeCopy: VNFDNODE[] = this.nodes;
    Array.prototype.push.apply(cpNode, nodeCopy);
    this.nodes = cpNode;
    if (this.vnfdPackageDetails['connection-point'] === undefined) {
      this.vnfdPackageDetails['connection-point'] = [];
    }
    this.vnfdPackageDetails['connection-point'].push({
      id: 'cp_' + randomID, name: 'cp_' + randomID, type: 'VPORT'
    });
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** Drop IntVL Composer Data @private */
  private intvlDropCompose(): void {
    const randomID: string = this.sharedService.randomString();
    const intvlNode: VNFDNODE[] = [{
      nodeTypeRef: 'intvl', id: 'vnf_vl_' + randomID, name: 'vnf_vl_' + randomID, 'short-name': 'vnf_vl_' + randomID, 'ip-profile-ref': '',
      type: 'ELAN'
    }];
    const nodeCopy: VNFDNODE[] = this.nodes;
    Array.prototype.push.apply(intvlNode, nodeCopy);
    this.nodes = intvlNode;
    if (this.vnfdPackageDetails['internal-vld'] === undefined) { this.vnfdPackageDetails['internal-vld'] = []; }
    this.vnfdPackageDetails['internal-vld'].push({
      id: 'vnf_vl_' + randomID, name: 'vnf_vl_' + randomID, 'short-name': 'vnf_vl_' + randomID,
      'ip-profile-ref': '', type: 'ELAN', 'internal-connection-point': []
    });
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** Add the Add Nodes Data @private */
  private addNodes(apiURL: string, identifier: string, data: VNFDNODE): void {
    this.isLoadingResults = true;
    const apiURLHeader: APIURLHEADER = {
      url: apiURL + '/' + identifier + '/package_content',
      httpOptions: { headers: this.headers }
    };
    const vnfData: {} = {};
    vnfData['vnfd:vnfd-catalog'] = {};
    vnfData['vnfd:vnfd-catalog'].vnfd = [];
    vnfData['vnfd:vnfd-catalog'].vnfd.push(data);
    const descriptorInfo: string = jsyaml.dump(vnfData, { sortKeys: true });
    this.sharedService.targzFile({ packageType: 'vnfd', id: this.identifier, descriptor: descriptorInfo })
      .then((content: ArrayBuffer): void => {
        this.restService.putResource(apiURLHeader, content).subscribe((res: {}) => {
          this.generateData();
          this.notifierService.notify('success', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.UPDATEDSUCCESSFULLY'));
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
  /** Events handles when mousedown click it will capture the selected node data @private */
  private mouseDown(d: VNFDNODE): void {
    event.preventDefault();
    if (d3.event.ctrlKey) { return; }
    if (d3.event.shiftKey) {
      this.mousedownNode = d;
      this.currentSelectedNode = (this.mousedownNode === this.currentSelectedNode) ? null : this.mousedownNode;
      this.dragLine.classed('hidden', false)
        .attr('d', `M${this.mousedownNode.x},${this.mousedownNode.y}L${this.mousedownNode.x},${this.mousedownNode.y}`);
    }
  }
  /** Event handles when mouseup event occures @private */
  private mouseUp(d: VNFDNODE): void {
    if (!this.mousedownNode) { return; }
    this.dragLine.classed('hidden', true);
    this.mouseupNode = d;
    if (this.mousedownNode.nodeTypeRef === 'vdu' && this.mouseupNode.nodeTypeRef === 'intcp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKVDUANDINTCP'));
      this.deselectPath();
    }
    else if (this.mousedownNode.nodeTypeRef === 'vdu' && this.mouseupNode.nodeTypeRef === 'vdu') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKVDUANDVDU'));
      this.deselectPath();
    }
    else if (this.mousedownNode.nodeTypeRef === 'intcp' && this.mouseupNode.nodeTypeRef === 'vdu') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKINTCPANDVDU'));
      this.deselectPath();
    }
    else if (this.mousedownNode.nodeTypeRef === 'cp' && this.mouseupNode.nodeTypeRef === 'intvl') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKCPANDVNFVL'));
      this.deselectPath();
    }
    else if (this.mousedownNode.nodeTypeRef === 'intvl' && this.mouseupNode.nodeTypeRef === 'cp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKVNFVLANDCP'));
      this.deselectPath();
    }
    else if (this.mousedownNode.nodeTypeRef === 'intcp' && this.mouseupNode.nodeTypeRef === 'cp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKINTCPANDCP'));
      this.deselectPath();
    }
    else if (this.mousedownNode.nodeTypeRef === 'cp' && this.mouseupNode.nodeTypeRef === 'intcp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKCPANDINTCP'));
      this.deselectPath();
    } else if (this.mousedownNode.nodeTypeRef === 'vdu' && this.mouseupNode.nodeTypeRef === 'cp') {
      this.vnfdPackageDetails.vdu.forEach((vduDetails: VDU) => {
        if (vduDetails.id === this.mousedownNode.id) {
          if (vduDetails.interface === undefined) { vduDetails.interface = []; }
          vduDetails.interface.push({
            'external-connection-point-ref': this.mouseupNode.id, 'mgmt-interface': true,
            name: 'eth_' + this.sharedService.randomString(),
            'virtual-interface': { type: 'VIRTIO' },
            type: 'EXTERNAL'
          });
          if (vduDetails['internal-connection-point'] === undefined) {
            vduDetails['internal-connection-point'] = [];
          }
          if (vduDetails['monitoring-param'] === undefined) {
            vduDetails['monitoring-param'] = [];
          }
          if (vduDetails['vm-flavor'] === undefined) {
            vduDetails['vm-flavor'] = {};
          }
        }
      });
      this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
      this.deselectPath();
    } else if (this.mousedownNode.nodeTypeRef === 'vdu' && this.mouseupNode.nodeTypeRef === 'intvl') {
      const setIntCP: string = 'intcp_' + this.sharedService.randomString();
      this.vnfdPackageDetails['internal-vld'].forEach((vldInternal: InternalVLD) => {
        if (vldInternal.id === this.mouseupNode.id) {
          if (vldInternal['internal-connection-point'] === undefined) { vldInternal['internal-connection-point'] = []; }
          vldInternal['internal-connection-point'].push({ 'id-ref': setIntCP });
        }
      });
      this.vnfdPackageDetails.vdu.forEach((vduDetails: VDU) => {
        if (vduDetails.id === this.mousedownNode.id) {
          if (vduDetails.interface === undefined) {
            vduDetails.interface = [];
          }
          vduDetails.interface.push({
            'internal-connection-point-ref': setIntCP, name: 'int_' + setIntCP, type: 'INTERNAL', 'virtual-interface': { type: 'VIRTIO' }
          });
          if (vduDetails['internal-connection-point'] === undefined) {
            vduDetails['internal-connection-point'] = [];
          }
          vduDetails['internal-connection-point'].push({
            id: setIntCP, name: setIntCP, 'short-name': setIntCP, type: 'VPORT'
          });
        }
      });
      this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
      this.deselectPath();
    }
    else {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.INVALIDSELECTION'));
      this.deselectPath();
    }
    this.resetMouseActions();
    this.currentSelectedNode = null;
  }
  /** Events handles when mousemove it will capture the selected node data @private */
  private mousemove(): void {
    if (!this.mousedownNode) { return; }
    this.dragLine.attr('d',
      `M${this.mousedownNode.x},${this.mousedownNode.y}L${d3.mouse(d3.event.currentTarget)[0]},${d3.mouse(d3.event.currentTarget)[1]}`);
  }
  /** reset Mouse varaibles @private */
  private resetMouseActions(): void {
    this.mousedownNode = null;
    this.mouseupNode = null;
  }
  /** Key press event @private */
  private keyDown(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    if (this.lastKeyDown !== -1) { return; }
    this.lastKeyDown = d3.event.keyCode;
    if (d3.event.keyCode === graphContainerAttr.shiftKeyCode) {
      this.gNetwork.call(d3.drag().on('start', this.dragstarted).on('drag', this.dragged).on('end', this.dragended));
      this.gVirutualDeploymentUnit.call(d3.drag().on('start', this.dragstarted).on('drag', this.dragged).on('end', this.dragended));
      this.gConnectionPoint.call(d3.drag().on('start', this.dragstarted).on('drag', this.dragged).on('end', this.dragended));
      this.gIntConnectionPoint.call(d3.drag().on('start', this.dragstarted).on('drag', this.dragged).on('end', this.dragended));
      this.svg.classed('ctrl', true);
    }
  }
  /** Key realse event @private */
  private keyUp(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.lastKeyDown = -1;
    if (d3.event.keyCode === graphContainerAttr.shiftKeyCode) {
      this.gNetwork.on('.drag', null);
      this.gVirutualDeploymentUnit.on('.drag', null);
      this.gConnectionPoint.on('.drag', null);
      this.gIntConnectionPoint.on('.drag', null);
      this.svg.classed('ctrl', false);
    }
  }
  /** Mosue Drag Line false if it is not satisfied @private */
  private deselectPath(): void {
    this.dragLine.classed('hidden', true).attr('d', 'M0,0L0,0');
  }
  /** Events handles when Shift Click to perform create cp @private */
  // tslint:disable-next-line: no-any
  private singleClick(nodeSelected: any, d: VNFDNODE): void {
    this.selectedNode(nodeSelected, d);
  }
  /** Get confirmation Before Deleting the Node in Topology @private */
  private getDeleteNodeConfirmation(d: VNFDNODE): void {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationTopologyComponent, { backdrop: 'static' });
    modalRef.componentInstance.topologyType = 'Delete';
    modalRef.componentInstance.topologyname = d.name;
    if (d.nodeTypeRef === 'vdu') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.VDU';
    } else if (d.nodeTypeRef === 'intvl') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.INTVL';
    } else if (d.nodeTypeRef === 'cp') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.CONNECTIONPOINT';
    } else if (d.nodeTypeRef === 'intcp') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.INTCP';
    }
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.deleteNode(d);
      }
    }).catch();
  }
  /** Delete nodes @private */
  private deleteNode(d: VNFDNODE): void {
    const deletedNode: VNFDNODE = d;
    this.nodes.forEach((node: VNFDNODE) => {
      if (node.id === d.id) {
        if (deletedNode.nodeTypeRef === 'cp') {
          if (this.vnfdPackageDetails.vdu !== undefined) {
            this.vnfdPackageDetails.vdu.forEach((vduDetails: VDU) => {
              if (vduDetails.interface !== undefined) {
                const interfacePos: number = vduDetails.interface.map((e: VNFDInterface) => { return e['external-connection-point-ref']; })
                  .indexOf(d.id);
                if (interfacePos >= 0) {
                  vduDetails.interface.splice(interfacePos, 1);
                }
              }
            });
          }
          const cpPos: number = this.vnfdPackageDetails['connection-point'].map((e: CONNECTIONPOINT) => { return e.name; })
            .indexOf(d.id);
          if (cpPos >= 0) {
            this.vnfdPackageDetails['connection-point'].splice(cpPos, 1);
          }
        } else if (deletedNode.nodeTypeRef === 'intcp') {
          this.vnfdPackageDetails.vdu.forEach((vduDetails: VDU) => {
            // Delete Interface
            const interfacePos: number = vduDetails.interface.map((e: VNFDInterface) => { return e['internal-connection-point-ref']; })
              .indexOf(d.id);
            if (interfacePos >= 0) {
              vduDetails.interface.splice(interfacePos, 1);
            }
            // Delete Internal CP
            const interCPPos: number = vduDetails['internal-connection-point']
              .map((e: VDUInternalConnectionPoint) => { return e.id; })
              .indexOf(d.id);
            if (interCPPos >= 0) {
              vduDetails['internal-connection-point'].splice(interCPPos, 1);
            }
          });
          if (this.vnfdPackageDetails['internal-vld'] !== undefined && this.vnfdPackageDetails['internal-vld'].length > 0) {
            this.vnfdPackageDetails['internal-vld'].forEach((internalVLD: InternalVLD) => {
              const interfacePos: number = internalVLD['internal-connection-point']
                .map((e: VLDInternalConnectionPoint) => { return e['id-ref']; }).indexOf(d.id);
              if (interfacePos >= 0) {
                internalVLD['internal-connection-point'].splice(interfacePos, 1);
              }
            });
          }
        } else if (deletedNode.nodeTypeRef === 'intvl') {
          const intvlPos: number = this.vnfdPackageDetails['internal-vld']
            .map((e: InternalVLD) => { return e.name; }).indexOf(d.id);
          if (intvlPos >= 0) {
            this.vnfdPackageDetails['internal-vld'].splice(intvlPos, 1);
          }
        } else if (deletedNode.nodeTypeRef === 'vdu') {
          const internalCPList: string[] = [];
          if (deletedNode.interface !== undefined && deletedNode.interface.length > 0) {
            deletedNode.interface.forEach((interfaceNode: InternalVLD) => {
              if (interfaceNode['internal-connection-point-ref'] !== undefined) {
                internalCPList.push(interfaceNode['internal-connection-point-ref']);
              }
            });
          }
          internalCPList.forEach((list: string) => {
            if (this.vnfdPackageDetails['internal-vld'] !== undefined && this.vnfdPackageDetails['internal-vld'].length > 0) {
              this.vnfdPackageDetails['internal-vld'].forEach((internalVLD: InternalVLD) => {
                const interfacePos: number = internalVLD['internal-connection-point']
                  .map((e: VLDInternalConnectionPoint) => { return e['id-ref']; }).indexOf(list);
                if (interfacePos >= 0) {
                  internalVLD['internal-connection-point'].splice(interfacePos, 1);
                }
              });
            }
          });
          const vduPos: number = this.vnfdPackageDetails.vdu.map((e: VDU) => { return e.id; }).indexOf(d.id);
          if (vduPos >= 0) {
            this.vnfdPackageDetails.vdu.splice(vduPos, 1);
          }
        } else {
          this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.INVALIDSELECTION'));
        }
        this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
      }
    });
  }
  /** Get confirmation before deleting the ink in Topology @private */
  private getDeleteLinkConfirmation(d: Tick): void {
    this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.YOUCANNOTDELETELINK'));
  }
  /** Selected nodes @private */
  // tslint:disable-next-line: no-any
  private selectedNode(nodeSeleced: any, d: VNFDNODE): void {
    const alreadyIsActive: boolean = nodeSeleced.select('#' + d.id).classed(this.activeNode);
    this.deselectAllNodes();
    nodeSeleced.select('#' + d.id).classed(this.activeNode, !alreadyIsActive);
    if (d.nodeTypeRef === 'vdu' && !alreadyIsActive) {
      this.vnfdPackageDetails.vdu.forEach((res: VDU) => {
        if (res.name === d.id) {
          this.showRightSideInfo = 'vduInfo';
          this.vduInfo = res;
        }
      });
    } else if (d.nodeTypeRef === 'intvl' && !alreadyIsActive) {
      this.vnfdPackageDetails['internal-vld'].forEach((res: InternalVLD) => {
        if (res.name === d.id) {
          this.showRightSideInfo = 'intvlInfo';
          this.intvlInfo = res;
          this.intvlInfo.shortName = res['short-name'];
          this.intvlInfo.ipProfileRef = res['ip-profile-ref'];
        }
      });
    } else if (d.nodeTypeRef === 'cp' && !alreadyIsActive) {
      this.vnfdPackageDetails['connection-point'].forEach((res: CONNECTIONPOINT) => {
        if (res.name === d.id) {
          this.showRightSideInfo = 'cpInfo';
          this.cpInfo = res;
        }
      });
    }
    else if (d.nodeTypeRef === 'intcp' && !alreadyIsActive) {
      this.intcpInfo = d;
      this.showRightSideInfo = 'intcpInfo';
      this.intcpInfo.shortName = d['short-name'];
    } else {
      this.showRightSideInfo = 'vnfdInfo';
    }
  }
  /** De-select all the selected nodes @private */
  private deselectAllNodes(): void {
    this.network.select('image').classed(this.activeNode, false);
    this.virutualDeploymentUnit.select('image').classed(this.activeNode, false);
    this.connectionPoint.select('image').classed(this.activeNode, false);
    this.intConnectionPoint.select('image').classed(this.activeNode, false);
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
