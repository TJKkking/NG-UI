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
 * @file  Model for user related information.
 */

/** Interface for UserDetails */
export interface UserDetails {
    userDetail: UserDetail[];
}

/** Interface for UserDetail */
export interface UserDetail {
    username: string;
    password?: string;
    _id?: string;
    projects: string[];
    _admin?: Admin;
    modified: string;
    created: string;
    identifier: string;
    projectListName?: string;
    project_role_mappings?: ProjectRoleMappings[];
    account_expire_time: string;
    password_expire_time?: string;
}

/** Interface for user role mappings */
export interface UserRoleMap {
    project_role_mappings?: ProjectRoleMappings[];
    remove_project_role_mappings?: ProjectRoleMappings[];
}

/** Interface for Admin */
interface Admin {
    salt: string;
    created: number;
    modified: number;
    user_status?: string;
    account_expire_time?: number;
    password_expire_time?: number;
}
/** Interface for UserDetail */
export interface UserData {
    username: string;
    projects: string;
    modified: string;
    created: string;
    identifier: string;
    user_status: string;
    account_expire_time?: string;
}

/** Interface for Project Roles Mappings */
export interface ProjectRoleMappings {
    project?: string;
    project_name?: string;
    role?: string;
    role_name?: string;
}
