// The site check: inspects a finished build the way GitHub Pages serves it
// and reports what is wrong. Usage: node scripts/site-check/cli.ts [dist]
// Exits 1 when any rule reports an error; warnings are listed only.

import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { siteRules } from "./rules/index.ts";
import { checkSite, type Finding } from "./site-check.ts";

const buildDir = resolve(process.argv[2] ?? "dist");

if (!existsSync(buildDir) || !statSync(buildDir).isDirectory()) {
  console.error(`site check: no build output at ${buildDir}`);
  process.exit(1);
}

const findings = checkSite(buildDir, siteRules());
console.log(report(buildDir, findings));
process.exitCode = findings.some((finding) => finding.severity === "error")
  ? 1
  : 0;

function report(dir: string, all: Finding[]): string {
  const errors = all.filter((finding) => finding.severity === "error");
  const warnings = all.filter((finding) => finding.severity === "warning");
  const lines = [
    `site check of ${dir}: ${plural(errors.length, "error")}, ${plural(warnings.length, "warning")}`,
  ];
  for (const [severity, group] of [
    ["error", errors],
    ["warning", warnings],
  ] as const) {
    const rules = [...new Set(group.map((finding) => finding.rule))];
    for (const rule of rules) {
      const ofRule = group.filter((finding) => finding.rule === rule);
      lines.push("", `${rule}: ${plural(ofRule.length, severity)}`);
      for (const finding of ofRule) lines.push(`  ${finding.message}`);
    }
  }
  return lines.join("\n");
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
