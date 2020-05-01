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
 * @file  Model for VNFD related information.
 */

/** Interface for Project */
export interface ProjectModel {
    project_id: string;
    project?: string;
    project_name?: string;
    expires: number;
    _id: string;
    id: string;
    issued_at: number;
    remote_port: number;
    username: string;
    remote_host: string;
    admin: boolean;
}

/** Interface for ProjectDetails */
export interface ProjectDetails {
    _admin: AdminDetails;
    name: string;
    _id: string;
}

/** Interface for AdminDetails */
interface AdminDetails {
    modified: string;
    created: string;
}

/** Interface for VNFD NODE Details */
export interface VNFDNODE {
    nodeTypeRef?: string;
    'connection-point'?: CONNECTIONPOINT[];
    description?: string;
    id: string;
    'internal-vld'?: InternalVLD[];
    version?: string;
    name?: string;
    'mgmt-interface'?: MGMT;
    _id?: string;
    vdu?: VDU[];
    _admin?: VNFDAdminDetails;
    'short-name'?: string;
    shortName?: string;
    vendor?: string;
    'type'?: string;
    'cloud-init-file'?: string;
    count?: number;
    vduID?: string;
    'interface'?: VNFDInterface[];
    'vm-flavor'?: VMFlavor;
    intVLID?: string;
    'internal-connection-point'?: VLDInternalConnectionPoint[];
    'monitoring-param'?: MonitoringParam[];
    'ip-profile-ref'?: string;
    'id-ref'?: string;
    'ip-address'?: string;
    reflexive?: boolean;
    image?: string;
}

/** Interface for VNFDDetails */
export interface VNFDDetails {
    'connection-point': CONNECTIONPOINT[];
    description: string;
    id: string;
    'internal-vld': InternalVLD[];
    version: string;
    name: string;
    'mgmt-interface': MGMT;
    _id: string;
    vdu: VDU[];
    _admin: VNFDAdminDetails;
    'short-name': string;
    vendor: string;
}

/** Interface for MGMT */
interface MGMT {
    cp: string;
}

/** Interface for VDU */
export interface VDU {
    nodeTypeRef?: string;
    'cloud-init-file'?: string;
    count?: number;
    description?: string;
    id?: string;
    image?: string;
    'interface'?: VNFDInterface[];
    'internal-connection-point'?: VDUInternalConnectionPoint[];
    name?: string;
    'vm-flavor'?: VMFlavor;
    vduInterface?: string;
    'monitoring-param'?: MonitoringParam[];
}

/** Interface for VMFlavor */
interface VMFlavor {
    'storage-gb'?: string;
    'memory-mb'?: string;
    'vcpu-count'?: string;
}

/** Interface for VNFDInterface */
export interface VNFDInterface {
    'external-connection-point-ref'?: string;
    'internal-connection-point-ref'?: string;
    'mgmt-interface'?: boolean;
    name?: string;
    'type'?: string;
    position?: boolean;
    'virtual-interface'?: VirtualInterface;
}

/** Interface for VDU Internal Connection Point */
export interface VDUInternalConnectionPoint {
    id: string;
    name?: string;
    'short-name'?: string;
    'type'?: string;
}

/** Interface for VirutalInterface */
interface VirtualInterface {
    'type': string;
}

/** Interface for the connection-point */
export interface CONNECTIONPOINT {
    nodeTypeRef?: string;
    'connection-point-id'?: string;
    name?: string;
    id: string;
    'type'?: string;
}

/** Interface for Internal VLD */
export interface InternalVLD {
    nodeTypeRef?: string;
    id?: string;
    'internal-connection-point'?: VLDInternalConnectionPoint[];
    'ip-profile-ref'?: string;
    name?: string;
    'short-name'?: string;
    'type'?: string;
    'shortName'?: string;
    'ipProfileRef'?: string;
}

/** Interface for VLD Internal Connection Point */
export interface VLDInternalConnectionPoint {
    nodeTypeRef?: string;
    'ip-address'?: string;
    'id-ref'?: string;
    'shortName'?: string;
}

/** Interface for monitoring params */
export interface MonitoringParam {
    id: string;
    'nfvi-metric'?: string;
    'interface-name-ref'?: string;
}

/** Interface for _AdminDetails */
// tslint:disable-next-line:class-name
export interface VNFDAdminDetails {
    created: number;
    modified: string;
    onboardingState: string;
    operationalState: string;
    projects_read: string[];
    projects_write: string[];
    storage: Storage;
    'type': string;
    usageState: string;
    userDefinedData: JSON;
}

/** Interface for Storage */
interface Storage {
    descriptor: string;
    folder: string;
    fs: string;
    path: string;
    'pkg-dir': string;
    zipfile: string;
}

/** Interface for VNFData */
export interface VNFData {
    name?: string;
    id?: string;
    shortName: string;
    identifier: string;
    description: string;
    vendor: string;
    version: string;
    'type'?: string;
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
}

/** Interface Nodes Creation */
export interface COMPOSERNODES {
    id: string;
    reflexive?: boolean;
    'type'?: string;
    name?: string;
    nodeTypeRef?: string;
    x?: number;
    y?: number;
    fx?: number;
    fy?: number;
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
