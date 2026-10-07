---
title: One API for every portal
---

The lookup service puts one REST API in front of the training portals on
every cluster it watches. Log in, as a platform admin in the first terminal
and as the Example Academy site in the second:

```terminal:execute
command: |-
  TOKEN=$(curl -s -X POST $LOOKUP_URL/auth/login -H "Content-Type: application/json" -d "{\"username\": \"$LOOKUP_ADMIN_USERNAME\", \"password\": \"$LOOKUP_ADMIN_PASSWORD\"}" | jq -r .access_token)
clear: true
```

```terminal:execute
command: |-
  TOKEN=$(curl -s -X POST $LOOKUP_URL/auth/login -H "Content-Type: application/json" -d "{\"username\": \"$LOOKUP_USERNAME\", \"password\": \"$LOOKUP_PASSWORD\"}" | jq -r .access_token)
session: 2
clear: true
```

The admin sees every cluster and the portals on each:

```terminal:execute
command: |-
  curl -s -H "Authorization: Bearer $TOKEN" $LOOKUP_URL/api/v1/clusters | jq && curl -s -H "Authorization: Bearer $TOKEN" $LOOKUP_URL/api/v1/portals | jq
```

Tenants pick clusters and portals by name or by label:

```editor:open-file
file: ~/exercises/lookup/tenants.yaml
```

The site sees only the workshops of its tenant:

```terminal:execute
command: |-
  curl -s -H "Authorization: Bearer $TOKEN" "$LOOKUP_URL/api/v1/workshops?tenant=$LOOKUP_TENANT" | jq
session: 2
```

And asks for a Session for one of its learners, with their details, a
parameter for the workshop and a webhook for its events:

```terminal:execute
command: |-
  curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" $LOOKUP_URL/api/v1/workshops -d '{
    "tenantName": "'$LOOKUP_TENANT'",
    "workshopName": "'$WORKSHOP_NAME'",
    "clientUserId": "learner-0042",
    "userFirstName": "Sam",
    "userLastName": "Example",
    "userEmailAddress": "sam@example.com",
    "clientIndexUrl": "https://academy.example.com/",
    "workshopParams": [{"name": "TEAM_NAME", "value": "bookshelf"}],
    "analyticsWebhookUrl": "'$EVENTS_URL'"
  }' | jq
session: 2
clear: true
```
