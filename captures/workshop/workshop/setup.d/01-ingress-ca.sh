#!/bin/bash

# Trusts the certificate authority that issued the cluster's ingress
# certificate, when the workshop definition mounts it at
# /opt/ingress-ca/ca.crt, as it does on a local cluster with a CA of its
# own. curl, git, skopeo and Python then reach the training portal, the
# lookup service and the Session's own services over HTTPS. On a cluster
# with a publicly trusted certificate there is nothing to mount, and
# nothing to do.

set -eo pipefail

if [ -s /opt/ingress-ca/ca.crt ]; then
    bundle=$HOME/.local/share/ingress-ca/bundle.pem
    mkdir -p "$(dirname "$bundle")"
    cat /etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem /opt/ingress-ca/ca.crt > "$bundle"
    for name in SSL_CERT_FILE CURL_CA_BUNDLE GIT_SSL_CAINFO REQUESTS_CA_BUNDLE; do
        echo "$name=$bundle" >> "$WORKSHOP_ENV"
    done
fi
