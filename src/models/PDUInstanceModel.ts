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
 * @file  Model for PDU Instance related information.
 */

/** Interface for PDUInstanceDetails */
export interface PDUInstanceDetails {
    description: string;
    interfaces: PDUInterfaces[];
    name: string;
    'type': string;
    vim_accounts: string[];
    _admin: ADMIN;
    _id: string;
    identifier?: string;
}

/** Interface for PDU interfaces */
export interface PDUInterfaces {
    'ip-address': string;
    mgmt: boolean;
    name: string;
    'vim-network-name': string;
}

/** Interface for Admin */
interface ADMIN {
    created: string;
    modified: string;
    onboardingState: string;
    operationalState: string;
    projects_write: string[];
    projects_read: string[];
    usageState: string;
}
