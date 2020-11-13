# Copyright 2020 TATA ELXSI
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Author: KUMARAN M (kumaran.m@tataelxsi.co.in), RAJESH S (rajesh.s@tataelxsi.co.in), BARATH KUMAR R (barath.r@tataelxsi.co.in), VIJAY NAG (vijaynag.bs@tataelxsi.co.in)

FROM ubuntu:18.04
# Installing node dependencies.
RUN apt-get update && apt-get install -y curl xz-utils gnupg2 \
    && apt-get update && apt-get install -y apt-transport-https \
    && curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
    && echo "deb https://deb.nodesource.com/node_10.x bionic main" | tee -a /etc/apt/sources.list.d/nodesource.list \
    && echo "deb-src https://deb.nodesource.com/node_10.x bionic main" | tee -a /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y nodejs \
    && apt-get install -y nginx

# Preparing working environment.
RUN mkdir -p /usr/src/osm-angularapp
WORKDIR /usr/src/osm-angularapp

# Installing dependencies.
COPY ./package.json /usr/src/osm-angularapp/
RUN npm install

# Copy osm-angularapp source into image.
COPY ./ /usr/src/osm-angularapp

# Building app.
RUN npm run build

# Removing nginx default page.
RUN rm -rf /usr/share/nginx/html/*

# Copying nginx configuration.
COPY nginx/nginx.conf /etc/nginx/sites-available/default
RUN cp -r /usr/src/osm-angularapp/dist/osm/* /usr/share/nginx/html

# Exposing ports.
EXPOSE 80

# Starting server.
CMD ["nginx", "-g", "daemon off;"]

