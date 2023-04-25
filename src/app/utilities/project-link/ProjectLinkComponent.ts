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
 * @file Project Link Component.
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { environment } from 'environment';
import { ProjectData } from 'ProjectModel';
import { ProjectService } from 'ProjectService';
import { RestService } from 'RestService';
import { UserDetail } from 'UserModel';
/**
 * Creating component
 * @Component takes ProjectLinkComponent.html as template url
 */
@Component({
  selector: 'app-project-link',
  templateUrl: './ProjectLinkComponent.html',
  styleUrls: ['./ProjectLinkComponent.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Exporting a class @exports ProjectLinkComponent */
export class ProjectLinkComponent implements OnInit {
  /** Invoke service injectors @public */
  public injector: Injector;
  /** Variables holds the selected project @public */
  public selectedProject: string;
  /** To get the value from the nspackage via valuePrepareFunction default Property of ng-smarttable @public */
  public value: ProjectData;
  /** Variables holds all the projects @public */
  public projectList: {}[] = [];
  /** Check the project is present for the user @public */
  public isPresent: boolean = false;
  /** Set timeout @private */
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  private timeOut: number = 10;
  /** Instance of the rest service @private */
  private restService: RestService;
  /** Holds all project details @private */
  private projectService: ProjectService;
  /** Detect changes for the User Input */
  private cd: ChangeDetectorRef;
  constructor(injector: Injector) {
    this.injector = injector;
    this.projectService = this.injector.get(ProjectService);
    this.restService = this.injector.get(RestService);
    this.cd = this.injector.get(ChangeDetectorRef);
  }

  public ngOnInit(): void {
    this.selectedProject = localStorage.getItem('project');
    this.getAdminProjects();
  }

  /** Get the admin projects to be selectable @public */
  public getAdminProjects(): void {
    const username: string = localStorage.getItem('username');
    this.restService.getResource(environment.USERS_URL + '/' + username).subscribe((projects: UserDetail) => {
      this.projectList = projects.project_role_mappings;
      this.isPresent = this.projectList.some((item: ProjectData) => item.project === this.value.project);
      setTimeout(() => {
        this.cd.detectChanges();
      }, this.timeOut);
    });
  }
}
