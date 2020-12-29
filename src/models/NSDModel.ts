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
 * @file  Model for NSD related information.
 */
// tslint:disable: completed-docs
import { VNFDAdminDetails } from './VNFDModel';

/** Interface for NSData */
export interface NSData {
    id?: string;
    identifier?: string;
    description?: string;
    version: string;
    name?: string;
    designer?: string;
}

/** Interface for the nscompose descriptors content */
export interface NSDDetails {
    'connection-point': CONNECTIONPOINT[];
    'constituent-vnfd': CONSTITUENTVNFD[];
    description: string;
    id: string;
    logo: string;
    name: string;
    version: string;
    vld: VLD[];
    _admin: VNFDAdminDetails;
    _id: string;
    _links?: string;
    'constituent-vnfr-ref': string[];
    'virtual-link-desc': VLD[];
    df: DF[];
    'vnfd-id': string[];
    designer?: string;
}

/** Interface for the connection-point */
export interface CONNECTIONPOINT {
    name: string;
    'vld-id-ref': string;
}

/** Interface for the constituent-vnfd */
export interface CONSTITUENTVNFD {
    'member-vnf-index': number;
    'vnfd-id-ref': string;
}

/** Interface for the vld */
export interface VLD {
    id: string;
    'mgmt-network'?: boolean;
}

/** Interface Nodes Creation */
export interface COMPOSERNODES {
    id: string;
    reflexive: Boolean;
    'type': string;
    name?: string;
    nodeIndex?: string;
    selectorId?: string;
    x?: number;
    y?: number;
    fx?: number;
    fy?: number;
}

/** Interface for the Tick */
export interface Tick {
    target: TickPath;
    source: TickPath;
    left: boolean;
    right: boolean;
}

/** Interface for the Path */
export interface TickPath {
    x: number;
    y: number;
    id: string;
    'type'?: string;
    name?: string;
    nodeIndex?: string;
}
/** Interface for the GRAPHDETAILS */
export interface GRAPHDETAILS {
    width: number;
    height: number;
    nodeHeight: number;
    nodeWidth: number;
    textX: number;
    textY: number;
    radius: number;
    distance: number;
    strength: number;
    forcex: number;
    forcey: number;
    sourcePaddingYes: number;
    sourcePaddingNo: number;
    targetPaddingYes: number;
    targetPaddingNo: number;
    alphaTarget: number;
    imageX: number;
    imageY: number;
    shiftKeyCode: number;
}

/** Interface for the NS Create params */
export interface NSCREATEPARAMS {
    nsName: string;
    nsDescription: string;
    nsdId: string;
    vimAccountId: string;
    vld: string;
    ssh_keys: string[];
}

/** Interface for the NSI Create params */
export interface NSICREATEPARAMS {
    nsName: string;
    nsDescription: string;
    nstId: string;
    vimAccountId: string;
    'netslice-vld': string;
    ssh_keys: string[];
}

/** Interface for the VDU Primitive Levels */
export interface VDUPRIMITIVELEVEL {
    id: string;
    name: string;
    'vdu-configuration': {};
}

/** Interface for the KDU Primitive Levels */
export interface KDUPRIMITIVELEVEL {
    name: string;
    'juju-bundle': string;
    'kdu-configuration': {};
}

/** Interface for the DF */
export interface DF {
    id: string;
    'vnf-profile': VNFPROFILE[];
}

/** Interface for the DF */
export interface VNFPROFILE {
    id: string;
    'virtual-link-connectivity': VLC[];
    'vnfd-id': string;
}

/** Interface for the VLC */
export interface VLC {
    'constituent-cpd-id': CCI[];
    'virtual-link-profile-id': string;
}

/** Interface for the CCI */
export interface CCI {
    'constituent-base-element-id': string;
    'constituent-cpd-id': string;
}
/** Interface for NSDATACREATION */
export interface NSDATACREATION {
    nsd: NSDETAILDATA;
}
/** Interface for NSDETAILDATA */
export interface NSDETAILDATA {
    nsd: NSDDetails[];
}
