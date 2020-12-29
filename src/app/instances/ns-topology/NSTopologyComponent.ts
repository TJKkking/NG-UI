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
 * @file NS Topology Component
 */
/* tslint:disable:no-increment-decrement */
import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ERRORDATA } from 'CommonModel';
import * as d3 from 'd3';
import { environment } from 'environment';
import * as HttpStatus from 'http-status-codes';
import { CCI, DF, VLC, VNFPROFILE } from 'NSDModel';
import { COMPOSERNODES, CONNECTIONPOINT, NSD, NSDVLD, NSINFO, NSInstanceDetails, NSINSTANCENODES, VLINFO, VNFRINFO } from 'NSInstanceModel';
import { GRAPHDETAILS, Tick, TickPath } from 'NSTopologyModel';
import { RestService } from 'src/services/RestService';
import { isNullOrUndefined } from 'util';

/**
 * Creating component
 * @Component takes NSTopologyComponent.html as template url
 */
@Component({
  selector: 'app-ns-topology',
  templateUrl: './NSTopologyComponent.html',
  styleUrls: ['./NSTopologyComponent.scss'],
  encapsulation: ViewEncapsulation.None
})
/** Exporting a class @exports NSTopologyComponent */
export class NSTopologyComponent {
  /** Injector to invoke other services @public */
  public injector: Injector;
  /** View child contains graphContainer ref @public  */
  @ViewChild('graphContainer', { static: true }) public graphContainer: ElementRef;
  /** Holds the basic information of NS @public */
  public nsInfo: NSINFO;
  /** Contains tranlsate instance @private */
  public translateService: TranslateService;
  /** Add the activeclass for the selected @public */
  public activeClass: string = 'active';
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
  public sideBarOpened: boolean = true;
  /** Need to show the NS Details @public */
  public isShowNSDetails: boolean = true;
  /** Need to show the VL Details @public */
  public isShowVLetails: boolean = false;
  /** Need to show the VNFR Details @public */
  public isShowVNFRDetails: boolean = false;
  /** Show right side info of Virtual Link @public */
  public virtualLink: VLINFO;
  /** Show right side info of Virtual Link @public */
  public vnfr: VNFRINFO;

  /** Contains lastkeypressed instance @private */
  private lastKeyDown: number = -1;
  /** Instance of the rest service @private */
  private restService: RestService;
  /** Holds the instance of AuthService class of type AuthService @private */
  private activatedRoute: ActivatedRoute;
  /** Holds the NS Id @private */
  private nsIdentifier: string;
  /** Contains SVG attributes @private */
  // tslint:disable-next-line:no-any
  private svg: any;
  /** Contains forced node animations @private */
  // tslint:disable-next-line:no-any
  private force: any;
  /** Contains path information of the node */
  // tslint:disable-next-line:no-any
  private path: any;
  /** Contains node network @private */
  // tslint:disable-next-line:no-any
  private network: any;
  /** Contains node square @private */
  // tslint:disable-next-line:no-any
  private square: any;
  /** Contains node circle @private */
  // tslint:disable-next-line:no-any
  private circle: any;
  /** Contains the NS information @private */
  private nsData: NSInstanceDetails;
  /** Contains NDS information of a descriptors */
  private nsdData: NSD;
  /** Contains node information @private */
  private nodes: NSINSTANCENODES[] = [];
  /** Contains links information @private */
  private links: {}[] = [];
  /** holds cp count/iteration @private */
  private cpCount: number;
  /** VNFD nodes @private */
  private vnfdNodes: {}[] = [];
  /** VLD nodes @private */
  private vldNodes: {}[] = [];
  /** Connection CP nodes @private */
  private cpNodes: {}[] = [];
  /** Set timeout @private */
  private TIMEOUT: number = 2000;
  /** Rendered nodes represent vnf @private */
  // tslint:disable-next-line:no-any
  private gSquare: any;
  /** Rendered nodes represent network @private */
  // tslint:disable-next-line:no-any
  private gNetwork: any;
  /** Rendered nodes represent network @private */
  // tslint:disable-next-line:no-any
  private gCircle: any;
  /** Service holds the router information @private */
  private router: Router;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.translateService = this.injector.get(TranslateService);
    this.router = this.injector.get(Router);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate @public
   */
  public ngOnInit(): void {
    // tslint:disable-next-line:no-backbone-get-set-outside-model
    this.nsIdentifier = this.activatedRoute.snapshot.paramMap.get('id');
    this.generateData();
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
    this.showRightSideInfo(true, false, false);
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
  /** Show the right-side information @private */
  private showRightSideInfo(nsDetails: boolean, vlDetails: boolean, vnfrDeails: boolean): void {
    this.isShowNSDetails = nsDetails;
    this.isShowVLetails = vlDetails;
    this.isShowVNFRDetails = vnfrDeails;
  }
  /** De-select all the selected nodes @private */
  private deselectAllNodes(): void {
    this.square.select('image').classed(this.activeClass, false);
    this.network.select('image').classed(this.activeClass, false);
    this.circle.select('image').classed(this.activeClass, false);
  }
  /** Prepare all the information for node creation @private */
  private generateData(): void {
    this.restService.getResource(environment.NSINSTANCESCONTENT_URL + '/' + this.nsIdentifier)
      .subscribe((nsData: NSInstanceDetails): void => {
        this.nsData = nsData;
        this.nsInfo = {
          nsInstanceID: nsData._id,
          nsName: nsData.name,
          nsOperationalStatus: nsData['operational-status'],
          nsConfigStatus: nsData['config-status'],
          nsDetailedStatus: nsData['detailed-status'],
          nsResourceOrchestrator: nsData['resource-orchestrator']
        };
        if (this.nsData['constituent-vnfr-ref'] !== undefined) {
          this.generateVNFRCPNodes();
        }
        if (this.nsData.vld !== undefined) {
          this.generateVLDNetworkNodes();
        }
        setTimeout((): void => {
          this.pushAllNodes();
          this.generateVNFDCP();
          this.generateVLDCP();
          this.isLoadingResults = false;
          this.createNode(this.nodes, this.links);
        }, this.TIMEOUT);
      }, (error: ERRORDATA): void => {
        this.isLoadingResults = false;
        if (error.error.status === HttpStatus.NOT_FOUND || error.error.status === HttpStatus.UNAUTHORIZED) {
          this.router.navigateByUrl('404', { skipLocationChange: true }).catch();
        } else {
          this.restService.handleError(error, 'get');
        }
      });
  }
  /** Fetching all the VNFR Information @private */
  private generateVNFRCPNodes(): void {
    this.nsData['constituent-vnfr-ref'].forEach((vnfdrID: string): void => {
      this.restService.getResource(environment.VNFINSTANCES_URL + '/' + vnfdrID).subscribe((vndfrDetail: NSD): void => {
        this.nodes.push({
          id: vndfrDetail['vnfd-ref'] + ':' + vndfrDetail['member-vnf-index-ref'],
          nodeTypeRef: 'vnfd',
          cp: vndfrDetail['connection-point'],
          vdur: vndfrDetail.vdur,
          nsID: vndfrDetail['nsr-id-ref'],
          vnfdID: vndfrDetail['vnfd-id'],
          vimID: vndfrDetail['vim-account-id'],
          vndfrID: vndfrDetail.id,
          ipAddress: vndfrDetail['ip-address'],
          memberIndex: vndfrDetail['member-vnf-index-ref'],
          vnfdRef: vndfrDetail['vnfd-ref'],
          selectorId: 'nsInst-' + vndfrDetail.id
        });
        // Fetching all the connection point of VNF & Interface
        vndfrDetail['connection-point'].forEach((cp: CONNECTIONPOINT): void => {
          this.nodes.push({
            id: cp.name + ':' + vndfrDetail['member-vnf-index-ref'],
            vndfCPRef: vndfrDetail['vnfd-ref'] + ':' + vndfrDetail['member-vnf-index-ref'],
            nodeTypeRef: 'cp',
            name: cp.name
          });
        });
      }, (error: ERRORDATA): void => {
        this.restService.handleError(error, 'get');
      });
    });
  }
  /** Fetching all the VLD/Network Information @private */
  private generateVLDNetworkNodes(): void {
    this.nsdData = this.nsData.nsd;
    this.nsdData['virtual-link-desc'].forEach((ref: NSDVLD): void => {
      this.nodes.push({
        id: ref.id,
        nodeTypeRef: 'vld',
        name: ref.id,
        type: ref.type,
        vnfdCP: this.nsdData.df,
        vimNetworkName: ref['vim-network-name'],
        selectorId: 'nsInst-' + ref.id
      });
    });
  }
  /** Pushing connection points of path/links nodes @private */
  private pushAllNodes(): void {
    this.nodes.forEach((nodeList: NSINSTANCENODES): void => {
      if (nodeList.nodeTypeRef === 'vnfd') {
        this.vnfdNodes.push(nodeList);
      } else if (nodeList.nodeTypeRef === 'vld') {
        this.vldNodes.push(nodeList);
      } else if (nodeList.nodeTypeRef === 'cp') {
        this.cpNodes.push(nodeList);
      }
    });
  }
  /** Get CP position based on vndf @private */
  private generateVNFDCP(): void {
    this.vnfdNodes.forEach((list: NSINSTANCENODES): void => {
      const vndfPos: number = this.nodes.map((e: NSINSTANCENODES): string => { return e.id; }).indexOf(list.id);
      this.cpCount = 0;
      this.nodes.forEach((res: NSINSTANCENODES): void => {
        if (res.nodeTypeRef === 'cp' && res.vndfCPRef === list.id) {
          this.links.push({ source: this.nodes[vndfPos], target: this.nodes[this.cpCount] });
        }
        this.cpCount++;
      });
    });
  }
  /** Get CP position based on vld @private */
  private generateVLDCP(): void {
    let vldPos: number = 0;
    this.vldNodes.forEach((list: NSINSTANCENODES): void => {
      if (!isNullOrUndefined(list.vnfdCP)) {
        list.vnfdCP.forEach((cpRef: DF): void => {
          cpRef['vnf-profile'].forEach((vnfProfile: VNFPROFILE): void => {
            vnfProfile['virtual-link-connectivity'].forEach((resultVLC: VLC, index: number): void => {
              resultVLC['constituent-cpd-id'].forEach((resultCCI: CCI): void => {
                this.cpCount = 0;
                this.nodes.forEach((res: NSINSTANCENODES): void => {
                  if (res.nodeTypeRef === 'cp' &&
                    res.id === resultCCI['constituent-cpd-id'] + ':' + resultCCI['constituent-base-element-id']) {
                    this.links.push({ source: this.nodes[vldPos], target: this.nodes[this.cpCount] });
                  }
                  this.cpCount++;
                });
              });
            });
          });
        });
        vldPos++;
      }
    });
  }
  /** Node is created and render at D3 region @private */
  private createNode(nodes: NSINSTANCENODES[], links: {}[]): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    d3.selectAll('svg#graphContainer > *').remove();
    d3.select(window).on('keydown', (): void => { this.keyDown(); });
    d3.select(window).on('keyup', (): void => { this.keyUp(); });
    this.svg = d3.select('#graphContainer')
      .attr('oncontextmenu', 'return false;')
      .attr('width', graphContainerAttr.width)
      .attr('height', graphContainerAttr.height);
    this.force = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(graphContainerAttr.strength))
      .force('link', d3.forceLink().id((d: TickPath): string => d.id).distance(graphContainerAttr.distance))
      .force('center', d3.forceCenter(graphContainerAttr.width / graphContainerAttr.forcex,
        graphContainerAttr.height / graphContainerAttr.forcey))
      .force('x', d3.forceX(graphContainerAttr.width / graphContainerAttr.forcex))
      .force('y', d3.forceY(graphContainerAttr.height / graphContainerAttr.forcey))
      .on('tick', (): void => { this.tick(); });
    // handles to link and node element groups
    this.path = this.svg.append('svg:g').selectAll('path');
    this.network = this.svg.append('svg:g').selectAll('network');
    this.square = this.svg.append('svg:g').selectAll('rect');
    this.circle = this.svg.append('svg:g').selectAll('circle');
    this.restart(nodes, links);
  }
  /** Update force layout (called automatically each iteration) @private */
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
    });
    this.network.attr('transform', (t: TickPath): string => `translate(${t.x},${t.y})`);
    this.square.attr('transform', (t: TickPath): string => `translate(${t.x},${t.y})`);
    this.circle.attr('transform', (t: TickPath): string => `translate(${t.x},${t.y})`);
  }
  /** Update graph (called when needed) @private */
  private restart(nodes: NSINSTANCENODES[], links: {}[]): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.path = this.path.data(links);
    const vnfdNodes: {}[] = []; const vldNodes: {}[] = []; const cpNodes: {}[] = []; // NB: Nodes are known by id, not by index!
    nodes.forEach((nodeList: NSINSTANCENODES): void => {
      if (nodeList.nodeTypeRef === 'vnfd') { vnfdNodes.push(nodeList); }
      else if (nodeList.nodeTypeRef === 'vld') { vldNodes.push(nodeList); }
      else if (nodeList.nodeTypeRef === 'cp') { cpNodes.push(nodeList); }
    });
    this.square = this.square.data(vnfdNodes, (d: COMPOSERNODES): string => d.id);
    this.network = this.network.data(vldNodes, (d: COMPOSERNODES): string => d.id);
    this.circle = this.circle.data(cpNodes, (d: COMPOSERNODES): string => d.id);
    this.resetAndCreateNodes();
    this.force.nodes(nodes).force('link').links(links); //Set the graph in motion
    this.force.alphaTarget(graphContainerAttr.alphaTarget).restart();
  }
  /** Rest and create nodes @private */
  private resetAndCreateNodes(): void {
    this.path.exit().remove();
    this.square.exit().remove();
    this.network.exit().remove();
    this.circle.exit().remove();
    // tslint:disable-next-line:no-any
    const gPath: any = this.path.enter().append('svg:path').attr('class', 'link');
    this.getgSquare();
    this.getgNetwork();
    this.getgCircle();
    this.square = this.gSquare.merge(this.square);
    this.network = this.gNetwork.merge(this.network);
    this.path = gPath.merge(this.path);
    this.circle = this.gCircle.merge(this.circle);
  }
  /** Events handles when Shift Click to perform create cp @private */
  // tslint:disable-next-line: no-any
  private singleClick(nodeSelected: any, d: COMPOSERNODES): void {
    this.selectNodeExclusive(nodeSelected, d);
  }
  /** Selected nodes @private */
  // tslint:disable-next-line: no-any
  private selectNodeExclusive(nodeSelected: any, d: COMPOSERNODES): void {
    const alreadyIsActive: boolean = nodeSelected.select('#' + d.selectorId).classed(this.activeClass);
    this.deselectAllNodes();
    nodeSelected.select('#' + d.selectorId).classed(this.activeClass, !alreadyIsActive);
    if (d.nodeTypeRef === 'vld' && !alreadyIsActive) {
      this.virtualLink = {
        id: d.id,
        name: d.name,
        type: d.type,
        shortName: d.shortName,
        vimNetworkName: d.vimNetworkName
      };
      this.showRightSideInfo(false, true, false);
    } else if (d.nodeTypeRef === 'vnfd' && !alreadyIsActive) {
      this.vnfr = {
        vimID: d.vimID,
        _id: d.vndfrID,
        ip: d.ipAddress,
        nsrID: d.nsID,
        id: d.selectorId,
        vnfdRef: d.vnfdRef,
        vnfdId: d.vnfdID,
        memberIndex: d.memberIndex
      };
      this.showRightSideInfo(false, false, true);
    } else {
      this.showRightSideInfo(true, false, false);
    }
  }
  /** Setting all the square/vnf attributes of nodes @private */
  private getgSquare(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.gSquare = this.square.enter().append('svg:g');
    this.gSquare.append('svg:circle').attr('r', graphContainerAttr.radius).style('fill', '#eeeeee');
    this.gSquare.append('svg:image')
      .style('opacity', 1)
      .attr('x', graphContainerAttr.imageX)
      .attr('y', graphContainerAttr.imageY)
      .call(this.onDragDrop())
      .attr('id', (d: COMPOSERNODES): string => { return d.selectorId; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/VNFD.svg')
      .on('click', (d: COMPOSERNODES): void => { this.singleClick(this.gSquare, d); this.onNodeClickToggleSidebar(); });
    this.gSquare.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES): string => d.id);
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
      .attr('id', (d: COMPOSERNODES): string => { return d.selectorId; })
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/VL.svg')
      .on('click', (d: COMPOSERNODES): void => { this.singleClick(this.gNetwork, d); this.onNodeClickToggleSidebar(); });
    this.gNetwork.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES): string => d.name);
  }
  /** Settings all the connection point attributes of nodes @private */
  private getgCircle(): void {
    const graphContainerAttr: GRAPHDETAILS = this.getGraphContainerAttr();
    this.gCircle = this.circle.enter().append('svg:g');
    this.gCircle.append('svg:circle').attr('r', graphContainerAttr.radius).style('fill', '#eeeeee');
    this.gCircle.append('svg:image')
      .style('opacity', 1)
      .attr('x', graphContainerAttr.imageX)
      .attr('y', graphContainerAttr.imageY)
      .call(this.onDragDrop())
      .attr('class', 'node').attr('width', graphContainerAttr.nodeWidth).attr('height', graphContainerAttr.nodeHeight)
      .attr('xlink:href', 'assets/images/CP.svg');
    this.gCircle.append('svg:text')
      .attr('class', 'node_text')
      .attr('y', graphContainerAttr.textY)
      .text((d: COMPOSERNODES): string => d.name);
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
      this.gSquare.call(d3.drag()
        .on('start', this.dragstarted).on('drag', this.dragged).on('end', this.dragended)
      );
      this.gNetwork.call(d3.drag()
        .on('start', this.dragstarted).on('drag', this.dragged).on('end', this.dragended)
      );
      this.gCircle.call(d3.drag()
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
      this.gSquare.on('.drag', null);
      this.gNetwork.on('.drag', null);
      this.gCircle.on('.drag', null);
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
  /** Events handles when node single click   @private */
  private onNodeClickToggleSidebar(): void {
    this.sideBarOpened = true;
  }
}
