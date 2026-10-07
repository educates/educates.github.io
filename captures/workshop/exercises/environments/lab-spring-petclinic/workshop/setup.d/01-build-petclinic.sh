#!/bin/bash

# Clones the application and warms the Maven cache, so the first build in
# the workshop is quick.

set -eo pipefail

git clone -q https://github.com/spring-projects/spring-petclinic.git ~/exercises/spring-petclinic
cd ~/exercises/spring-petclinic && ./mvnw -q dependency:go-offline
