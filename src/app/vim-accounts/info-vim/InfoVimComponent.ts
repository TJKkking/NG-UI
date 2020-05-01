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
 * @file Info VIM Page
 */
import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ERRORDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import * as HttpStatus from 'http-status-codes';
import { RestService } from 'RestService';
import { isNullOrUndefined } from 'util';
import { CONFIG, VimAccountDetails, VIMData } from 'VimAccountModel';

/**
 * Creating component
 * @Component InfoVimComponent.html as template url
 */
@Component({
  selector: 'app-info-vim',
  templateUrl: './InfoVimComponent.html',
  styleUrls: ['./InfoVimComponent.scss']
})
/** Exporting a class @exports InfoVimComponent */
export class InfoVimComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** vimAccountDetails to populate in InfoVIM Page @private */
  public vimAccountDetails: VimAccountDetails;

  /** Information Top Left @public */
  public configParams: {}[] = [];

  /** Showing more details of collapase */
  public isCollapsed: boolean = true;

  /** Contains vim details @public */
  public vimDetails: {}[];

  /** Check the Projects loading results @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** variables contains paramsID @private */
  private paramsID: string;

  /** Instance of the rest service @private */
  private restService: RestService;

  /** Holds the instance of router class @private */
  private router: Router;

  /** dataService to pass the data from one component to another @private */
  private dataService: DataService;

  /** vimId to populate in InfoVIM Page @private */
  private vimId: string;

  /** Holds teh instance of AuthService class of type AuthService @private */
  private activatedRoute: ActivatedRoute;

  /** Utilizes modal service for any modal operations @private */
  private modalService: NgbModal;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.dataService = this.injector.get(DataService);
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.modalService = this.injector.get(NgbModal);
    this.router = this.injector.get(Router);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    // tslint:disable-next-line:no-backbone-get-set-outside-model
    this.paramsID = this.activatedRoute.snapshot.paramMap.get('id');
    this.dataService.currentMessage.subscribe((data: VIMData) => {
      this.vimId = data.identifier;
    });
    this.generateData();
  }

  /** Routing to VIM Account Details Page @public */
  public onVimAccountBack(): void {
    this.router.navigate(['vim/details']).catch(() => {
      // Error Cached
    });
  }

  /** Generate Data function @public */
  public generateData(): void {
    this.isLoadingResults = true;
    this.restService.getResource(environment.VIMACCOUNTS_URL + '/' + this.paramsID)
      .subscribe((vimAccountsData: VimAccountDetails) => {
        this.showDetails(vimAccountsData);
        if (vimAccountsData.config !== undefined) {
          if (vimAccountsData.vim_type === 'openstack') {
            this.showOpenstackConfig(vimAccountsData.config);
          } else if (vimAccountsData.vim_type === 'aws') {
            this.awsConfig(vimAccountsData.config);
          } else if (vimAccountsData.vim_type === 'openvim' || vimAccountsData.vim_type === 'opennebula') {
            this.openVIMOpenNebulaConfig(vimAccountsData.config);
          } else if (vimAccountsData.vim_type === 'vmware') {
            this.vmwareConfig(vimAccountsData.config);
          } else if (vimAccountsData.vim_type === 'azure') {
            this.azureConfig(vimAccountsData.config);
          }
        }
        this.isLoadingResults = false;
      }, (error: ERRORDATA) => {
        this.isLoadingResults = false;
        if (error.error.status === HttpStatus.NOT_FOUND || error.error.status === HttpStatus.UNAUTHORIZED) {
          this.router.navigateByUrl('404', { skipLocationChange: true }).catch();
        } else {
          this.restService.handleError(error, 'get');
        }
      });
  }

  /** show general vim detailed information @public */
  public showDetails(vimAccountsData: VimAccountDetails): void {
    this.vimDetails = [
      {
        title: 'PAGE.VIMDETAILS.NAME',
        value: vimAccountsData.name
      },
      {
        title: 'PAGE.VIMDETAILS.VIMUSERNAME',
        value: vimAccountsData.vim_user
      },
      {
        title: 'PAGE.VIMDETAILS.VIMURL',
        value: vimAccountsData.vim_url
      },
      {
        title: 'PAGE.VIMDETAILS.VIMTYPE',
        value: vimAccountsData.vim_type
      },
      {
        title: 'PAGE.VIMDETAILS.TENANTNAME',
        value: vimAccountsData.vim_tenant_name
      },
      {
        title: 'PAGE.VIMDETAILS.DESCRIPTION',
        value: vimAccountsData.description
      },
      {
        title: 'PAGE.VIMDETAILS.SCHEMATYPE',
        value: vimAccountsData.schema_type
      },
      {
        title: 'PAGE.VIMDETAILS.SCHEMAVERSION',
        value: vimAccountsData.schema_version
      }
    ];
  }

  /** Openstack Config @public */
  public showOpenstackConfig(config: CONFIG): void {
    if (!isNullOrUndefined(config)) {
      Object.keys(config).forEach((key: string) => {
        if (Array.isArray(config[key])) {
          config[key] = JSON.stringify(config[key]);
        }
      });
    }
    let location: string = config.location;
    if (!isNullOrUndefined(location)) {
      const locationArr: string[] = config.location.split(',');
      if (Array.isArray(locationArr)) {
        location = locationArr[0];
      }
    }

    this.configParams = [
      {
        title: 'PAGE.VIMDETAILS.SDNCONTROLLER',
        value: config.sdn_controller
      },
      {
        title: 'PAGE.VIMDETAILS.SDNPORTMAPPING',
        value: config.sdn_port_mapping
      },
      {
        title: 'PAGE.VIMDETAILS.VIMNETWORKNAME',
        value: config.vim_network_name
      },
      {
        title: 'PAGE.VIMDETAILS.SECURITYGROUPS',
        value: config.security_groups
      },
      {
        title: 'PAGE.VIMDETAILS.AVAILABILITYZONE',
        value: config.availabilityZone
      },
      {
        title: 'PAGE.VIMDETAILS.REGIONALNAME',
        value: config.region_name
      },
      {
        title: 'PAGE.VIMDETAILS.INSECURE',
        value: config.insecure
      },
      {
        title: 'PAGE.VIMDETAILS.USEEXISTINGFLAVOURS',
        value: config.use_existing_flavors
      },
      {
        title: 'PAGE.VIMDETAILS.USEINTERNALENDPOINT',
        value: config.use_internal_endpoint
      },
      {
        title: 'PAGE.VIMDETAILS.ADDITIONALCONFIG',
        value: config.additional_conf
      },
      {
        title: 'PAGE.VIMDETAILS.APIVERSION',
        value: config.APIversion
      },
      {
        title: 'PAGE.VIMDETAILS.PROJECTDOMAINID',
        value: config.project_domain_id
      },
      {
        title: 'PAGE.VIMDETAILS.PROJECTDOMAINNAME',
        value: config.project_domain_name
      },
      {
        title: 'PAGE.VIMDETAILS.USERDOMAINID',
        value: config.user_domain_id
      },
      {
        title: 'PAGE.VIMDETAILS.USERDOMAINUSER',
        value: config.user_domain_name
      },
      {
        title: 'PAGE.VIMDETAILS.KEYPAIR',
        value: config.keypair
      },
      {
        title: 'PAGE.VIMDETAILS.DATAPLANEPHYSICALNET',
        value: config.dataplane_physical_net
      },
      {
        title: 'PAGE.VIMDETAILS.USEFLOATINGIP',
        value: config.use_floating_ip
      },
      {
        title: 'PAGE.VIMDETAILS.MICROVERSION',
        value: config.microversion
      },
      {
        title: 'PAGE.VIMDETAILS.VIMLOCATION',
        value: location
      }
    ];
  }

  /** AWS Config @public */
  public awsConfig(config: CONFIG): void {
    this.configParams = [
      {
        title: 'PAGE.VIMDETAILS.SDNCONTROLLER',
        value: config.sdn_controller
      },
      {
        title: 'PAGE.VIMDETAILS.VPCCIDRBLOCK',
        value: config.vpc_cidr_block
      },
      {
        title: 'PAGE.VIMDETAILS.SDNPORTMAPPING',
        value: config.sdn_port_mapping
      },
      {
        title: 'PAGE.VIMDETAILS.SECURITYGROUPS',
        value: config.security_groups
      },
      {
        title: 'PAGE.VIMDETAILS.VIMNETWORKNAME',
        value: config.vim_network_name
      },
      {
        title: 'PAGE.VIMDETAILS.KEYPAIR',
        value: config.keypair
      },
      {
        title: 'PAGE.VIMDETAILS.REGIONALNAME',
        value: config.region_name
      },
      {
        title: 'PAGE.VIMDETAILS.FLAVORIINFO',
        value: config.flavor_info
      },
      {
        title: 'PAGE.VIMDETAILS.ADDITIONALCONFIG',
        value: config.additional_conf
      }
    ];
  }

  /** Open vim and open nebula config @public */
  public openVIMOpenNebulaConfig(config: CONFIG): void {
    this.configParams = [
      {
        title: 'PAGE.VIMDETAILS.SDNCONTROLLER',
        value: config.sdn_controller
      },
      {
        title: 'PAGE.VIMDETAILS.SDNPORTMAPPING',
        value: config.sdn_port_mapping
      },
      {
        title: 'PAGE.VIMDETAILS.VIMNETWORKNAME',
        value: config.vim_network_name
      },
      {
        title: 'PAGE.VIMDETAILS.ADDITIONALCONFIG',
        value: config.additional_conf
      }
    ];
  }

  /** vmware config @public */
  public vmwareConfig(config: CONFIG): void {
    this.configParams = [
      {
        title: 'PAGE.VIMDETAILS.SDNCONTROLLER',
        value: config.sdn_controller
      },
      {
        title: 'PAGE.VIMDETAILS.ORGNAME',
        value: config.orgname
      },
      {
        title: 'PAGE.VIMDETAILS.SDNPORTMAPPING',
        value: config.sdn_port_mapping
      },
      {
        title: 'PAGE.VIMDETAILS.VCENTERIP',
        value: config.vcenter_ip
      },
      {
        title: 'PAGE.VIMDETAILS.VIMNETWORKNAME',
        value: config.vim_network_name
      },
      {
        title: 'PAGE.VIMDETAILS.VCENTERPORT',
        value: config.vcenter_port
      },
      {
        title: 'PAGE.VIMDETAILS.ADMINUSERNAME',
        value: config.admin_username
      },
      {
        title: 'PAGE.VIMDETAILS.VCENTERUSER',
        value: config.vcenter_user
      },
      {
        title: 'PAGE.VIMDETAILS.ADMINPASSWORD',
        value: config.admin_password
      },
      {
        title: 'PAGE.VIMDETAILS.VCENTERPASSWORD',
        value: config.vcenter_password
      },
      {
        title: 'PAGE.VIMDETAILS.NSXMANAGER',
        value: config.nsx_manager
      },
      {
        title: 'PAGE.VIMDETAILS.VROPSSITE',
        value: config.vrops_site
      },
      {
        title: 'PAGE.VIMDETAILS.NSXUSER',
        value: config.nsx_user
      },
      {
        title: 'PAGE.VIMDETAILS.VROPSUSER',
        value: config.vrops_user
      },
      {
        title: 'PAGE.VIMDETAILS.NSXPASSWORD',
        value: config.nsx_password
      },
      {
        title: 'PAGE.VIMDETAILS.VROPSPASSWORD',
        value: config.vrops_password
      },
      {
        title: 'PAGE.VIMDETAILS.ADDITIONALCONFIG',
        value: config.additional_conf
      }
    ];
  }

  /** Azure Config @public */
  public azureConfig(config: CONFIG): void {
    this.configParams = [
      {
        title: 'PAGE.VIMDETAILS.SUBSCRIPTIONID',
        value: config.subscription_id
      },
      {
        title: 'PAGE.VIMDETAILS.REGIONALNAME',
        value: config.region_name
      },
      {
        title: 'PAGE.VIMDETAILS.RESOURCEGROUP',
        value: config.resource_group
      },
      {
        title: 'PAGE.VIMDETAILS.VNETNAME',
        value: config.vnet_name
      },
      {
        title: 'PAGE.VIMDETAILS.FLAVORSPATTERN',
        value: config.flavors_pattern
      }
    ];
  }
}
