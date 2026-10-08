// Sets up and removes everything the captures need on the cluster: the
// capture workshop in a training portal of its own, the lookup service's
// cluster, tenant and clients, two customers kept apart by the lookup
// service, each with a portal, a tenant and a client of its own, and
// Example Academy, the small front end in captures/custom-site that stands
// in for a training team's own site and for the customers' sites.
//
// Every resource it creates carries the label `partOf` (or is named for
// the portal), so `teardown()` removes exactly what `setup()` created and
// nothing else.

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { stringify } from "yaml";

/** The training portal the capture workshop is deployed to. */
export const portal = "site-captures";

/** The label on every other resource the captures create. */
export const partOf = { "app.kubernetes.io/part-of": portal };
const partOfSelector = "app.kubernetes.io/part-of=site-captures";

/** Where Example Academy runs. */
export const siteNamespace = "site-captures-example-academy";
/** The hostname prefix of Example Academy, under the ingress domain. */
export const siteHost = "example-academy";
/**
 * Where the training portal posts its analytics events: Example Academy's
 * service inside the cluster, which the portal reaches directly.
 */
export const eventsUrl = `http://${siteHost}.${siteNamespace}.svc.cluster.local:8080/events`;

/** The lookup service tenant Example Academy reaches. */
export const lookupTenant = "example-academy";

/**
 * Two customers one lookup service keeps apart. Each has a training portal
 * listing some of the capture workshops, by their definitions' names, a
 * tenant that picks that portal, and a client granted only that tenant,
 * which its site in Example Academy logs in as.
 */
export const customers = [
  {
    id: "acme",
    name: "Acme Training",
    initials: "AT",
    colour: "#7a2e1f",
    workshops: ["lab-site-captures", "lab-site-captures-vcluster"],
  },
  {
    id: "globex",
    name: "Globex Academy",
    initials: "GA",
    colour: "#1f5f4a",
    workshops: ["lab-site-captures-python"],
  },
] as const;

type Customer = (typeof customers)[number];

/** A customer's training portal. */
function customerPortal(customer: Customer) {
  return `${portal}-${customer.id}`;
}

/** A customer's tenant of the lookup service. */
function customerTenant(customer: Customer) {
  return customer.id;
}

/** A customer's client of the lookup service, granted only its tenant. */
function customerClient(customer: Customer) {
  return `${customer.id}-site`;
}

const workshopDir = resolve("captures/workshop");
const siteApp = resolve("captures/custom-site/app.py");

/**
 * The capture workshop's definitions, in the order the portal lists them,
 * with the options each is deployed with. The first holds most pages, and
 * keeps a Session in reserve so a new one opens at once.
 */
export const workshops = [
  {
    file: "resources/workshop.yaml",
    options: [
      "--initial",
      "1",
      "--reserved",
      "1",
      "--expires",
      "60m",
      "--deadline",
      "90m",
    ],
    withEnv: true,
  },
  {
    file: "resources/workshop-virtual-cluster.yaml",
    options: [],
    withEnv: false,
  },
  {
    file: "resources/workshop-no-kubernetes.yaml",
    options: [],
    withEnv: false,
  },
] as const;

function run(
  command: string,
  args: string[],
  options: { cwd?: string; input?: string } = {},
) {
  return execFileSync(command, args, {
    cwd: options.cwd,
    input: options.input,
    encoding: "utf8",
    stdio: [options.input === undefined ? "ignore" : "pipe", "pipe", "inherit"],
  });
}

function kubectl(args: string[], input?: string) {
  return run("kubectl", args, input === undefined ? {} : { input });
}

function educates(args: string[]) {
  const cli = process.env.EDUCATES_CLI ?? "educates";
  return run(cli, args, { cwd: workshopDir });
}

function apply(objects: object[]) {
  kubectl(
    ["apply", "-f", "-"],
    objects.map((object) => stringify(object)).join("---\n"),
  );
}

function json(args: string[]) {
  return JSON.parse(kubectl([...args, "-o", "json"]));
}

/** The cluster's ingress: its domain, protocol and wildcard certificate. */
export function clusterIngress() {
  const status = json(["get", "educatesclusterconfig", "cluster"]).status
    .ingress;
  return {
    domain: status.domain as string,
    protocol: status.protocol as string,
    certificate: status.wildcardCertificateSecretRef as {
      name: string;
      namespace: string;
    },
  };
}

/** The training portal's URL, access code and robot account. */
export function portalDetails(name = portal) {
  const resource = json(["get", "trainingportal", name]);
  const educatesStatus = resource.status.educates;
  return {
    url: educatesStatus.url as string,
    accessCode: (resource.spec.portal?.password ?? "") as string,
    robot: {
      username: educatesStatus.credentials.robot.username as string,
      password: educatesStatus.credentials.robot.password as string,
      clientId: educatesStatus.clients.robot.id as string,
      clientSecret: educatesStatus.clients.robot.secret as string,
    },
  };
}

function password() {
  return randomBytes(18).toString("base64url");
}

function lookupConfig(
  sitePassword: string,
  adminPassword: string,
  customerPasswords: Record<string, string>,
) {
  const metadata = (name: string) => ({
    name,
    namespace: "educates-config",
    labels: partOf,
  });
  return [
    {
      apiVersion: "lookup.educates.dev/v1beta1",
      kind: "ClusterConfig",
      metadata: metadata("local-cluster"),
    },
    {
      apiVersion: "lookup.educates.dev/v1beta1",
      kind: "TenantConfig",
      metadata: metadata(lookupTenant),
      spec: {
        clusters: { nameSelector: { matchNames: ["local-cluster"] } },
        portals: { nameSelector: { matchNames: [portal] } },
      },
    },
    {
      apiVersion: "lookup.educates.dev/v1beta1",
      kind: "ClientConfig",
      metadata: metadata("example-academy-site"),
      spec: {
        client: { password: sitePassword },
        roles: ["tenant"],
        tenants: [lookupTenant],
      },
    },
    {
      apiVersion: "lookup.educates.dev/v1beta1",
      kind: "ClientConfig",
      metadata: metadata("platform-admin"),
      spec: {
        client: { password: adminPassword },
        roles: ["admin"],
        tenants: ["*"],
      },
    },
    ...customers.flatMap((customer) => [
      {
        apiVersion: "lookup.educates.dev/v1beta1",
        kind: "TenantConfig",
        metadata: metadata(customerTenant(customer)),
        spec: {
          clusters: { nameSelector: { matchNames: ["local-cluster"] } },
          portals: {
            nameSelector: { matchNames: [customerPortal(customer)] },
          },
        },
      },
      {
        apiVersion: "lookup.educates.dev/v1beta1",
        kind: "ClientConfig",
        metadata: metadata(customerClient(customer)),
        spec: {
          client: { password: customerPasswords[customer.id] },
          roles: ["tenant"],
          tenants: [customerTenant(customer)],
        },
      },
    ]),
  ];
}

function exampleAcademy(
  ingress: ReturnType<typeof clusterIngress>,
  details: ReturnType<typeof waitForPortal>,
  sitePassword: string,
  customerPasswords: Record<string, string>,
) {
  const labels = { ...partOf, app: siteHost };
  const metadata = (name: string) => ({
    name,
    namespace: siteNamespace,
    labels,
  });
  const host = `${siteHost}.${ingress.domain}`;
  return [
    {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: { name: siteNamespace, labels: partOf },
    },
    {
      // The secrets manager copies the ingress certificate in, for the
      // site's HTTPS and for the CA it trusts when calling the lookup service.
      apiVersion: "secrets.educates.dev/v1beta1",
      kind: "SecretCopier",
      metadata: { name: siteNamespace, labels: partOf },
      spec: {
        rules: [
          {
            sourceSecret: ingress.certificate,
            targetNamespaces: { nameSelector: { matchNames: [siteNamespace] } },
          },
        ],
      },
    },
    {
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: metadata("example-academy-app"),
      data: { "app.py": readFileSync(siteApp, "utf8") },
    },
    {
      apiVersion: "v1",
      kind: "Secret",
      metadata: metadata("example-academy-lookup"),
      stringData: { password: sitePassword },
    },
    {
      // The portal's robot account, for the catalog built on its REST API.
      apiVersion: "v1",
      kind: "Secret",
      metadata: metadata("example-academy-portal"),
      stringData: {
        "client-id": details.robot.clientId,
        "client-secret": details.robot.clientSecret,
        username: details.robot.username,
        password: details.robot.password,
      },
    },
    {
      // The customers' sites, each with the client it logs in as.
      apiVersion: "v1",
      kind: "Secret",
      metadata: metadata("example-academy-customers"),
      stringData: {
        customers: JSON.stringify(
          customers.map((customer) => ({
            id: customer.id,
            name: customer.name,
            initials: customer.initials,
            colour: customer.colour,
            tenant: customerTenant(customer),
            username: customerClient(customer),
            password: customerPasswords[customer.id],
          })),
        ),
      },
    },
    { apiVersion: "v1", kind: "ServiceAccount", metadata: metadata(siteHost) },
    {
      // Read access to deployments, for the check it runs from outside a
      // Session.
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "ClusterRole",
      metadata: { name: siteNamespace, labels: partOf },
      rules: [
        { apiGroups: ["apps"], resources: ["deployments"], verbs: ["get"] },
      ],
    },
    {
      apiVersion: "rbac.authorization.k8s.io/v1",
      kind: "ClusterRoleBinding",
      metadata: { name: siteNamespace, labels: partOf },
      roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: siteNamespace,
      },
      subjects: [
        { kind: "ServiceAccount", name: siteHost, namespace: siteNamespace },
      ],
    },
    {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: metadata(siteHost),
      spec: {
        selector: { matchLabels: { app: siteHost } },
        template: {
          metadata: { labels },
          spec: {
            serviceAccountName: siteHost,
            securityContext: {
              runAsNonRoot: true,
              seccompProfile: { type: "RuntimeDefault" },
            },
            containers: [
              {
                name: "site",
                image: "python:3.13-alpine",
                command: ["python3", "/opt/app/app.py"],
                env: [
                  {
                    name: "LOOKUP_URL",
                    value: `${ingress.protocol}://lookup.${ingress.domain}`,
                  },
                  { name: "LOOKUP_TENANT", value: lookupTenant },
                  { name: "LOOKUP_USERNAME", value: "example-academy-site" },
                  {
                    name: "LOOKUP_PASSWORD",
                    valueFrom: {
                      secretKeyRef: {
                        name: "example-academy-lookup",
                        key: "password",
                      },
                    },
                  },
                  { name: "PORTAL_URL", value: details.url },
                  ...(
                    [
                      ["ROBOT_CLIENT_ID", "client-id"],
                      ["ROBOT_CLIENT_SECRET", "client-secret"],
                      ["ROBOT_USERNAME", "username"],
                      ["ROBOT_PASSWORD", "password"],
                    ] as const
                  ).map(([name, key]) => ({
                    name,
                    valueFrom: {
                      secretKeyRef: { name: "example-academy-portal", key },
                    },
                  })),
                  {
                    name: "CUSTOMERS",
                    valueFrom: {
                      secretKeyRef: {
                        name: "example-academy-customers",
                        key: "customers",
                      },
                    },
                  },
                  { name: "SITE_URL", value: `${ingress.protocol}://${host}` },
                  { name: "EVENTS_URL", value: eventsUrl },
                  { name: "SSL_CERT_FILE", value: "/opt/ingress-ca/ca.crt" },
                ],
                ports: [{ containerPort: 8080 }],
                readinessProbe: { httpGet: { path: "/healthz", port: 8080 } },
                securityContext: {
                  runAsUser: 1000,
                  allowPrivilegeEscalation: false,
                  capabilities: { drop: ["ALL"] },
                },
                volumeMounts: [
                  { name: "app", mountPath: "/opt/app" },
                  { name: "ingress-ca", mountPath: "/opt/ingress-ca" },
                ],
              },
            ],
            volumes: [
              { name: "app", configMap: { name: "example-academy-app" } },
              {
                name: "ingress-ca",
                secret: {
                  secretName: ingress.certificate.name,
                  optional: true,
                  items: [{ key: "ca.crt", path: "ca.crt" }],
                },
              },
            ],
          },
        },
      },
    },
    {
      apiVersion: "v1",
      kind: "Service",
      metadata: metadata(siteHost),
      spec: {
        selector: { app: siteHost },
        ports: [{ port: 8080, targetPort: 8080 }],
      },
    },
    {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: metadata(siteHost),
      spec: {
        ingressClassName: json(["get", "educatesclusterconfig", "cluster"])
          .status.ingress.ingressClassName,
        tls: [{ hosts: [host], secretName: ingress.certificate.name }],
        rules: [
          {
            host,
            http: {
              paths: [
                {
                  path: "/",
                  pathType: "Prefix",
                  backend: {
                    service: { name: siteHost, port: { number: 8080 } },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ];
}

/**
 * Publishes the capture workshop, deploys it to its own training portal,
 * and sets up the lookup service, the customers' portals and Example
 * Academy beside it.
 */
export function setup(log: (message: string) => void = console.log) {
  const ingress = clusterIngress();
  log(`setup: publishing the capture workshop from ${workshopDir}`);
  educates(["publish-workshop"]);

  if (!exists("trainingportal", portal)) {
    // The portal takes its analytics webhook and the sites allowed to embed
    // it when it is created, so it is created here with them, as
    // `educates create-portal` would create it otherwise.
    log(`setup: creating the training portal ${portal}`);
    kubectl(["create", "-f", "-"], stringify(trainingPortal(portal, ingress)));
  }

  log("setup: configuring the lookup service");
  const sitePassword = password();
  const adminPassword = password();
  const customerPasswords = Object.fromEntries(
    customers.map((customer) => [customer.id, password()]),
  );
  if (!namespaceExists("educates-config")) {
    apply([
      {
        apiVersion: "v1",
        kind: "Namespace",
        metadata: { name: "educates-config", labels: partOf },
      },
    ]);
  }
  apply(lookupConfig(sitePassword, adminPassword, customerPasswords));

  const details = waitForPortal();
  log(
    `setup: deploying Example Academy at ${ingress.protocol}://${siteHost}.${ingress.domain}`,
  );
  apply(exampleAcademy(ingress, details, sitePassword, customerPasswords));
  kubectl([
    "-n",
    siteNamespace,
    "rollout",
    "restart",
    `deployment/${siteHost}`,
  ]);

  const env = {
    PORTAL_URL: details.url,
    ROBOT_USERNAME: details.robot.username,
    ROBOT_PASSWORD: details.robot.password,
    ROBOT_CLIENT_ID: details.robot.clientId,
    ROBOT_CLIENT_SECRET: details.robot.clientSecret,
    LOOKUP_URL: `${ingress.protocol}://lookup.${ingress.domain}`,
    LOOKUP_TENANT: lookupTenant,
    LOOKUP_USERNAME: "example-academy-site",
    LOOKUP_PASSWORD: sitePassword,
    LOOKUP_ADMIN_USERNAME: "platform-admin",
    LOOKUP_ADMIN_PASSWORD: adminPassword,
    EVENTS_URL: eventsUrl,
  };
  for (const workshop of workshops) {
    log(`setup: deploying ${workshop.file}`);
    const envArgs = workshop.withEnv
      ? Object.entries(env).flatMap(([name, value]) => [
          "--env",
          `${name}=${value}`,
        ])
      : [];
    educates([
      "deploy-workshop",
      "--portal",
      portal,
      "--workshop-file",
      workshop.file,
      ...workshop.options,
      ...envArgs,
    ]);
  }

  waitForPortal();
  // A customer's portal lists workshop definitions deployed above, so it is
  // created once they exist.
  for (const customer of customers) {
    const name = customerPortal(customer);
    if (!exists("trainingportal", name)) {
      log(`setup: creating the training portal ${name} for ${customer.name}`);
      const resource = trainingPortal(name, ingress);
      // `educates deploy-workshop` names a definition after the portal, the
      // workshop, and a hash of where the workshop's files are.
      const listed = captureDefinitions();
      resource.spec.workshops = customer.workshops.map((workshop) => {
        const definition = listed.find((candidate) =>
          new RegExp(`^${portal}--${workshop}-[0-9a-f]+$`).test(candidate),
        );
        if (!definition)
          throw new Error(`the capture portal lists no workshop ${workshop}`);
        return { name: definition, capacity: 1 };
      }) as never[];
      kubectl(["create", "-f", "-"], stringify(resource));
    }
  }
  for (const customer of customers) waitForPortal(customerPortal(customer));
  kubectl([
    "-n",
    siteNamespace,
    "rollout",
    "status",
    `deployment/${siteHost}`,
    "--timeout=180s",
  ]);
  log("setup: done");
}

/**
 * A training portal for the captures, as `educates create-portal` makes
 * one, with an access code, anonymous learners and room for 12 Sessions,
 * plus Example Academy's webhook for analytics and permission to embed the
 * portal in its pages. `branding` gives it a title and logo of its own.
 */
export function trainingPortal(
  name: string,
  ingress: ReturnType<typeof clusterIngress>,
  branding?: { title: string; logo: string },
) {
  return {
    apiVersion: "training.educates.dev/v1beta1",
    kind: "TrainingPortal",
    metadata: { name, labels: partOf },
    spec: {
      portal: {
        password: randomBytes(9).toString("base64url"),
        registration: { type: "anonymous" },
        sessions: { maximum: 12 },
        updates: { workshop: true },
        theme: {
          frame: {
            ancestors: [`${ingress.protocol}://${siteHost}.${ingress.domain}`],
          },
        },
        ...branding,
      },
      analytics: { webhook: { url: eventsUrl } },
      workshops: [],
    },
  };
}

function exists(kind: string, name: string) {
  const names = kubectl(["get", kind, "-o", "name"]).split("\n");
  return names.some((line) => line.endsWith(`/${name}`));
}

function namespaceExists(name: string) {
  return exists("namespaces", name);
}

/**
 * Waits until the portal is running and answers in the browser, which it
 * does a minute or two after it starts, and returns its details.
 */
export function waitForPortal(name = portal, timeoutMs = 600_000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (Date.now() > deadline)
      throw new Error(`training portal ${name} is not answering`);
    try {
      const resource = json(["get", "trainingportal", name]);
      const url = resource.status?.educates?.url as string | undefined;
      if (resource.status?.educates?.phase === "Running" && url) {
        // The cluster's ingress certificate comes from a local CA, so
        // this check does not verify it.
        const status = execFileSync(
          "curl",
          [
            "-sk",
            "-m",
            "10",
            "-o",
            "/dev/null",
            "-w",
            "%{http_code}",
            `${url}/`,
          ],
          { encoding: "utf8" },
        );
        if (status === "302" || status === "200") return portalDetails(name);
      }
    } catch {
      // Not there yet.
    }
    execFileSync("sleep", ["5"]);
  }
}

/**
 * Restarts the portal, which then picks up workshop environments it failed
 * to activate, as it can when its database is busy, and waits until it
 * answers again.
 */
export function restartPortal() {
  const namespace = `${portal}-ui`;
  kubectl([
    "-n",
    namespace,
    "rollout",
    "restart",
    "deployment/training-portal",
  ]);
  kubectl([
    "-n",
    namespace,
    "rollout",
    "status",
    "deployment/training-portal",
    "--timeout=300s",
  ]);
  waitForPortal();
}

/**
 * The capture workshops' definitions, which `educates deploy-workshop`
 * created for the capture portal, in the order it lists them.
 */
function captureDefinitions(): string[] {
  const listed = json(["get", "trainingportal", portal]).spec.workshops as {
    name: string;
  }[];
  return listed
    .map(({ name }) => name)
    .filter((name) => name.startsWith(`${portal}--lab-site-captures`));
}

/** The portal with a title and logo of its own, for the branding shot. */
export const brandedPortal = `${portal}-academy`;

/**
 * Creates the branded portal, listing the capture workshops, and returns
 * its details once it answers. It takes its title and logo when created.
 */
export function createBrandedPortal(branding: { title: string; logo: string }) {
  const ingress = clusterIngress();
  const resource = trainingPortal(brandedPortal, ingress, branding);
  resource.spec.workshops = captureDefinitions().map((name) => ({
    name,
    capacity: 1,
  })) as never[];
  kubectl(["delete", "trainingportal", brandedPortal, "--ignore-not-found"]);
  kubectl(["create", "-f", "-"], stringify(resource));
  return waitForPortal(brandedPortal);
}

/** Deletes the branded portal. */
export function deleteBrandedPortal() {
  kubectl([
    "delete",
    "trainingportal",
    brandedPortal,
    "--ignore-not-found",
    "--wait=false",
  ]);
}

/**
 * Removes the portal, with its workshops and Sessions, and everything else
 * `setup()` created.
 */
export function teardown(log: (message: string) => void = console.log) {
  log(`teardown: deleting the training portal ${portal}`);
  try {
    educates(["delete-portal", "--portal", portal]);
  } catch {
    log(`teardown: no training portal ${portal}`);
  }
  // The customers' portals, and the portal with a title and logo of its
  // own, for its shot.
  kubectl([
    "delete",
    "trainingportals",
    "-l",
    partOfSelector,
    "--ignore-not-found",
  ]);
  // The workshop definitions `educates deploy-workshop` created for the
  // portal, which it names after it, and which outlive the portal.
  const definitions = kubectl(["get", "workshops", "-o", "name"])
    .split("\n")
    .filter((name) =>
      name.startsWith(`workshop.training.educates.dev/${portal}--`),
    );
  if (definitions.length > 0) {
    log(`teardown: deleting ${definitions.length} workshop definitions`);
    kubectl(["delete", ...definitions, "--ignore-not-found"]);
  }
  log(
    "teardown: deleting Example Academy and the lookup service configuration",
  );
  kubectl(["delete", "namespace", siteNamespace, "--ignore-not-found"]);
  for (const kind of ["secretcopier", "clusterrolebinding", "clusterrole"]) {
    kubectl(["delete", kind, "-l", partOfSelector, "--ignore-not-found"]);
  }
  for (const kind of ["clientconfigs", "tenantconfigs", "clusterconfigs"]) {
    if (namespaceExists("educates-config")) {
      kubectl([
        "-n",
        "educates-config",
        "delete",
        kind,
        "-l",
        partOfSelector,
        "--ignore-not-found",
      ]);
    }
  }
  kubectl(["delete", "namespace", "-l", partOfSelector, "--ignore-not-found"]);
  log("teardown: done");
}
