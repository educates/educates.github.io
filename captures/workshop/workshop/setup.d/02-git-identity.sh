#!/bin/bash

# Gives git an identity for the commits the workshop makes.

set -eo pipefail

git config --global user.name > /dev/null || git config --global user.name "Workshop learner"
git config --global user.email > /dev/null || git config --global user.email "learner@example.com"
