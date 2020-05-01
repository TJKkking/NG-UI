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
 * @file  Model for K8s related information.
 */

/** Interface for K8SCLUSTERDATA */
export interface K8SCLUSTERDATA {
    credentials: Credentials;
    description: string;
    k8s_version: number;
    name: string;
    namespace: string;
    nets: Nets;
    schema_version: string;
    vim_account: string;
    _admin: Admin;
    _id: string;
}
/** Interface for K8SCLUSTERDATA */
export interface K8SREPODATA {
    description: string;
    name: string;
    schema_version: string;
    'type': string;
    url: string;
    vim_account: string;
    _admin: Admin;
    _id: string;
}
/** Interface for the Credentials */
interface Credentials{
    apiVersion: string;
    clusters: Clusters[];
    contexts: Contexts[];
    'current-context': string;
    kind: string;
    preferences: {};
    users: Users[];
}
/** Interface for the Clusters */
interface Clusters {
    cluster: Cluster;
    name: string;
}
/** Interface for the Cluster */
interface Cluster {
    'certificate-authority-data': string;
    server: string;
}
/** Interface for the Contexts */
interface Contexts{
    context: Context;
    name: string;
}
/** Interface for the Contexts */
interface Context {
    cluster: string;
    user: string;
}
/** Interface for the Users */
interface Users{
    name: string;
    user: User;
}
/** Interface for the Users */
interface User {
    'client-certificate-data': string;
    'client-key-data': string;
}
/** Interface for the K8SCLUSTERDATA nets */
interface Nets{
    net1: string;
}
/** Interface for the K8SCLUSTERDATA _admin */
interface Admin{
    created: string;
    current_operation: number;
    'helm-chart': HelmChart;
    'juju-bundle': JujuBundle;
    operationalState: string;
    modified: string;
}
/** Interface for the K8SCLUSTERDATA _admin Helm chart */
interface HelmChart {
    created: boolean;
    id: string;
}
/** Interface for the K8SCLUSTERDATA _admin Juju Bundle */
interface JujuBundle {
    error_msg: string;
}
/** Interface for the K8SCLUSTERDATA Return to Display */
export interface K8SCLUSTERDATADISPLAY{
    name: string;
    identifier: string;
    operationalState: string;
    version: number;
    created: string;
    modified: string;
    pageType: string;
}
/** Interface for the K8SCLUSTERDATA Return to Display */
export interface K8SREPODATADISPLAY {
    name: string;
    identifier: string;
    url: string;
    'type': string;
    created: string;
    modified: string;
    pageType: string;
}
