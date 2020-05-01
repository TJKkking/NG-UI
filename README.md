<!--
Copyright 2020 TATA ELXSI

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: KUMARAN M (kumaran.m@tataelxsi.co.in), RAJESH S (rajesh.s@tataelxsi.co.in), BARATH KUMAR R (barath.r@tataelxsi.co.in)
-->

## Angular Based OSM NG UI
This project focuses on the implementation of a web GUI to interact with the Northbound API of OSM. 

The project is based on ([Angular](https://angular.io/)), a One framework for Mobile & desktop, app-design framework and development platform for creating efficient and sophisticated single-page web apps.

## Table of Contents

* [Community](#community)
* [Getting Started](#getting-started)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Running the application](#running-the-application)
* [Check the lint](#check-the-lint)
* [Supported Browsers](#supported-browsers)
* [Deployment](#deployment)
* [Built With](#built-with)
* [Contributing](#contributing)
* [Versioning](#versioning)
* [License](#license)

## Community

Contact [kumaran.m@tataelxsi.co.in](mailto:kumaran.m@tataelxsi.co.in), [rajesh.s@tataelxsi.co.in](mailto:rajesh.s@tataelxsi.co.in), [barath.r@tataelxsi.co.in](mailto:barath.r@tataelxsi.co.in) for architecture and design discussions, requests for help, features request and bug reports on NG UI. 

## Getting Started

Following instructions in the sections below will get you a copy of the project up and running on your local machine for development and testing purposes. See Deployment section for notes on how to deploy the project on a live system.

### Prerequisites

Angular Setup, Install, & Build Guide

1. Install Node.js from [here](https://nodejs.org/en/download/)
To check if nodejs is installed on your system, type below command. This will help you see the version of nodejs currently installed on your system.
`node -version`
After downloading Node.js, the node package manager (npm) should automatically be installed. Test it out by doing:
`npm --version`
2. Install Angluar CLI. [More details](https://cli.angular.io/) Angular can be installed Globally (or) Locally,
Install Globally
`npm install -g @angular/cli`
Install Locally
`npm install @angular/cli`
After installation done you can check the version using below command. It will display version details of angular-cli
`ng version`

We are done with the installation of Angular

### Installation

Clone the NG UI from the repository

`git clone "https://osm.etsi.org/gerrit/osm/NG-UI"`

Install the packages

`cd NG-UI`

`npm install`

### Running the application

The following instructions is for running NG UI locally for development purpose,

On the folder project

Open `proxy.conf.json`

Add the below code
```typescript
{
    "/osm/*": {
        "target": "https://OSM-NBI-IP:9999",
        "secure": false,
        "logLevel": "info"
    }
}
```
To run the application give the below command

`npm run proxy`
- To Run the NG-UI page Navigate to <http://localhost:4200/>

## Check the lint

To check the typescript lint run the below command

`npm run lint`

## Supported Browsers

- Edge (42.17134.1098.0) and IE 11 (Windows)
- Firefox (75.0)(Ubunutu)
- Firefox (75.0)(Windows)
- Chrome (81.0.4044.92) (Ubunutu)
- Chrome (81.0.4044.122) (Windows)

## Deployment

To deploy the NG UI use the [Dockerfile](Dockerfile)

## Built With

* [Angular Frame work](https://angular.io/) - The languages used are Javascript, Typescript, HTML, and SCSS

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://osm.etsi.org/gitweb/?p=osm/NG-UI.git;a=tags).

## License

This project is licensed under the Apache2 License - see the [LICENSE.md](LICENSE) file for details
