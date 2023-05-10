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
 * @file Bread Crumb component.
 */
import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent, UrlSegment } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BREADCRUMBITEM } from 'CommonModel';
import { filter, startWith } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';

/**
 * Creating component
 * @Component takes BreadcrumbComponent.html as template url
 */
@Component({
  selector: 'app-breadcrumb',
  templateUrl: './BreadcrumbComponent.html',
  styleUrls: ['./BreadcrumbComponent.scss']
})

/** Exporting a class @exports BreadcrumbComponent */
export class BreadcrumbComponent implements OnInit {
  /** To inject breadCrumb @public */
  public static readonly ROUTE_DATA_BREADCRUMB: string = 'breadcrumb';

  /** To inject services @public */
  public injector: Injector;

  /** To inject breadCrumb Default icon and url @public */
  public readonly home: {} = { icon: 'pi pi-th-large', url: '/' };

  /** To inject breadCrumb Menus @public */
  public menuItems: BREADCRUMBITEM[];

  /** Service holds the router information @private */
  private router: Router;

  /** Holds teh instance of AuthService class of type AuthService @private */
  private activatedRoute: ActivatedRoute;

  /** handle translate service @private */
  private translateService: TranslateService;

  /** Title Service in create ticket page */
  private titleService: Title;

  constructor(injector: Injector) {
    this.injector = injector;
    this.router = this.injector.get(Router);
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.translateService = this.injector.get(TranslateService);
    this.titleService = this.injector.get(Title);
  }
  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    this.router.events
      .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd), startWith(undefined))
      .subscribe(() => this.menuItems = this.createBreadcrumbs(this.activatedRoute.root));
  }
  /** To set the title if the page @private */
  public setTitle(newTitle: string): void {
      this.titleService.setTitle(newTitle);
  }
  /** Generate breadcrumbs from data given the module routes @private */
  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: BREADCRUMBITEM[] = []):
    BREADCRUMBITEM[] {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }
    for (const child of children) {
      const routeURL: string = child.snapshot.url.map((segment: UrlSegment) => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }
      let menuLIst: BREADCRUMBITEM[] = child.snapshot.data[BreadcrumbComponent.ROUTE_DATA_BREADCRUMB];
      if (!isNullOrUndefined(menuLIst)) {
        menuLIst = JSON.parse(JSON.stringify(menuLIst));
        menuLIst.forEach((item: BREADCRUMBITEM) => {
          if (!isNullOrUndefined(item.title)) {
            item.title = item.title.replace('{type}', this.checkTitle(item, child.snapshot.params.type));
            item.title = item.title.replace('{id}', child.snapshot.params.id);
            item.title = item.title.replace('{project}', sessionStorage.getItem('project'));
          }
          if (!isNullOrUndefined(item.url)) {
            item.url = item.url.replace('{type}', child.snapshot.params.type);
            item.url = item.url.replace('{id}', child.snapshot.params.id);
          }
          breadcrumbs.push(item);
        });
      }
      this.setTitleforApplication(breadcrumbs);
      return this.createBreadcrumbs(child, url, breadcrumbs);
    }
  }
  /** Generate title from data given the module routes @private */
  private setTitleforApplication(breadcrumbs: BREADCRUMBITEM[]): void {
      let addTitle: string = 'Open Source MANO';
      breadcrumbs.forEach((data: BREADCRUMBITEM): void => {
        addTitle += ' | ' + this.translateService.instant(data.title);
      });
      this.setTitle(addTitle);
  }
  /** Check and update title based on type of operations @private */
  private checkTitle(breadcrumbItem: BREADCRUMBITEM, opertionType: string): string {
    if (!isNullOrUndefined(breadcrumbItem.url)) {
      if (breadcrumbItem.url.indexOf('packages') !== -1) {
        return this.matchPackageTitle(opertionType);
      }
      if (breadcrumbItem.url.indexOf('instances') !== -1) {
        return this.matchInstanceTitle(opertionType);
      }
      return breadcrumbItem.title;
    }
  }
  /** check and update package title based on package type @private */
  private matchPackageTitle(opertionType: string): string {
    if (opertionType === 'ns') {
      return this.translateService.instant('NSPACKAGES');
    } else if (opertionType === 'vnf') {
      return this.translateService.instant('VNFPACKAGES');
    } else {
      return this.translateService.instant('PAGE.DASHBOARD.NETSLICETEMPLATE');
    }
  }
  /** check and update package title based on instance type @private */
  private matchInstanceTitle(opertionType: string): string {
    if (opertionType === 'ns') {
      return this.translateService.instant('NSINSTANCES');
    } else if (opertionType === 'vnf') {
      return this.translateService.instant('VNFINSTANCES');
    } else if (opertionType === 'pdu') {
      return this.translateService.instant('PDUINSTANCES');
    } else {
      return this.translateService.instant('PAGE.DASHBOARD.NETSLICEINSTANCE');
    }
  }

}
