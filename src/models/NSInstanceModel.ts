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
 * @file  Model for NS Instance related information.
 */
// tslint:disable: completed-docs
import { DF, VLD } from 'NSDModel';
import { VNFDAdminDetails } from 'VNFDModel';

/** Interface for NSInstanceDetails */
export interface NSInstanceDetails {
    'orchestration-progress': JSON;
    'constituent-vnfr-ref': string[];
    'operational-events': string[];
    admin: Admin;
    'ssh-authorized-key': string;
    _admin: _Admin;
    'admin-status': string;
    'operational-status': string;
    'datacenter': string;
    nsd: NSD;
    'nsd-id': string;
    name: string;
    'name-ref': string;
    id: string;
    'nsd-name-ref': string;
    description: string;
    'detailed-status': string;
    'config-status': string;
    'resource-orchestrator': string;
    'nsd-ref': string;
    vld: VLD[];
    instantiate_params: InstantiateParam;
    additionalParamsForNs: AdditionalParamForN;
    _id?: string;
    vcaStatus?: object;
}

/** Interface for Admin */
interface Admin {
    deployed: DeployedAdmin;
}

/** Interface for DeployedAdmin */
interface DeployedAdmin {
    RO: ROAdmin;
}

/** Interface for ROAdmin */
interface ROAdmin {
    'nsr_status': string;
}

/** Interface for _Admin */
// tslint:disable-next-line:class-name
interface _Admin {
    'projects_write': string[];
    deployed: DeployedAdmin;
    nslcmop: string;
    nsState: string;
    modified: number;
    projects_read: string[];
    created: string;
}

/** Interface for Deployed_Admin */
interface DeployedAdmin {
    VCA: string[];
    RO: ROAdmin;
}

/** Interface for RO_Admin */
interface ROAdmin {
    'nsr_status': string;
    'nsr_id': string;
    'nsd_id': string;
    vnfd: VNFD[];
}

/** Interface for VNFD */
interface VNFD {
    'member-vnf-index': number;
    id: string;
}

/** Interface for NSD */
export interface NSD {
    description: string;
    _admin: VNFDAdminDetails;
    name: string;
    version: string;
    _id: string;
    id: string;
    vendor: string;
    vdur: string[];
    'connection-point': CONNECTIONPOINT[];
    'virtual-link-desc': NSDVLD[];
    df: DF[];
}

/** Interface for _AdminDetails */
// tslint:disable-next-line:class-name
export interface _AdminDetails {
    usageState: string;
    projects_write: string[];
    projects_read: string[];
    operationalState: string;
    modified: string;
    storage: Storage;
    onboardingState: string;
    userDefinedData: JSON;
    created: number;
}

/** Interface for Storage */
interface Storage {
    path: string;
    'pkg-dir': string;
    zipfile: string;
    folder: string;
    descriptor: string;
    fs: string;
}

/** Interface for NSDVLD */
export interface NSDVLD {
    'vim-id': string;
    'status-detailed': string;
    name: string;
    status: string;
    'vim-network-name': string;
    id: string;
    'type': string;
    df: DF[];
}

/** Interface for Vm Migration */
export interface VMMIGRATION {
    lcmOperationType: string;
    vnfInstanceId: string;
    migrateToHost?: string;
    vdu?: VDUPARAM;
}

/** Interface for vdu for Vm Migration */
export interface VDUPARAM {
    vduId?: string;
    vduCountIndex?: string;
}

/** Interface for Ns Update */
export interface NSUPDATE {
    lcmOperationType: string;
    updateType: string;
    nsInstanceId: string;
    changeVnfPackageData: CHANGEVNFDATA;
}

/** Interface for changeVnfPackageData in Ns Update */
export interface CHANGEVNFDATA {
    vnfdId: string;
    vnfInstanceId: string;
}

/** Interface for terminate vnf in Ns Update */
export interface TERMINATEVNF {
    lcmOperationType: string;
    updateType: string;
    nsInstanceId: string;
    removeVnfInstanceId: string;
}

/** Interface for Start, Stop & Rebuild */
export interface StartStopRebuild {
    updateType: string;
    operateVnfData: OPERATEVNFDATA;
}

/** Interface for operateVnfData  in Start, Stop and Rebuild */
export interface OPERATEVNFDATA {
    additionalParam: ADDITIONALPARAMS;
    vnfInstanceId: string;
    changeStateTo: string;
}

/** Interface for additionalParam in Start, Stop and Rebuild */
export interface ADDITIONALPARAMS {
    'run-day1': boolean;
    'vdu_id': string;
    'count-index': string;
}

/** Interface for VerticalScaling */
export interface VerticalScaling {
    lcmOperationType: string;
    verticalScale: string;
    nsInstanceId: string;
    changeVnfFlavorData: CHANGEVNFFLAVORDATAPARAM;
}

/** Interface for changeVnfFlavorData in Vertical Scaling */
export interface CHANGEVNFFLAVORDATAPARAM {
    vnfInstanceId: string;
    additionalParams: ADDITIONALPARAM;

}

/** Interface for additionalParam in Vertical Scaling */
export interface ADDITIONALPARAM {
    vduid: string;
    vduCountIndex: string;
    virtualMemory: number;
    sizeOfStorage: number;
    numVirtualCpu: number;

}

/** Interface for InstantiateParam */
interface InstantiateParam {
    nsdId: string;
    nsName: string;
    nsDescription: string;
    vimAccountId: string;
}

/** Interface for AdditionalParamForN */
interface AdditionalParamForN {
    _id: string;
    'ns-instance-config-ref': string;
    'crete-time': string;
}

/** interface for the History nsdInstanceData */
export interface NSDInstanceData {
    id?: string;
    lcmOperationType?: string;
    operationState?: string;
    startTime?: number;
    statusEnteredTime?: number;
    identifier: string;
    name: string;
    NsdName: string;
    OperationalStatus: string;
    ConfigStatus: string;
    DetailedStatus: string;
    state?: string;
    memberIndex?: DF[];
    nsConfig?: object;
    vcaStatus?: object;
    adminDetails?: object;
    vnfID?: string[];
    nsd?: NSD;
    operationParams?: OPERATIONPARAMS;
    'nsd-id': string;
    constituent: string[];
}

/** Interface for the operationparams */
export interface OPERATIONPARAMS {
    scaleType?: string;
    scaleVnfData?: SCALEVNFDATA;
}

/** Interface for the scaleVnfData */
export interface SCALEVNFDATA {
    scaleVnfType?: string;
    scaleByStepData?: SCALEBYSTEPDATA;
}

/** Interface for the scaleByStepData */
export interface SCALEBYSTEPDATA {
    'scaling-group-descriptor'?: string;
    'member-vnf-index'?: string;
}

/** Interface for the nsInfo */
export interface NSINFO {
    nsInstanceID: string;
    nsName: string;
    nsOperationalStatus: string;
    nsConfigStatus: string;
    nsDetailedStatus: string;
    nsResourceOrchestrator: string;
}

/** Interface for the NSINSTANCENODES */
export interface NSINSTANCENODES {
    id?: string;
    nodeTypeRef?: string;
    name?: string;
    'type'?: string;
    vnfdCP?: DF[];
    vimNetworkName?: string;
    shortName?: string;
    cp?: CONNECTIONPOINT[];
    vdur?: string[];
    vld?: NSDVLD[];
    nsID?: string;
    vnfdID?: string;
    vimID?: string;
    vndfrID?: string;
    ipAddress?: string;
    memberIndex?: string;
    vnfdRef?: string;
    vndfCPRef?: string;
    selectorId?: string;
    reflexive?: Boolean;
    nodeIndex?: number;
}

/** Interface for the connection-point */
export interface CONNECTIONPOINT {
    'connection-point-id': string;
    name: string;
    id: string;
}

/** Interface for Exec NS Primitive */
export interface NSPrimitive {
    'primitive': string;
    'primitive_params': NSPrimitiveParams[];
    'member_vnf_index': string;
}

/** Interface for Exec NS Primitive Params */
export interface NSPrimitiveParams {
    primitive_params_name: string;
    primitive_params_value: string;
}

/** Interface Nodes Creation */
export interface COMPOSERNODES {
    id: string;
    reflexive: Boolean;
    nodeTypeRef: string;
    name?: string;
    nodeIndex?: number;
    selectorId?: string;
    x?: number;
    y?: number;
    fx?: number;
    fy?: number;
    shortName?: string;
    vimNetworkName?: string;
    'type'?: string;
    vnfdRef?: string;
    memberIndex?: string;
    vimID?: string;
    vndfrID?: string;
    ipAddress?: string;
    nsID?: string;
    vnfdID?: string;
}

/** Interface for the Virtual Link Info */
export interface VLINFO {
    id: string;
    name: string;
    'type': string;
    shortName: string;
    vimNetworkName: string;
}

/** Interface for the VNFR Info */
export interface VNFRINFO {
    vimID: string;
    _id: string;
    ip: string;
    nsrID: string;
    id: string;
    vnfdRef: string;
    vnfdId: string;
    memberIndex: string;
}
