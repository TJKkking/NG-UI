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

 Author: BARATH KUMAR R (barath.r@tataelxsi.co.in)
 */

/**
 * @file  Model for Operational view JUJU information.
 */

// tslint:disable: completed-docs

/** Interface for the VCASTATUS */
export interface VCASTATUS {
    vcaStatus: VCADETAILS;
    name: string;
    id: string;
}
/** Interface for the VCASTATUS */
export interface VCADETAILS {
    isLiveloading: boolean;
    ns_id: string;
    vcaStatusModels: SETMODELS[];
    timeOutSeconds?: number;
    vca_id: string;
    vca_name: string;
}
/** Interface for the SETMODELS */
export interface SETMODELS {
    applications: VCAAPPLICATIONS[];
    branches?: {};
    controller_timestamp?: string;
    executedActions?: EXECUTEDACTIONS;
    machines: MACHINES[];
    model: VCAMODEL;
    offers?: {};
    relations: RELATIONS[];
    remote_applications?: {};
    units: VCAUNITS[];
    unknown_fields?: {};
}
/** Interface for the VCAAPPLICATIONS */
export interface VCAAPPLICATIONS {
    app_id: string;
    charm: string;
    store: string;
    units: {};
    status: STATUS;
    scale: number;
    public_address: string;
    agent_status: AGENTSTATUS;
    configs: object;
    actions: object;
}
/** Interface for the VCAUNITS */
export interface VCAUNITS {
    address: string;
    machine: string;
    unit_id: string;
    public_address: string;
    status: string;
    agent_status: AGENTSTATUS;
}
/** Interface for the EXECUTEDACTIONS */
export interface EXECUTEDACTIONS {
    id: string;
    action: string;
    status: string;
    Code: string;
    outout: string;
    verified: string;
}
/** Interface for the VCAMODEL */
export interface VCAMODEL {
    available_version: string;
    cloud_tag: string;
    migration: string;
    name: string;
    region: string;
    version: string;
}
/** Interface for the STATUS */
export interface STATUS {
    status: string;
}
/** Interface for the AGENTSTATUS */
export interface AGENTSTATUS {
    status: string;
    info?: string;
}
/** Interface for the MACHINES */
export interface MACHINES {
    id_: string;
    agent_status: AGENTSTATUS;
    dns_name: string;
    instance_id: string;
    series: string;
    instance_status: AGENTSTATUS;
}
/** Interface for the RELATIONS */
export interface RELATIONS {
    endpoints: ENDPOINTS[];
    'interface': string;
    key: string;
}
/** Interface for the ENDPOINTS */
export interface ENDPOINTS {
    application: string;
    name: string;
    role: string;
    subordinate: string;
}
/** Interface for the SETTIMER */
export interface SETTIMER {
    label: string;
    value: number;
}
export const SET_TIMER: SETTIMER[] = [
    {
        label: '5s',
        value: 5
    },
    {
        label: '10s',
        value: 10
    },
    {
        label: '30s',
        value: 30
    },
    {
        label: '1m',
        value: 60
    }
];
