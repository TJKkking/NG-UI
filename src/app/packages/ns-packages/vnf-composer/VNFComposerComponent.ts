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
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { ConfirmationTopologyComponent } from 'ConfirmationTopology';
import * as d3 from 'd3';
import { DataService } from 'DataService';
import { environment } from 'environment';
import * as HttpStatus from 'http-status-codes';
import * as jsyaml from 'js-yaml';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { COMPOSERNODES, EXTCPD, GRAPHDETAILS, INTCPD, IVLD, Tick, TickPath, VDU, VDUINTCPD, VNFD, VNFDATA, VNIR } from 'VNFDModel';

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
  /** Contains VNFD Information @public */
  public vnfdInfo: VNFD = { 'product-name': '', description: '', version: '', id: '', provider: '' };
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
  private nodes: COMPOSERNODES[] = [];
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
  private vnfdPackageDetails: VNFD;
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
  /** Contains VDU Old value Information @private */
  private oldVDUID: string;
  /** Contains Internal VL Information @private */
  private intvlInfo: IVLD;
  /** Contains Internal VL Old value Information @private */
  private oldintVLID: string;
  /** Contains Connection Point Information @private */
  private cpInfo: EXTCPD;
  /** Contains Connection Point Old value Information @private */
  private oldCPID: string;
  /** Contains Internal Connection Point Information @private */
  private intcpInfo: VNIR;
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
      'Content-Type': 'application/gzip',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
  }

  /** Prepare information for node creation of VNFD @public */
  public generateData(): void {
    this.nodes = []; this.links = []; this.vnfdPackageDetails = null;
    this.showRightSideInfo = 'vnfdInfo';
    this.restService.getResource(environment.VNFPACKAGESCONTENT_URL + '/' + this.identifier)
      .subscribe((vnfdPackageDetails: VNFD): void => {
        try {
          delete vnfdPackageDetails._admin;
          delete vnfdPackageDetails._id;
          delete vnfdPackageDetails._links;
          this.vnfdPackageDetails = vnfdPackageDetails;
          this.generateVDU(vnfdPackageDetails);
          this.generateCPPoint(vnfdPackageDetails);
          this.generateInternalVLD(vnfdPackageDetails);
          this.generateInternalCP(vnfdPackageDetails);
          this.generateIntVLCPLinks(vnfdPackageDetails);
          this.generateVDUCPLinks(vnfdPackageDetails);
          this.createNode(this.nodes);
          this.generateVNFInfo(vnfdPackageDetails);
        } catch (e) {
          this.notifierService.notify('error', this.translateService.instant('ERROR'));
        }
        this.isLoadingResults = false;
      }, (error: ERRORDATA): void => {
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
  /** Generate the VNF Package Information */
  public generateVNFInfo(vnfdPackageDetails: VNFD): void {
    this.vnfdInfo['product-name'] = vnfdPackageDetails['product-name'];
    this.vnfdInfo.description = vnfdPackageDetails.description;
    this.vnfdInfo.version = vnfdPackageDetails.version;
    this.vnfdInfo.id = vnfdPackageDetails.id;
    this.vnfdInfo.provider = vnfdPackageDetails.provider;
  }
  /** Events handles at drag on D3 region @public */
  // tslint:disable-next-line:no-any
  public drag(ev: any): void {
    ev.dataTransfer.setData('text', ev.target.id);
  }
  /** Events handles drop at D3 region @public */
  public drop(ev: DragEvent): void {
    ev.preventDefault();
    const getDropedName: string = ev.dataTransfer.getData('text');
    if (getDropedName === 'vdu') {
      this.svg.selectAll('*').remove();
      this.vduDropCompose();
    } else if (getDropedName === 'cp') {
      this.svg.selectAll('*').remove();
      this.cpDropCompose();
    } else if (getDropedName === 'intvl') {
      this.svg.selectAll('*').remove();
      this.intvlDropCompose();
    }
  }
  /** Events handles allow drop on D3 region @public */
  public allowDrop(ev: DragEvent): void {
    ev.preventDefault();
  }
  /** Generate and list VDU @public */
  public generateVDU(vnfdPackageDetails: VNFD): void {
    if (vnfdPackageDetails.vdu !== undefined) {
      vnfdPackageDetails.vdu.forEach((vdu: VDU): void => {
        this.nodes.push({
          id: vdu.id,
          name: vdu.name,
          reflexive: false,
          type: 'vdu'
        });
      });
    }
  }
  /** Generate and list CP points @public */
  public generateCPPoint(vnfdPackageDetails: VNFD): void {
    if (vnfdPackageDetails['ext-cpd'] !== undefined) {
      vnfdPackageDetails['ext-cpd'].forEach((cp: EXTCPD): void => {
        this.nodes.push({
          id: cp['int-cpd'].cpd !== undefined ? cp['int-cpd'].cpd : cp.id,
          name: cp.id,
          reflexive: false,
          type: 'cp'
        });
      });
    }
  }
  /** Generate and list Internal VLD @public */
  public generateInternalVLD(vnfdPackageDetails: VNFD): void {
    if (vnfdPackageDetails['int-virtual-link-desc'] !== undefined) {
      vnfdPackageDetails['int-virtual-link-desc'].forEach((ivld: IVLD): void => {
        this.nodes.push({
          id: ivld.id,
          name: ivld.id,
          reflexive: false,
          type: 'intvl'
        });
      });
    }
  }
  /** Generate and list Internal CP @public */
  public generateInternalCP(vnfdPackageDetails: VNFD): void {
    if (vnfdPackageDetails.vdu !== undefined) {
      vnfdPackageDetails.vdu.forEach((vdu: VDU): void => {
        if (vdu['int-cpd'] !== undefined) {
          vdu['int-cpd'].forEach((intcpd: VDUINTCPD): void => {
            if (intcpd['int-virtual-link-desc'] !== undefined) {
              intcpd['virtual-network-interface-requirement'].forEach((vnir: VNIR): void => {
                this.nodes.push({
                  id: intcpd.id,
                  name: vnir.name,
                  reflexive: false,
                  type: 'intcp'
                });
              });
            }
          });
        }
      });
    }
  }
  /** Generate VDU External and Internal CP Links @public */
  public generateVDUCPLinks(vnfdPackageDetails: VNFD): void {
    if (vnfdPackageDetails.vdu !== undefined) {
      vnfdPackageDetails.vdu.forEach((vdu: VDU): void => {
        const vduLink: string = vdu.id;
        if (vdu['int-cpd'] !== undefined) {
          vdu['int-cpd'].forEach((intCPD: VDUINTCPD): void => {
            if (intCPD['int-virtual-link-desc'] !== undefined) {
              intCPD['virtual-network-interface-requirement'].forEach((vnir: VNIR): void => {
                this.links.push({ source: vduLink, target: intCPD.id });
              });
            } else {
              this.links.push({ source: vduLink, target: intCPD.id });
            }
          });
        }
      });
    }
  }
  /** Generate Network/VLD/Internal VirtualLink, CP Links @public */
  public generateIntVLCPLinks(vnfdPackageDetails: VNFD): void {
    if (vnfdPackageDetails.vdu !== undefined) {
      vnfdPackageDetails.vdu.forEach((vdu: VDU): void => {
        if (vdu['int-cpd'] !== undefined) {
          vdu['int-cpd'].forEach((intCPD: VDUINTCPD): void => {
            const vldName: string = intCPD['int-virtual-link-desc'];
            if (intCPD['int-virtual-link-desc'] !== undefined) {
              intCPD['virtual-network-interface-requirement'].forEach((vnir: VNIR): void => {
                this.links.push({ source: vldName, target: intCPD.id });
              });
            }
          });
        }
      });
    }
  }
  /** VNFD details can be saved on users inputs @public */
  public saveVNFD(): void {
    this.vnfdPackageDetails['product-name'] = this.vnfdInfo['product-name'];
    this.vnfdPackageDetails.description = this.vnfdInfo.description;
    this.vnfdPackageDetails.version = this.vnfdInfo.version;
    this.vnfdPackageDetails.id = this.vnfdInfo.id;
    this.vnfdPackageDetails.provider = this.vnfdInfo.provider;
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** VDU details can be saved on users inputs @public */
  public saveVDU(getVDUID: string): void {
    const getOLDVDUID: string = this.oldVDUID;
    this.vnfdPackageDetails.vdu.forEach((ref: VDU): void => {
      if (ref.id === getVDUID) {
        ref.id = this.vduInfo.id;
        ref.name = this.vduInfo.name;
        ref.description = this.vduInfo.description !== undefined ? this.vduInfo.description : '';
        ref['sw-image-desc'] = this.vduInfo['sw-image-desc'];
      }
    });
    this.vnfdPackageDetails['ext-cpd'].forEach((extCPD: EXTCPD): void => {
      if (extCPD['int-cpd'] !== undefined) {
        if (extCPD['int-cpd']['vdu-id'] === getOLDVDUID) {
          extCPD['int-cpd']['vdu-id'] = this.vduInfo.id;
        }
      }
    });
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** IntVL details can be saved on users inputs @public */
  public saveIntVL(intVLID: string): void {
    const getOldID: string = this.oldintVLID;
    this.vnfdPackageDetails['int-virtual-link-desc'].forEach((ivldDetails: IVLD): void => {
      if (ivldDetails.id === intVLID) {
        ivldDetails.id = this.intvlInfo.id;
      }
    });
    this.vnfdPackageDetails.vdu.forEach((vduDetails: VDU): void => {
      if (vduDetails['int-cpd'] !== undefined) {
        vduDetails['int-cpd'].forEach((intCPDDetails: VDUINTCPD): void => {
          if (intCPDDetails['int-virtual-link-desc'] !== undefined) {
            if (intCPDDetails['int-virtual-link-desc'] === getOldID) {
              intCPDDetails['int-virtual-link-desc'] = this.intvlInfo.id;
            }
          }
        });
      }
    });
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** IntVL details can be saved on users inputs @public */
  public saveCP(cpID: string): void {
    const getOldCP: string = this.oldCPID;
    this.vnfdPackageDetails['ext-cpd'].forEach((ref: EXTCPD): void => {
      if (ref.id === cpID) {
        ref.id = this.cpInfo.id;
      }
    });
    if (this.vnfdPackageDetails['mgmt-cp'] === getOldCP) {
      this.vnfdPackageDetails['mgmt-cp'] = this.cpInfo.id;
    }
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
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
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
  private createNode(nodes: VNFD[]): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    d3.selectAll('svg#graphContainer > *').remove();
    d3.select(window).on('keydown', (): void => { this.keyDown(); });
    d3.select(window).on('keyup', (): void => { this.keyUp(); });
    this.svg = d3.select('#graphContainer')
      .attr('oncontextmenu', 'return false;')
      .attr('viewBox', `0 0 ${graphContainerAttr.width} ${graphContainerAttr.height}`)
      .on('mousemove', (): void => { this.mousemove(); });
    this.force = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: TickPath): string => d.id).distance(graphContainerAttr.distance))
      .force('charge', d3.forceManyBody().strength(graphContainerAttr.strength))
      .force('x', d3.forceX(graphContainerAttr.width / graphContainerAttr.forcex))
      .force('y', d3.forceY(graphContainerAttr.height / graphContainerAttr.forcey))
      .on('tick', (): void => { this.tick(); });
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
    this.path.attr('d', (d: Tick): string => {
      const deltaX: number = d.target.x - d.source.x; const deltaY: number = d.target.y - d.source.y;
      const dist: number = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const normX: number = deltaX / dist; const normY: number = deltaY / dist;
      const sourcePadding: number = d.left ? graphContainerAttr.sourcePaddingYes : graphContainerAttr.sourcePaddingNo;
      const targetPadding: number = d.right ? graphContainerAttr.targetPaddingYes : graphContainerAttr.targetPaddingNo;
      const sourceX: number = d.source.x + (sourcePadding * normX); const sourceY: number = d.source.y + (sourcePadding * normY);
      const targetX: number = d.target.x - (targetPadding * normX); const targetY: number = d.target.y - (targetPadding * normY);
      return `M${sourceX},${sourceY}L${targetX},${targetY}`;
    }).on('dblclick', (d: Tick): void => { this.getDeleteLinkConfirmation(d); });
    this.network.attr('transform', (d: TickPath): string => `translate(${d.x},${d.y})`);
    this.virutualDeploymentUnit.attr('transform', (d: TickPath): string => `translate(${d.x},${d.y})`);
    this.connectionPoint.attr('transform', (d: TickPath): string => `translate(${d.x},${d.y})`);
    this.intConnectionPoint.attr('transform', (d: TickPath): string => `translate(${d.x},${d.y})`);
  }
  /** Update graph (called when needed) @private */
  private restart(nodes: VNFD[]): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.path = this.path.data(this.links);
    const cpNodes: {}[] = []; const vduNodes: {}[] = []; const vlNodes: {}[] = []; const intcpNodes: {}[] = []; //Nodes are known by id
    nodes.forEach((nodeList: COMPOSERNODES): void => {
      if (nodeList.type === 'cp') { cpNodes.push(nodeList); }
      else if (nodeList.type === 'vdu') { vduNodes.push(nodeList); }
      else if (nodeList.type === 'intvl') { vlNodes.push(nodeList); }
      else if (nodeList.type === 'intcp') { intcpNodes.push(nodeList); }
    });
    this.network = this.network.data(vlNodes, (d: VNFD): string => d.id);
    this.virutualDeploymentUnit = this.virutualDeploymentUnit.data(vduNodes, (d: VNFD): string => d.id);
    this.connectionPoint = this.connectionPoint.data(cpNodes, (d: VNFD): string => d.id);
    this.intConnectionPoint = this.intConnectionPoint.data(intcpNodes, (d: VNFD): string => d.id);
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
      .call(this.onDragDrop())
      .attr('id', (d: COMPOSERNODES): string => { return d.id; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/INTVL.svg')
      .on('mousedown', (d: COMPOSERNODES): void => { this.mouseDown(d); })
      .on('mouseup', (d: COMPOSERNODES): void => { this.mouseUp(d); })
      .on('click', (d: COMPOSERNODES): void => { this.singleClick(this.network, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: COMPOSERNODES): void => { this.getDeleteNodeConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gNetwork.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES): string => d.id);
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
      .call(this.onDragDrop())
      .attr('id', (d: COMPOSERNODES): string => { return d.id; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/VDU.svg')
      .on('mousedown', (d: COMPOSERNODES): void => { this.mouseDown(d); })
      .on('mouseup', (d: COMPOSERNODES): void => { this.mouseUp(d); })
      .on('click', (d: COMPOSERNODES): void => { this.singleClick(this.virutualDeploymentUnit, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: COMPOSERNODES): void => { this.getDeleteNodeConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gVirutualDeploymentUnit.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES): string => d.id);
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
      .call(this.onDragDrop())
      .attr('id', (d: COMPOSERNODES): string => { return d.id; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/CP-VNF.svg')
      .on('mousedown', (d: COMPOSERNODES): void => { this.mouseDown(d); })
      .on('mouseup', (d: COMPOSERNODES): void => { this.mouseUp(d); })
      .on('click', (d: COMPOSERNODES): void => { this.singleClick(this.connectionPoint, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: COMPOSERNODES): void => { this.getDeleteNodeConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gConnectionPoint.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES): string => d.name);
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
      .call(this.onDragDrop())
      .attr('id', (d: COMPOSERNODES): string => { return d.id; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/INTCP.svg')
      .on('mousedown', (d: COMPOSERNODES): void => { this.mouseDown(d); })
      .on('mouseup', (d: COMPOSERNODES): void => { this.mouseUp(d); })
      .on('click', (d: COMPOSERNODES): void => { this.singleClick(this.intConnectionPoint, d); this.onNodeClickToggleSidebar(); })
      .on('dblclick', (d: COMPOSERNODES): void => { this.getDeleteNodeConfirmation(d); this.onNodedblClickToggleSidebar(); });
    this.gIntConnectionPoint.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES): string => d.name);
  }
  /** Drop VDU Composer Data @private */
  private vduDropCompose(): void {
    const randomID: string = this.sharedService.randomString();
    if (this.vnfdPackageDetails['mgmt-cp'] === undefined) {
      this.notifierService.notify('error', this.translateService.instant('PAGE.TOPOLOGY.ADDCPBEFOREVDU'));
    } else {
      if (this.vnfdPackageDetails.vdu === undefined) {
        this.vnfdPackageDetails.vdu = [];
      }
      this.vnfdPackageDetails.vdu.push({
        id: 'vdu_' + randomID,
        name: 'vdu_' + randomID,
        description: '',
        'sw-image-desc': 'ubuntu',
        'int-cpd': [],
        'monitoring-parameter': [],
        'virtual-compute-desc': '',
        'virtual-storage-desc': []
      });
      this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
    }
  }
  /** Drop CP Composer Data @private */
  private cpDropCompose(): void {
    const randomID: string = this.sharedService.randomString();
    if (this.vnfdPackageDetails['ext-cpd'] === undefined) {
      this.vnfdPackageDetails['ext-cpd'] = [];
    }
    this.vnfdPackageDetails['ext-cpd'].push({
      id: 'cp_' + randomID,
      'int-cpd': {}
    });
    if (this.vnfdPackageDetails['mgmt-cp'] === undefined) {
      this.vnfdPackageDetails['mgmt-cp'] = 'cp_' + randomID;
    }
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** Drop IntVL Composer Data @private */
  private intvlDropCompose(): void {
    const randomID: string = this.sharedService.randomString();
    if (this.vnfdPackageDetails['int-virtual-link-desc'] === undefined) {
      this.vnfdPackageDetails['int-virtual-link-desc'] = [];
    }
    this.vnfdPackageDetails['int-virtual-link-desc'].push({
      id: 'vnf_vl_' + randomID
    });
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
  }
  /** Add the Add Nodes Data @private */
  private addNodes(apiURL: string, identifier: string, data: VNFD): void {
    this.isLoadingResults = true;
    const apiURLHeader: APIURLHEADER = {
      url: apiURL + '/' + identifier + '/package_content',
      httpOptions: { headers: this.headers }
    };
    const vnfData: VNFDATA = {};
    vnfData.vnfd = data;
    const descriptorInfo: string = jsyaml.dump(vnfData, { sortKeys: true });
    this.sharedService.targzFile({ packageType: 'vnfd', id: this.identifier, descriptor: descriptorInfo })
      .then((content: ArrayBuffer): void => {
        this.restService.putResource(apiURLHeader, content).subscribe((res: {}): void => {
          this.generateData();
          this.notifierService.notify('success', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.UPDATEDSUCCESSFULLY'));
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
  /** Events handles when mousedown click it will capture the selected node data @private */
  private mouseDown(d: COMPOSERNODES): void {
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
  private mouseUp(d: COMPOSERNODES): void {
    if (!this.mousedownNode) { return; }
    this.dragLine.classed('hidden', true);
    this.mouseupNode = d;
    if (this.mousedownNode.type === 'vdu') {
      this.vduMouseDownNode();
    } else if (this.mousedownNode.type === 'cp') {
      this.cpMouseDownNode();
    } else if (this.mousedownNode.type === 'intvl') {
      this.intVLMouseDownNode();
    } else if (this.mousedownNode.type === 'intcp') {
      this.intCPMouseDownNode();
    } else {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.INVALIDSELECTION'));
      this.deselectPath();
    }
    this.resetMouseActions();
    this.currentSelectedNode = null;
  }
  /** Establish a connection point between vdu and other nodes @private */
  private vduMouseDownNode(): void {
    if (this.mousedownNode.type === 'vdu' && this.mouseupNode.type === 'cp') {
      this.vduCPConnection(this.mousedownNode.id, this.mouseupNode.id);
    } else if (this.mousedownNode.type === 'vdu' && this.mouseupNode.type === 'intcp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKVDUANDINTCP'));
      this.deselectPath();
    } else if (this.mousedownNode.type === 'vdu' && this.mouseupNode.type === 'vdu') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKVDUANDVDU'));
      this.deselectPath();
    } else if (this.mousedownNode.type === 'vdu' && this.mouseupNode.type === 'intvl') {
      this.vduIntvlConnection(this.mousedownNode.id, this.mouseupNode.id);
    }
  }
  /** Establish a connection point between cp and other nodes @private */
  private cpMouseDownNode(): void {
    if (this.mousedownNode.type === 'cp' && this.mouseupNode.type === 'vdu') {
      this.vduCPConnection(this.mouseupNode.id, this.mousedownNode.id);
    } else if (this.mousedownNode.type === 'cp' && this.mouseupNode.type === 'intvl') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKCPANDVNFVL'));
      this.deselectPath();
    } else if (this.mousedownNode.type === 'cp' && this.mouseupNode.type === 'intcp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKCPANDINTCP'));
      this.deselectPath();
    } else if (this.mousedownNode.type === 'cp' && this.mouseupNode.type === 'cp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKCPANDCP'));
      this.deselectPath();
    }
  }
  /** Establish a connection piont between intvl and other nodes @private */
  private intVLMouseDownNode(): void {
    if (this.mousedownNode.type === 'intvl' && this.mouseupNode.type === 'cp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKVNFVLANDCP'));
      this.deselectPath();
    } else if (this.mousedownNode.type === 'intvl' && this.mouseupNode.type === 'vdu') {
      this.vduIntvlConnection(this.mouseupNode.id, this.mousedownNode.id);
    } else if (this.mousedownNode.type === 'intvl' && this.mouseupNode.type === 'intvl') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKVNFVLANDVNFVL'));
      this.deselectPath();
    } else if (this.mousedownNode.type === 'intvl' && this.mouseupNode.type === 'intcp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKVNFVLANDONTCP'));
      this.deselectPath();
    }
  }
  /** Establish a connection point between intcp and other nodes @private */
  private intCPMouseDownNode(): void {
    if (this.mousedownNode.type === 'intcp' && this.mouseupNode.type === 'vdu') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKINTCPANDVDU'));
      this.deselectPath();
    } else if (this.mousedownNode.type === 'intcp' && this.mouseupNode.type === 'cp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKINTCPANDCP'));
      this.deselectPath();
    } else if (this.mousedownNode.type === 'intcp' && this.mouseupNode.type === 'intvl') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKINTCPANDVNFVL'));
      this.deselectPath();
    } else if (this.mousedownNode.type === 'intcp' && this.mouseupNode.type === 'intcp') {
      this.notifierService.notify('warning', this.translateService.instant('PAGE.VNFPACKAGE.VNFCOMPOSE.CANNOTLINKINTCPANDINTCP'));
      this.deselectPath();
    }
  }
  /** Establish a connection between VDU & CP vice versa @private */
  private vduCPConnection(nodeA: string, nodeB: string): void {
    const vduExternalID: string = nodeA + '-eth_' + this.sharedService.randomString();
    if (this.vnfdPackageDetails.vdu !== undefined) {
      this.vnfdPackageDetails.vdu.forEach((vdu: VDU): void => {
        const vduID: string = vdu.id;
        if (vdu.id === nodeA) {
          if (this.vnfdPackageDetails['ext-cpd'] !== undefined) {
            this.vnfdPackageDetails['ext-cpd'].forEach((extcpd: EXTCPD, index: number): void => {
              if (extcpd.id === nodeB) {
                if (vdu['int-cpd'] === undefined) {
                  vdu['int-cpd'] = [];
                }
                vdu['int-cpd'].push({
                  id: vduExternalID,
                  'virtual-network-interface-requirement': [
                    {
                      name: vduExternalID,
                      position: 1,
                      'virtual-interface': { type: 'PARAVIRT' }
                    }
                  ]
                });
                this.vnfdPackageDetails['ext-cpd'][index] = {
                  id: extcpd.id,
                  'int-cpd': {
                    cpd: vduExternalID,
                    'vdu-id': vduID
                  }
                };
              }
            });
          }
        }
      });
    }
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
    this.deselectPath();
  }
  /** Establish a connection between vdu & intvl and vice versa @private */
  private vduIntvlConnection(nodeA: string, nodeB: string): void {
    const vduInternalID: string = nodeA + '-eth_' + this.sharedService.randomString();
    if (this.vnfdPackageDetails.vdu !== undefined) {
      this.vnfdPackageDetails.vdu.forEach((vdu: VDU): void => {
        if (vdu.id === nodeA) {
          if (vdu['int-cpd'] === undefined) {
            vdu['int-cpd'] = [];
          }
          vdu['int-cpd'].push({
            id: vduInternalID,
            'int-virtual-link-desc': nodeB,
            'virtual-network-interface-requirement': [
              {
                name: vduInternalID,
                position: 1,
                'virtual-interface': { type: 'PARAVIRT' }
              }
            ]
          });
        }
      });
    }
    this.addNodes(environment.VNFPACKAGES_URL, this.identifier, this.vnfdPackageDetails);
    this.deselectPath();
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
  /** drag event @private */
  // tslint:disable-next-line: no-any
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
  private singleClick(nodeSelected: any, d: COMPOSERNODES): void {
    this.selectedNode(nodeSelected, d);
  }
  /** Get confirmation Before Deleting the Node in Topology @private */
  private getDeleteNodeConfirmation(d: COMPOSERNODES): void {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationTopologyComponent, { backdrop: 'static' });
    modalRef.componentInstance.topologyType = 'Delete';
    modalRef.componentInstance.topologyname = d.name;
    if (d.type === 'vdu') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.VDU';
    } else if (d.type === 'intvl') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.INTVL';
    } else if (d.type === 'cp') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.CONNECTIONPOINT';
    } else if (d.type === 'intcp') {
      modalRef.componentInstance.topologytitle = 'PAGE.TOPOLOGY.INTCP';
    }
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        this.deleteNode(d);
      }
    }).catch();
  }
  /** Delete nodes @private */
  private deleteNode(d: COMPOSERNODES): void {
    // tslint:disable-next-line: max-func-body-length
    this.nodes.forEach((node: VNFD): void => {
      if (node.id === d.id) {
        if (d.type === 'cp') {
          if (this.vnfdPackageDetails['ext-cpd'] !== undefined) {
            let getRelatedVDUCPD: string; let getRelatedVDUID: string;
            const posExtCPD: number = this.vnfdPackageDetails['ext-cpd'].findIndex((e: EXTCPD): boolean => {
              if (e.id === d.name) {
                if (e['int-cpd'] !== undefined) {
                  getRelatedVDUCPD = e['int-cpd'].cpd; getRelatedVDUID = e['int-cpd']['vdu-id'];
                }
                return true;
              } else {
                return false;
              }
            });
            if (posExtCPD !== -1) {
              this.vnfdPackageDetails['ext-cpd'].splice(posExtCPD, 1);
            }
            if (getRelatedVDUCPD !== undefined && getRelatedVDUID !== undefined) {
              this.vnfdPackageDetails.vdu.forEach((vdu: VDU): void => {
                if (vdu.id === getRelatedVDUID) {
                  const posINTCPD: number = vdu['int-cpd'].findIndex((intCPD: VDUINTCPD): boolean => {
                    return intCPD.id === getRelatedVDUCPD;
                  });
                  if (posINTCPD !== -1) {
                    vdu['int-cpd'].splice(posINTCPD, 1);
                  }
                }
              });
            }
          }
        } else if (d.type === 'intcp') {
          this.vnfdPackageDetails.vdu.forEach((vdu: VDU): void => {
            const posINTCPD: number = vdu['int-cpd'].findIndex((intCPD: VDUINTCPD): boolean => {
              return intCPD.id === d.id;
            });
            if (posINTCPD !== -1) {
              vdu['int-cpd'].splice(posINTCPD, 1);
            }
          });
        } else if (d.type === 'intvl') {
          const posINTVLD: number = this.vnfdPackageDetails['int-virtual-link-desc'].findIndex((intVLD: IVLD): boolean => {
            return intVLD.id === d.id;
          });
          if (posINTVLD !== -1) {
            this.vnfdPackageDetails['int-virtual-link-desc'].splice(posINTVLD, 1);
          }
          if (this.vnfdPackageDetails.vdu !== undefined) {
            this.vnfdPackageDetails.vdu.forEach((vduDetails: VDU): void => {
              if (vduDetails['int-cpd'] !== undefined) {
                const newVDUintCPDArray: VDUINTCPD[] = vduDetails['int-cpd'].filter((item: VDUINTCPD): boolean => {
                  return item['int-virtual-link-desc'] !== undefined ? item['int-virtual-link-desc'] !== d.id ? true : false : true;
                });
                vduDetails['int-cpd'] = newVDUintCPDArray;
              }
            });
          }
        } else if (d.type === 'vdu') {
          const getRelatedExtCPD: string[] = [];
          const posVDU: number = this.vnfdPackageDetails.vdu.findIndex((vduDetails: VDU): boolean => {
            if (vduDetails.id === d.id) {
              if (vduDetails['int-cpd'] !== undefined) {
                vduDetails['int-cpd'].forEach((intCPDDetails: VDUINTCPD): void => {
                  if (intCPDDetails['int-virtual-link-desc'] === undefined) {
                    getRelatedExtCPD.push(intCPDDetails.id);
                  }
                });
              }
              return true;
            } else {
              return false;
            }
          });
          if (posVDU !== -1) {
            this.vnfdPackageDetails.vdu.splice(posVDU, 1);
          }
          getRelatedExtCPD.forEach((CPDID: string, index: number): void => {
            this.vnfdPackageDetails['ext-cpd'].forEach((extCPD: EXTCPD): void => {
              if (extCPD['int-cpd'] !== undefined) {
                if (extCPD['int-cpd'].cpd === CPDID) {
                  extCPD['int-cpd'] = {};
                }
              }
            });
          });
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
  private selectedNode(nodeSeleced: any, d: COMPOSERNODES): void {
    const alreadyIsActive: boolean = nodeSeleced.select('#' + d.id).classed(this.activeNode);
    this.deselectAllNodes();
    nodeSeleced.select('#' + d.id).classed(this.activeNode, !alreadyIsActive);
    if (d.type === 'vdu' && !alreadyIsActive) {
      this.vnfdPackageDetails.vdu.forEach((res: VDU): void => {
        if (res.id === d.id) {
          this.showRightSideInfo = 'vduInfo';
          this.vduInfo = res;
          this.oldVDUID = res.id;
        }
      });
    } else if (d.type === 'cp' && !alreadyIsActive) {
      this.vnfdPackageDetails['ext-cpd'].forEach((cp: EXTCPD): void => {
        const getCPDID: string = cp['int-cpd'] !== undefined ? cp['int-cpd'].cpd : cp.id;
        if (getCPDID === d.id) {
          this.showRightSideInfo = 'cpInfo';
          this.cpInfo = cp;
          this.oldCPID = cp.id;
        }
      });
    } else if (d.type === 'intvl' && !alreadyIsActive) {
      this.vnfdPackageDetails['int-virtual-link-desc'].forEach((ivld: IVLD): void => {
        if (ivld.id === d.id) {
          this.showRightSideInfo = 'intvlInfo';
          this.intvlInfo = ivld;
          this.oldintVLID = ivld.id;
        }
      });
    } else if (d.type === 'intcp' && !alreadyIsActive) {
      this.vnfdPackageDetails.vdu.forEach((vdu: VDU): void => {
        vdu['int-cpd'].forEach((intcpd: VDUINTCPD): void => {
          if (intcpd.id === d.id) {
            if (intcpd['int-virtual-link-desc'] !== undefined) {
              intcpd['virtual-network-interface-requirement'].forEach((vnir: VNIR): void => {
                this.intcpInfo = vnir;
                this.showRightSideInfo = 'intcpInfo';
              });
            }
          }
        });
      });
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
