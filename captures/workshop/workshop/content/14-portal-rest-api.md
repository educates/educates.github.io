---
title: The portal's REST API
---

A site of your own can list the training portal's workshops and start
Sessions through its REST API. Log in with the portal's robot account, in
both terminals:

```terminal:execute-all
command: |-
  TOKEN=$(curl -s -X POST -u "$ROBOT_CLIENT_ID:$ROBOT_CLIENT_SECRET" -d "grant_type=password&username=$ROBOT_USERNAME&password=$ROBOT_PASSWORD" $PORTAL_URL/oauth2/token/ | jq -r .access_token)
clear: true
```

List the workshops it serves, with how many Sessions each can run:

```terminal:execute
command: |-
  curl -s -H "Authorization: Bearer $TOKEN" $PORTAL_URL/workshops/catalog/environments/ | jq -r '.environments[] | [.name, .workshop.title, .capacity] | @tsv'
```

Ask for a Session for one of your users, `learner-0042`:

```terminal:execute
command: |-
  curl -s -H "Authorization: Bearer $TOKEN" "$PORTAL_URL/workshops/environment/$WORKSHOP_NAMESPACE/request/?user=learner-0042&index_url=https://academy.example.com/" | jq '{name, user, url}'
session: 2
clear: true
```

Ask again for the same user, and the portal hands back the Session they
already have:

```terminal:execute
command: |-
  curl -s -H "Authorization: Bearer $TOKEN" "$PORTAL_URL/workshops/environment/$WORKSHOP_NAMESPACE/request/?user=learner-0042&index_url=https://academy.example.com/" | jq -c '{name, user}'
session: 2
```
