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
 * @file  Model For SDN Controller model Information.
 */

/** Interface for SDNControllerModel */
export interface SDNControllerModel {
    dpid: string;
    name: string;
    password: string;
    schema_version: string;
    'type': string;
    user: string;
    version: string;
    _admin: ADMIN;
    _id: string;
    url:string;
}

/** Interface for _ADMIN */
interface ADMIN {
    created: number;
    current_operation: boolean;
    deployed: Deployed;
    'detailed-status': string;
    modified: number;
    operationalState: string;
    operations: Operation[];
    projects_read: string[];
    projects_write: string[];
}

/** Interface for Deployed */
interface Deployed {
    RO: string;
}

/** Interface for Operations */
interface Operation {
    'detailed-status': string;
    lcmOperationType: string;
    operationParams: string;
    operationState: string;
    startTime: number;
    statusEnteredTime: number;
    worker: string;
}

/** Interface for SDNControllerList */
export interface SDNControllerList {
    name: string;
    id?: string;
    identifier: string;
    'type': string;
    operationalState: string;
    url: string;
}
