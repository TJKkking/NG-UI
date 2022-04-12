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
import { HttpHeaders } from '@angular/common/http';
import { NSD } from 'NSInstanceModel';
import { EXECUTEDACTIONS } from 'OperationalModel';
import { VNFD } from 'VNFDModel';

/**
 * @file  Model for Commonly used information.
 */
// tslint:disable: completed-docs
/**
 * handle count @enum
 */
export enum CONSTANTNUMBER {
    randomNumber = 4,
    osmapviewlong = 77.673,
    osmapviewlat = 19.166,
    chennailong = 80.2809,
    chennailat = 13.0781,
    bangalorelong = 77.5868,
    bangalorelat = 12.9718,
    mumbailong = 72.8342,
    mumbailat = 18.9394,
    tirvandrumlong = 76.9544,
    tirvandrumlat = 8.5009,
    oneMB = 1048576,
    paginationDefaultValue = 10,
    splitLongitude = 1,
    splitLatitude = 2,
    timeOutDefaultSeconds = 5,
    oneGB = 1024
}
/**
 * handle count @enum
 */
export enum CONFIGCONSTANT {
    operationalStateFirstStep = 'init',
    operationalStateSecondStep = 'running',
    operationalStateThirdStep = 'failed',
    operationalStateFourthStep = 'scaling',
    configStateFirstStep = 'init',
    configStateSecondStep = 'configured',
    configStateThirdStep = 'failed',
    historyStateFirstStep = 'PROCESSING',
    historyStateSecondStep = 'COMPLETED',
    historyStateThirdStep = 'FAILED',
    wimOperationalStateFirstStep = 'PROCESSING',
    wimOperationalStateStateSecondStep = 'ENABLED',
    wimOperationalStateThirdStep = 'ERROR',
    vimOperationalStateFirstStep = 'PROCESSING',
    vimOperationalStateStateSecondStep = 'ENABLED',
    vimOperationalStateThirdStep = 'ERROR',
    sdnOperationalStateFirstStep = 'PROCESSING',
    sdnOperationalStateStateSecondStep = 'ENABLED',
    sdnOperationalStateThirdStep = 'ERROR',
    k8OperationalStateFirstStep = 'PROCESSING',
    k8OperationalStateStateSecondStep = 'ENABLED',
    k8OperationalStateThirdStep = 'ERROR'
}
/** Interface for Post options */
export interface POSTAPIRESOURCE {
    apiURLHeader: APIURLHEADER;
    payload?: object;
}
/** Interface for ApiURL Header */
export interface APIURLHEADER {
    url: string;
    httpOptions?: APIHEADERS;
}
/** Interface for the Get Method with response type */
export interface GETAPIURLHEADER {
    headers: HttpHeaders;
    responseType: string;
}
/** Interface for Httpoptions Header */
interface APIHEADERS {
    headers: HttpHeaders;
}
/** Interface for the Error */
export interface ERRORDATA {
    error: ERRORDETAILSDATA;
}
/** Interface for the Error Details */
interface ERRORDETAILSDATA {
    detail: string;
    code?: string;
    status?: number;
    text?: Function;
}
/** Handle the URL params */
export interface URLPARAMS {
    page: string;
    id: string;
    titleName?: string;
    forceDeleteType?: boolean;
    name?: string;
    memberIndex?: object;
    nsConfig?: object;
    projectID?: string;
    username?: string;
    vnfID?: [];
    nsID?: string;
    nsd?: NSD;
    data?: VNFD[];
    configs?: object;
    actions?: object;
    executedActions?: EXECUTEDACTIONS[];
}
/** Handle the Delete params */
export interface DELETEPARAMS {
    identifier: string;
    name?: string;
    projectName?: string;
    userName?: string;
    username?: string;
    page?: string;
    id?: string;
    productName?: string;
}

/** Interface for the Delete Details */
export interface MODALCLOSERESPONSEDATA {
    message: string;
}

/** Interface for the modal closer */
export interface MODALCLOSERESPONSEWITHCP {
    message: string;
    connection_point?: string;
}

/** Interface for local storage settings */
export interface LOCALSTORAGE {
    id_token?: string;
    project_id?: string;
    expires?: string;
    username?: string;
    project?: string;
    project_name?: string;
    id?: string;
    admin?: boolean;
    isAdmin?: string;
    token_state?: string;
}
/** Interface for Tar settings */
export interface TARSETTINGS {
    name?: string;
    'type'?: string;
    readAsString?: Function;
    buffer: ArrayBuffer;
    header_offset?: Number;
    size?: number;
    linkname?: string;
    uname?: string;
    gname?: string;
}
/** Interface for File Settings */
export interface FILESETTINGS {
    'type'?: string;
    linkname?: string;
    owner?: string;
    group?: string;
}
/** Interface for Package information */
export interface PACKAGEINFO {
    id?: string;
    packageType?: string;
    descriptor: string;
}

/** Interface For the Pagination pager in ng-smarttable */
export interface PAGERSMARTTABLE {
    display: boolean;
    perPage: number;
}
/** Interface for breadcrumb item */
export interface BREADCRUMBITEM {
    title: string;
    url: string;
}
/** Interface For the Pagination pager in ng-smarttable */
export interface SMARTTABLECLASS {
    // tslint:disable-next-line: no-reserved-keywords
    class: string;
}
/** Constants of the VIM Types */
export const VIM_TYPES: TYPESECTION[] = [
    { value: 'openstack', title: 'Openstack' },
    { value: 'aws', title: 'AWS' },
    { value: 'vmware', title: 'VMware vCD' },
    { value: 'openvim', title: 'OpenVIM' },
    { value: 'opennebula', title: 'OpenNebula' },
    { value: 'azure', title: 'Azure' }
];
/** Constants of the SDN Types */
export const SDN_TYPES: TYPESECTION[] = [
    { value: 'arista', title: 'Arista' },
    { value: 'floodlightof', title: 'Floodlight openflow' },
    { value: 'odlof', title: 'OpenDaylight openflow' },
    { value: 'onosof', title: 'ONOS openflow' },
    { value: 'onos_vpls', title: 'ONOS vpls' }
];
/** Constants of the WIM Types */
export const WIM_TYPES: TYPESECTION[] = [
    { value: 'arista', title: 'Arista' },
    { value: 'dynpac', title: 'DynPac' },
    { value: 'floodlightof', title: 'Floodlight openflow' },
    { value: 'odlof', title: 'OpenDaylight openflow' },
    { value: 'onosof', title: 'ONOS openflow' },
    { value: 'onos_vpls', title: 'ONOS vpls' },
    { value: 'tapi', title: 'TAPI' }
];
/** Constants of the OSM Repo Types */
export const OSMREPO_TYPES: TYPESECTION[] = [
    { value: 'osm', title: 'OSM' }
];
/** Interface for List, Add WIM & SDN Types */
export interface TYPESECTION {
    value: string;
    title: string;
}
/** Interface for PRIMITIVETYPES */
export interface PRIMITIVETYPES {
    title: string;
    value: string;
}
/** Interface for the PRIMITIVEDATA */
export interface PRIMITIVEDATA {
    parameter: {}[];
}
/** Constant for VIM type Openstack's Config */
export const TYPEOPENSTACK: {} = {
    sdn_controller: '',
    APIversion: '',
    sdn_port_mapping: '',
    project_domain_id: '',
    vim_network_name: '',
    project_domain_name: '',
    config_vim_ype: '',
    user_domain_id: '',
    security_groups: '',
    user_domain_name: '',
    availability_zone: '',
    keypair: '',
    region_name: '',
    dataplane_physical_net: '',
    insecure: '',
    use_floating_ip: '',
    use_internal_endpoint: '',
    microversion: '',
    additional_conf: '',
    use_existing_flavors: ''
};
/** Constant for VIM type AWS's Config */
export const TYPEAWS: {} = {
    sdn_controller: '',
    vpc_cidr_block: '',
    sdn_port_mapping: '',
    security_groups: '',
    vim_network_name: '',
    keypair: '',
    region_name: '',
    flavor_info: '',
    additional_conf: ''
};
/** Constant for VIM type VMWARE's Config */
export const TYPEVMWARE: {} = {
    sdn_controller: '',
    orgname: '',
    sdn_port_mapping: '',
    vcenter_ip: '',
    vim_network_name: '',
    admin_username: '',
    admin_password: '',
    vcenter_port: '',
    vcenter_user: '',
    vcenter_password: '',
    nsx_manager: '',
    nsx_user: '',
    nsx_password: '',
    vrops_site: '',
    vrops_user: '',
    vrops_password: '',
    additional_conf: ''
};
/** Constant for VIM type OPENVIMNEBULA's Config */
export const TYPEOPENVIMNEBULA: {} = {
    sdn_controller: '',
    sdn_port_mapping: '',
    vim_network_name: '',
    additional_conf: ''
};
/** Constant for VIM type AZURE's Config */
export const TYPEAZURE: {} = {
    subscription_id: '',
    region_name: '',
    resource_group: '',
    vnet_name: '',
    flavors_pattern: ''
};
/** Constant for VIM other type Config */
export const TYPEOTERS: {} = {
    sdn_controller: '',
    sdn_port_mapping: '',
    vim_network_name: '',
    use_floating_ip: '',
    use_internal_endpoint: '',
    additional_conf: '',
    use_existing_flavors: ''
};
/** Interface for Domains */
export interface DOMAINS {
    project_domain_name: string;
    user_domain_name: string;
}
/** Interface for Login */
export interface LOGINPARAMS {
    username?: string;
    password?: string;
    old_password?: string;
}
/** Interface for the LABELVALUE */
export interface LABELVALUE {
    label: string;
    value: string;
}
