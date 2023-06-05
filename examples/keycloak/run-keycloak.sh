#!/bin/bash

podman run --rm -p 18080:8080 --name keycloak \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v "$PWD/artemis-demo-realm.json":/opt/keycloak/data/import/artemis-demo-realm.json:Z \
  quay.io/keycloak/keycloak \
  -v start-dev --import-realm