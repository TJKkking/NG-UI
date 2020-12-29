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
// tslint:disable: completed-docs
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

/** Interface for VNFD Details */
export interface VNFD {
    description?: string;
    df?: DF[];
    'ext-cpd'?: EXTCPD[];
    id: string;
    'int-virtual-link-desc'?: IVLD[];
    'mgmt-cp'?: string;
    onboardingState?: string;
    operationalState?: string;
    'product-name'?: string;
    provider?: string;
    'sw-image-desc'?: SWIMAGEDESCRIPTION[];
    usageState?: string;
    vdu?: VDU[];
    version?: string;
    'virtual-compute-desc'?: string;
    'virtual-storage-desc'?: string[];
    _admin?: VNFDAdminDetails;
    _id?: string;
    _links?: string;
    'vnf-configuration'?: VNFCONFIG[];
    kdu?: [];
}
/** Interface for DF */
export interface VNFCONFIG {
    id: string;
    'config-primitive'?: CONFIGPRIMITIVE[];
    'initial-config-primitive'?: INITIALCONFIGPRIMITIVE[];
}
/** Interface for DF */
export interface DF {
    id: string;
    'instantiation-level'?: INSTANTIATIONLEVEL[];
    'vdu-profile'?: VDUPROFILE[];
    'vnf-configuration-id'?: string;
}
/** Interface for INSTANTIATIONLEVEL */
export interface INSTANTIATIONLEVEL {
    id: string;
    'vdu-level': VDULEVEL[];
}
/** Interface for VDULEVEL */
export interface VDULEVEL {
    'number-of-instances': number;
    'vdu-id': string;
}
/** Interface for VDULEVEL */
export interface VDUPROFILE {
    id: string;
    name?: string;
    'min-number-of-instances'?: number;
    'max-number-of-instances'?: number;
    'vdu-configuration-id'?: string;
    'vdu-configuration'?: VDUCONFIG;
}
/** Interface for VDUCONFIG */
export interface VDUCONFIG {
    id: string;
    'config-primitive': CONFIGPRIMITIVE[];
    'initial-config-primitive': INITIALCONFIGPRIMITIVE[];
}
/** Interface for CONFIGPRIMITIVE */
export interface CONFIGPRIMITIVE {
    name: string;
}
/** Interface for INITIALCONFIGPRIMITIVE */
export interface INITIALCONFIGPRIMITIVE {
    seq: string;
    name: string;
}
/** Interface for the ext-cpd */
export interface EXTCPD {
    id?: string;
    'int-cpd'?: INTCPD;
}
/** Interface for the int-cpd */
export interface INTCPD {
    cpd?: string;
    'vdu-id'?: string;
}
/** Interface for IVLD */
export interface IVLD {
    id?: string;
    description?: string;
}
/** Interface for SWIMAGEDESCRIPTION */
export interface SWIMAGEDESCRIPTION {
    id: string;
    name: string;
    version: string;
}
/** Interface for VDU */
export interface VDU {
    'cloud-init-file'?: string;
    description?: string;
    id?: string;
    'int-cpd'?: VDUINTCPD[];
    'monitoring-parameter'?: MonitoringParam[];
    name?: string;
    'sw-image-desc'?: string;
    'virtual-compute-desc'?: string;
    'virtual-storage-desc'?: string[];
}
/** Interface for the vdu int-cpd */
export interface VDUINTCPD {
    id: string;
    'int-virtual-link-desc'?: string;
    'virtual-network-interface-requirement': VNIR[];
}
/** Interface for the vdu int-cpd => VNIR */
export interface VNIR {
    name: string;
    position: number;
    'virtual-interface': VIRTUALINTERFACE;
}
/** Interface for the VIRTUALINTERFACE */
export interface VIRTUALINTERFACE {
    'type': string;
}
/** Interface for monitoring params */
export interface MonitoringParam {
    id: string;
    name?: string;
    'performance-metric'?: string;
    'collection-period'?: number;
}
/** Interface for VNFDATA */
export interface VNFDATA {
    vnfd?: VNFD;
}

/** Interface for VDU InternalCPD */
export interface InternalCPD {
    id: string;
    'int-virtual-link-desc'?: string;
    'virtual-network-interface-requirement'?: VIRTUALNETWORKINTERFACEREQUIREMENT;
}

/** Interface for VIRTUALNETWORKINTERFACEREQUIREMENT */
export interface VIRTUALNETWORKINTERFACEREQUIREMENT {
    name: string;
    position?: number;
    'virtual-interface'?: VirtualInterface;
}

/** Interface for VirutalInterface */
interface VirtualInterface {
    'type': string;
}

/** Interface for _AdminDetails */
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
    identifier?: string;
    id?: string;
    name?: string;
    description: string;
    version: string;
    'type'?: string;
    productName?: string;
    provider?: string;
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
    reflexive: Boolean;
    'type': string;
    name?: string;
    nodeIndex?: number;
    selectorId?: string;
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
