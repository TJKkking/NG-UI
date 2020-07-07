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
 * @file  Model for Commonly used information.
 */
/** Constants of the Menu child active class */
const childActiveClass: string[] = ['active'];
/** Constants of the Menu Items */
export const MENU_ITEMS: MENUITEMS[] = [
    {
        liClass: 'round-edge-top-3',
        anchorTagClass: 'link round-edge-top-3 individual',
        clickFunction: 'nosubmenu',
        routerLink: '/',
        routerLinkActive: ['parentactive'],
        routerLinkActiveOptions: true,
        icon: 'fas fa-th-large',
        menuName: 'PAGE.DASHBOARD.DASHBOARD',
        isChildExists: false
    },
    {
        liClass: 'header-menu',
        anchorTagClass: 'heading text-uppercase',
        menuName: 'PROJECT',
        isChildExists: false
    },
    {
        liClass: 'round-edge-top-3',
        anchorTagClass: 'parentlink round-edge-top-3 mr-top-5',
        clickFunction: 'packages',
        routerLink: '/packages',
        routerLinkActive: ['menu-open', 'parentactive'],
        routerLinkActiveOptions: false,
        icon: 'fas fa-box',
        menuName: 'PACKAGES',
        isChildExists: true,
        ulClass: 'sidebar-submenu',
        childItems: [
            {
                liClass: '',
                anchorTagClass: 'link',
                routerLink: '/packages/ns',
                routerLinkActive: childActiveClass,
                routerLinkActiveOptions: false,
                icon: 'fas fa-box-open',
                menuName: 'NSPACKAGES',
                isChildExists: false
            },
            {
                liClass: '',
                anchorTagClass: 'link',
                routerLink: '/packages/vnf',
                routerLinkActive: childActiveClass,
                routerLinkActiveOptions: false,
                icon: 'fas fa-box-open',
                menuName: 'VNFPACKAGES',
                isChildExists: false
            },
            {
                liClass: '',
                anchorTagClass: 'link',
                routerLink: '/packages/netslice',
                routerLinkActive: childActiveClass,
                routerLinkActiveOptions: false,
                icon: 'fas fa-layer-group',
                menuName: 'PAGE.DASHBOARD.NETSLICETEMPLATE',
                isChildExists: false
            }
        ]
    },
    {
        liClass: 'mt-1 round-edge-bottom-3 border-bottom-none',
        anchorTagClass: 'parentlink round-edge-bottom-3 border-bottom-none',
        clickFunction: 'instances',
        routerLink: '/instances',
        routerLinkActive: ['menu-open', 'parentactive'],
        routerLinkActiveOptions: false,
        icon: 'fa fa-paper-plane',
        menuName: 'INSTANCES',
        isChildExists: true,
        ulClass: 'sidebar-submenu',
        childItems: [
            {
                liClass: '',
                anchorTagClass: 'link',
                routerLink: '/instances/ns',
                routerLinkActive: childActiveClass,
                routerLinkActiveOptions: false,
                icon: 'fas fa-sitemap',
                menuName: 'NSINSTANCES',
                isChildExists: false
            },
            {
                liClass: '',
                anchorTagClass: 'link',
                routerLink: '/instances/vnf',
                routerLinkActive: childActiveClass,
                routerLinkActiveOptions: false,
                icon: 'fas fa-hdd',
                menuName: 'VNFINSTANCES',
                isChildExists: false
            },
            {
                liClass: '',
                anchorTagClass: 'link',
                routerLink: '/instances/pdu',
                routerLinkActive: childActiveClass,
                routerLinkActiveOptions: false,
                icon: 'fas fa-hdd',
                menuName: 'PDUINSTANCES',
                isChildExists: false
            },
            {
                liClass: '',
                anchorTagClass: 'link',
                routerLink: '/instances/netslice',
                routerLinkActive: childActiveClass,
                routerLinkActiveOptions: false,
                icon: 'fas fa-layer-group',
                menuName: 'PAGE.DASHBOARD.NETSLICEINSTANCE',
                isChildExists: false
            }
        ]
    },
    {
        liClass: 'round-edge-top-3 round-edge-bottom-3 mr-top-5',
        anchorTagClass: 'link round-edge-top-3 round-edge-bottom-3 individual',
        clickFunction: 'nosubmenu',
        routerLink: '/sdn/details',
        routerLinkActive: ['parentactive'],
        routerLinkActiveOptions: true,
        icon: 'fas fa-globe',
        menuName: 'SDNCONTROLLER',
        isChildExists: false
    },
    {
        liClass: 'round-edge-top-3 round-edge-bottom-3 mr-top-5',
        anchorTagClass: 'link round-edge-top-3 round-edge-bottom-3 individual',
        clickFunction: 'nosubmenu',
        routerLink: '/vim',
        routerLinkActive: ['parentactive'],
        routerLinkActiveOptions: false,
        icon: 'fas fa-server',
        menuName: 'VIMACCOUNTS',
        isChildExists: false
    },
    {
        liClass: 'round-edge-top-3 round-edge-bottom-3 mr-top-5',
        anchorTagClass: 'parentlink round-edge-top-3 round-edge-bottom-3',
        clickFunction: 'k8s',
        routerLink: '/k8s',
        routerLinkActive: ['menu-open', 'parentactive'],
        routerLinkActiveOptions: false,
        icon: 'fas fa-asterisk',
        menuName: 'PAGE.K8S.MENUK8S',
        isChildExists: true,
        ulClass: 'sidebar-submenu',
        childItems: [
            {
                liClass: '',
                anchorTagClass: 'link',
                routerLink: '/k8s/cluster',
                routerLinkActive: childActiveClass,
                routerLinkActiveOptions: false,
                icon: 'fas fa-project-diagram',
                menuName: 'PAGE.K8S.MENUK8SCLUSTER',
                isChildExists: false
            },
            {
                liClass: '',
                anchorTagClass: 'link',
                routerLink: '/k8s/repo',
                routerLinkActive: childActiveClass,
                routerLinkActiveOptions: false,
                icon: 'fas fa-flag',
                menuName: 'PAGE.K8S.MENUK8SREPO',
                isChildExists: false
            }
        ]
    },
    {
        liClass: 'round-edge-top-3 round-edge-bottom-3 mr-top-5',
        anchorTagClass: 'link round-edge-top-3 round-edge-bottom-3 individual',
        clickFunction: 'nosubmenu',
        routerLink: '/repos/details',
        routerLinkActive: ['parentactive'],
        routerLinkActiveOptions: true,
        icon: 'fas fa-fas fa-cloud-download-alt',
        menuName: 'PAGE.OSMREPO.MENUOSMREPO',
        isChildExists: false
    },
    {
        liClass: 'round-edge-top-3 round-edge-bottom-3 mr-top-5',
        anchorTagClass: 'link round-edge-top-3 round-edge-bottom-3 individual',
        clickFunction: 'nosubmenu',
        routerLink: '/wim/details',
        routerLinkActive: ['parentactive'],
        routerLinkActiveOptions: true,
        icon: 'fas fa-sitemap',
        menuName: 'WIMACCOUNTS',
        isChildExists: false
    },
    {
        liClass: 'header-menu',
        anchorTagClass: 'heading text-uppercase',
        menuName: 'ADMIN',
        isChildExists: false
    },
    {
        liClass: 'mt-1 round-edge-top-3',
        anchorTagClass: 'link round-edge-top-3 individual',
        clickFunction: 'nosubmenu',
        routerLink: '/projects',
        routerLinkActive: ['parentactive'],
        routerLinkActiveOptions: true,
        icon: 'fas fa-folder',
        menuName: 'PAGE.DASHBOARD.PROJECTS',
        isChildExists: false
    },
    {
        liClass: 'mt-1 mb-1',
        anchorTagClass: 'link individual',
        clickFunction: 'nosubmenu',
        routerLink: '/users/details',
        routerLinkActive: ['parentactive'],
        routerLinkActiveOptions: true,
        icon: 'fas fa-users',
        menuName: 'PAGE.DASHBOARD.USERS',
        isChildExists: false
    },
    {
        liClass: 'round-edge-bottom-3',
        anchorTagClass: 'link round-edge-bottom-3 individual',
        clickFunction: 'nosubmenu',
        routerLink: '/roles',
        routerLinkActive: ['parentactive'],
        routerLinkActiveOptions: true,
        icon: 'fas fa-user-tag',
        menuName: 'ROLES',
        isChildExists: false
    }
];

/** Interface for Post options */
export interface MENUITEMS {
    ulClass?: string;
    liClass: string;
    anchorTagClass: string;
    clickFunction?: string;
    routerLink?: string;
    routerLinkActive?: string[];
    routerLinkActiveOptions?: boolean;
    icon?: string;
    menuName: string;
    isChildExists: boolean;
    childItems?: MENUITEMS[];
}
