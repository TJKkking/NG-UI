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
 * @file  Model for Network Slice Template related information.
 */

/** Interface for MetricModel */
export interface NetworkSliceModel {
    'netslice-subnet': NetsliceSubnet[];
    id: string;
    'SNSSAI-identifier': SNSSAIIdentifier;
    'quality-of-service': QualityOfService;
    name: string;
    _id: string;
    _admin: ADMIN;
    'netslice-vld': NetsliceVld[];
}

/** Interface for NetsliceSubnet */
interface NetsliceSubnet {
    description : string;
    id: string;
    'is-shared-nss': string;
    'nsd-ref': string;
}

/** Interface for SNSSAIIdentifier */
interface SNSSAIIdentifier {
    'slice-service-type': string;
}

/** Interface for SNSSAIIdentifier */
interface QualityOfService {
    id: number;
}

/** Interface for Admin */
interface ADMIN {
    operationalState: string;
    created: string;
    projects_write: string[];
    projects_read: string[];
    usageState: string;
    modified: string;
    onboardingState: string;
    userDefinedData: {};
    storage : Storage;
}

/** Interface for Storage */
interface Storage {
    fs: string;
    folder: string;
    descriptor: string;
    path: string;
}

/** Interface for NetsliceVld */
interface NetsliceVld {
    name: string;
    id: string;
    'nss-connection-point-ref': NssConnectionPointRef[];
    'mgmt-network': boolean;
    type: string;
}

/** Interface for NssConnectionPointRef */
interface NssConnectionPointRef {
    'nss-ref': string;
    'nsd-connection-point-ref': string;
}

/** Interface for NetworkSliceData */
export interface NetworkSliceData {
    name: string;
    identifier: string;
    usageState: string;
}

/** Interface for Network Slice instance Data */
export interface NSTInstanceDetails {
    name: string;
    id: string;
    'nst-ref': string;
    'operational-status': string;
    'config-status': string;
    'detailed-status': string;
}
/** interface for the Network Slice instance Data in datasource Table */
export interface NSTInstanceData {
    name: string;
    identifier: string;
    NstName: string;
    OperationalStatus: string;
    ConfigStatus: string;
    DetailedStatus: string;
}
