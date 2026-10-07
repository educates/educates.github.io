// The page view counter. Loads GoatCounter's count.js, which counts the
// page, unless the visitor opted out on /privacy or the browser blocks
// site storage; an opted-out browser requests nothing from GoatCounter.
// The endpoint and the script's URL are `site.goatCounter`.

import { countingState } from "../lib/analytics.ts";
import { site } from "../site.ts";

export function loadCounter(): void {
  if (countingState(() => localStorage) !== "on") return;
  const script = document.createElement("script");
  script.async = true;
  script.dataset.goatcounter = site.goatCounter.endpoint;
  script.src = site.goatCounter.script;
  document.head.append(script);
}
