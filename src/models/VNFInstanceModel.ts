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
 * @file  Model for VNF Instance related information.
 */

/** Interface for VNFInstanceDetails */
export interface VNFInstanceDetails {
    id: string;
    'ip-address': string;
    'vnfd-id': string;
    'created-time': string;
    'vim-account-id': string;
    vdur: VDUR[];
    'vnfd-ref': string;
    'member-vnf-index-ref': string;
    _id: string;
    additionalParamsForVnf: string;
    _admin: Admin;
    'connection-point': ConnectionPoint[];
    'nsr-id-ref': string;
}

/** Interface for VDUR */
interface VDUR {
    'ip-address': string;
    'vim-id': string;
    'internal-connection-point': string[];
    name: string;
    'vdu-id-ref': string;
    'status-detailed': string;
    'count-index': number;
    interfaces: VDURInterface[];
    _id: string;
    status: string;
}

/** Interface for VDURInterface */
interface VDURInterface {
    'mac-address': string;
    name: string;
    'ns-vld-id': string;
    'mgmt-vnf': string;
    'ip-address': string;
}

/** Interface for _Admin */
interface Admin {
    created: number;
    projects_read: string[];
    modified: string;
    projects_write: string[];
}

/** Interface for ConnectionPoint */
interface ConnectionPoint {
    id: string;
    name: string;
    'connection-point-id': string;
}
/** interface for the History nsdInstanceData */
export interface VNFInstanceData {
    identifier: string;
    VNFD?: string;
    VNFID?: string;
}
