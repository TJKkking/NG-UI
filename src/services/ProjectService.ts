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
 * @file Project Service
 */
import { Injectable, Injector } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'AuthenticationService';
import { environment } from 'environment';
import { ProjectData } from 'ProjectModel';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { SwitchProjectComponent } from 'SwitchProjectComponent';
import { ProjectRoleMappings, UserDetail } from 'UserModel';
import { ProjectModel } from 'VNFDModel';
import { RestService } from './RestService';

/**
 * An Injectable is a class adorned with the @Injectable decorator function.
 * @Injectable takes a metadata object that tells Angular how to compile and run module code
 */
@Injectable({
    providedIn: 'root'
})
/** Exporting a class @exports ProjectService */
export class ProjectService {
    /** Get method for project list */
    get projectList(): Observable<{}[]> {
        return this.projectList$.asObservable();
    }
    /** To inject services @public */
    public injector: Injector;

    /** Holds all the projects details */
    public allProjectList: string[];

    /** Observable holds logined value  @public */
    public username$: Observable<string>;

    /** Hold Rest Service Objects */
    private restService: RestService;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Utilizes auth service for any auth operations @private */
    private authService: AuthenticationService;

    /** Holds the username in condition of type BehaviorSubject<string> @private */
    private projectList$: BehaviorSubject<{}[]> = new BehaviorSubject<{}[]>([]);

    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.modalService = this.injector.get(NgbModal);
        this.authService = this.injector.get(AuthenticationService);
    }

    /** List all the projects @public */
    public getAllProjects(): Observable<{}> {
        return this.restService.getResource(environment.PROJECTS_URL);
    }

    /** Get current project details from local storage @public */
    public getCurrentProjectDetails(): Observable<{}> {
        const project: string = localStorage.getItem('project_id');
        return this.restService.getResource(environment.PROJECTS_URL + '/' + project);
    }

    /** Returns all the projects for a particular users @public */
    public getUserProjects(): Observable<{}> {
        const username: string = localStorage.getItem('username');
        return this.restService.getResource(environment.USERS_URL + '/' + username);
    }

    /** Set header projects @public */
    public setHeaderProjects(): void {
        this.getUserProjects().subscribe((projects: UserDetail) => {
            const projectList: {}[] = projects.project_role_mappings;
            projectList.filter((list: ProjectModel) => {
                if (list.project === localStorage.getItem('project_id')) {
                    localStorage.setItem('project', list.project_name);
                    this.authService.projectName$.next(list.project_name);
                }
            });
            const projectDistinctList: {}[] = projectList.filter(
                (thing: ProjectRoleMappings, i: number, arr: []) => arr
                    .findIndex((t: ProjectRoleMappings) => t.project_name === thing.project_name) === i
            );
            this.projectList$.next(projectDistinctList);
        });
    }

    /** Toggle projects on selection @public */
    public switchProjectModal(list: ProjectData): void {
        const username: string = localStorage.getItem('username');
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        this.modalService.open(SwitchProjectComponent, { backdrop: 'static' })
            .componentInstance.params = { projectID: list.project, username };
    }
}
