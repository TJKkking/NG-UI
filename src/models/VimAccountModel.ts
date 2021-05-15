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
 * @file  Model for VimAccount Details related information.
 */
// tslint:disable: completed-docs
import { NSInstanceDetails } from 'NSInstanceModel';
/** Interface for VimAccountDetails */
export interface VimAccountDetails {
    description: string;
    'vim_tenant_name': string;
    schema_version: string;
    schema_type: string;
    config: CONFIG;
    _id: string;
    vim_password: string;
    _admin: ADMIN;
    vim_url: string;
    vim_user: string;
    vim_type: string;
    name: string;
    resources?: RESOURCES;
}

/** Interface for _ADMIN */
interface ADMIN {
    projects_write: string[];
    deployed?: Deployed;
    operationalState: string;
    modified: string;
    projects_read: string[];
    'detailed-status': string;
    created: string;
}

/** Interface for Deployed */
interface Deployed {
    'RO-account': string;
    RO: string;
}

/** Interface for Config */
export interface CONFIG {
    sdn_controller?: string;
    use_floating_ip?: string;
    location?: string;
    sdn_port_mapping?: string;
    vim_network_name?: string;
    security_groups?: string;
    availability_zone?: string;
    region_name?: string;
    insecure?: string;
    use_existing_flavors?: string;
    use_internal_endpoint?: string;
    additional_conf?: string;
    APIversion?: string;
    project_domain_id?: string;
    project_domain_name?: string;
    user_domain_id?: string;
    user_domain_name?: string;
    keypair?: string;
    dataplane_physical_net?: string;
    microversion?: string;
    vpc_cidr_block?: string;
    flavor_info?: string;
    orgname?: string;
    vcenter_ip?: string;
    vcenter_port?: string;
    admin_username?: string;
    vcenter_user?: string;
    admin_password?: string;
    vcenter_password?: string;
    nsx_manager?: string;
    vrops_site?: string;
    nsx_user?: string;
    vrops_user?: string;
    nsx_password?: string;
    vrops_password?: string;
    subscription_id?: string;
    resource_group?: string;
    vnet_name?: string;
    flavors_pattern?: string;
}

/** Interface for VIMData */
export interface VIMData {
    name?: string;
    identifier: string;
    'type': string;
    operationalState: string;
    description: string;
    page?: string;
    instancesData?: NSInstanceDetails[];
    resources?: RESOURCES;
}
/** Interface for VIMLOCATION */
export interface VIMLOCATION {
    features: FEATURES[];
    'type': string;
}
/** Interface for FEATURES */
export interface FEATURES {
    geometry: GEOMETRY;
    'type': string;
    properties: PROPERTIES;
}
/** Interface for GEOMETRY */
interface GEOMETRY {
    coordinates: [];
}
/** Interface for PROPERTIES */
interface PROPERTIES {
    extent: [];
    country: string;
    name: string;
    state: string;
}
/** Interface for the RESOURCES */
export interface RESOURCES {
    compute: object;
    storage: object;
    network: object;
}
/** Interface for the RESOURCESDATA */
export interface RESOURCESDATA {
    heading: string;
    length: number;
    data: RESOURCESCHARTDATA[];
}
/** Interface for the RESOURCESCHARTDATA */
export interface RESOURCESCHARTDATA {
    title: string;
    values: CHARTVALUES;
    data: number[];
    colorValues: Color[];
}
/** Interface common use for the Chart */
export interface CHARTVALUES {
    total: number;
    used?: number;
    remaining?: number;
}
/** Interface for the CHARTRANGE */
export interface CHARTRANGE {
    percentage: number;
    nearlyFull: number;
    full: number;
}
/** Interface for the COLOR */
export interface Color {
    backgroundColor?: string[] | string;
    borderColor?: string[] | string;
}
/** Constant Values for the resources titles */
export enum CONFIGRESOURCESTITLE {
    ram = 'RAM',
    instances = 'Instances',
    vcpus = 'VCPUs',
    snapshots = 'Volume Snapshots',
    storage = 'Volume Storage',
    volumes = 'Volumes',
    floating_ips = 'Floating IPs',
    security_group = 'Security Group',
    subnets = 'Subnets',
    networks = 'Networks',
    ports = 'Ports',
    routers = 'Routers'
}

/** constant values for color */
export enum RANGECOLOR {
    used = '#29c3be',
    nearlyfull = '#f0ad4e',
    full = '#d9534f'
}
