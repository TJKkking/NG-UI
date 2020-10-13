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
 * @file environment variables
 * This file can be replaced during build by using the `fileReplacements` array.
 * `npm run build` replaces `environment.ts` with `environment.prod.ts`.
 * The list of file replacements can be found in `angular.json`.
 */

import { version } from 'PACKAGEJSON';

/** OSM Admin URL @constant */
const OSM_ADMIN_ENDPOINT: string = 'osm/admin/v1/';
/** OSM NS LCM URL @constant */
const OSM_NSLCM_ENDPOINT: string = 'osm/nslcm/v1/';
/** OSM NST URL @constant */
const OSM_NST_ENDPOINT: string = 'osm/nst/v1/';
/** OSM NSI LCM URL @constant */
const OSM_NSILCM_ENDPOINT: string = 'osm/nsilcm/v1/';
/** OSM VNFD PACKAGES URL @constant */
const OSM_VNFDPACKAGE_ENDPOINT: string = 'osm/vnfpkgm/v1/';
/** OSM PDU URL @constant */
const OSM_PDU_ENDPOINT: string = 'osm/pdu/v1/';
/** OSM NSD URL @constant */
const OSM_NSD_ENDPOINT: string = 'osm/nsd/v1/';
/** Assets root path @constant */
const ASSETS_PATH: string = 'assets/';
/** OSM Version @constant */
const OSM_VERSION: string = 'osm/version';
/** Grafana End-Point @constant */
// tslint:disable-next-line: no-http-string
const GRAFANA_ENDPOINT: string = 'http://' + window.location.hostname + ':3000';

/** Exporting a const @exports environment */
// tslint:disable-next-line: typedef
export const environment = {
    production: false,
    packageSize: 50,
    paginationNumber: 10, //Possible values are 10, 25, 50, 100
    packageVersion: version,
    // tslint:disable-next-line: no-http-string
    MAPLATLONGAPI_URL: 'http://photon.komoot.de/api/?q={value}&limit=5',
    GENERATETOKEN_URL: OSM_ADMIN_ENDPOINT + 'tokens',
    PROJECTS_URL: OSM_ADMIN_ENDPOINT + 'projects',
    USERS_URL: OSM_ADMIN_ENDPOINT + 'users',
    ROLES_URL: OSM_ADMIN_ENDPOINT + 'roles',
    VIMACCOUNTS_URL: OSM_ADMIN_ENDPOINT + 'vim_accounts',
    WIMACCOUNTS_URL: OSM_ADMIN_ENDPOINT + 'wim_accounts',
    SDNCONTROLLER_URL: OSM_ADMIN_ENDPOINT + 'sdns',
    K8SCLUSTER_URL: OSM_ADMIN_ENDPOINT + 'k8sclusters',
    K8REPOS_URL: OSM_ADMIN_ENDPOINT + 'k8srepos',
    NETWORKSLICETEMPLATE_URL: OSM_NST_ENDPOINT + 'netslice_templates',
    NETWORKSLICETEMPLATECONTENT_URL: OSM_NST_ENDPOINT + 'netslice_templates_content',
    NSDINSTANCES_URL: OSM_NSLCM_ENDPOINT + 'ns_instances',
    VNFINSTANCES_URL: OSM_NSLCM_ENDPOINT + 'vnfrs',
    NSINSTANCESCONTENT_URL: OSM_NSLCM_ENDPOINT + 'ns_instances_content',
    NSHISTORYOPERATIONS_URL: OSM_NSLCM_ENDPOINT + 'ns_lcm_op_occs',
    NETWORKSLICEINSTANCESCONTENT_URL: OSM_NSILCM_ENDPOINT + 'netslice_instances_content',
    NSTHISTORYOPERATIONS_URL: OSM_NSILCM_ENDPOINT + 'nsi_lcm_op_occs',
    NSDESCRIPTORSCONTENT_URL: OSM_NSD_ENDPOINT + 'ns_descriptors_content',
    NSDESCRIPTORS_URL: OSM_NSD_ENDPOINT + 'ns_descriptors',
    VNFPACKAGESCONTENT_URL: OSM_VNFDPACKAGE_ENDPOINT + 'vnf_packages_content',
    VNFPACKAGES_URL: OSM_VNFDPACKAGE_ENDPOINT + 'vnf_packages',
    PDUINSTANCE_URL: OSM_PDU_ENDPOINT + 'pdu_descriptors',
    PERMISSIONS_CONFIG_FILE: ASSETS_PATH + 'config/rolePermissions.json',
    GRAFANA_URL: GRAFANA_ENDPOINT + '/d',
    DOMAIN_URL: OSM_ADMIN_ENDPOINT + 'domains',
    OSM_VERSION_URL: OSM_VERSION,
    OSMREPOS_URL: OSM_ADMIN_ENDPOINT + 'osmrepos'
};
