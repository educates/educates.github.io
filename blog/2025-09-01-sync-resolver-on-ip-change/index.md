---
slug: sync-resolver-macos
title: Automating DNS Resolver Updates for Dynamic IP Addresses on macOS
authors: [jorge]
tags: [educates, resolver, dns]
---

When developing with Educates on a local machine, many developers rely on the local DNS resolver functionality to provide their Educates cluster with a meaningful hostname. A common approach is to use a domain like `educates.test` for consistent local cluster access.

However, laptop users frequently encounter network transitions—moving between office, home, conference, or other network environments. These transitions result in IP address changes that break DNS resolution for the configured hostname. When this occurs, the cluster becomes inaccessible via the expected domain name, requiring manual DNS resolver updates.

This issue can be particularly frustrating when the DNS resolver is running in the background, as the root cause may not be immediately apparent. To address this challenge, I developed an automated solution that monitors IP address changes and updates the DNS resolver configuration accordingly.

<!-- truncate -->

## Solution Overview

The solution implements a lightweight monitoring system that detects IP address changes and automatically triggers DNS resolver updates. While this implementation is specific to macOS, the underlying principles can be adapted for Linux environments.

## Implementation

### Step 1: Create the IP Monitoring Script

Create a monitoring script that detects IP address changes and triggers the Educates resolver update:

```shell
#!/bin/zsh
set -euo pipefail

# Where your CLI is. Adjust if needed. This is the default location if using educatesenv
EDUCATES_CLI="/Users/<USERNAME>/.educatesenv/bin/educates"

# Cache file to detect changes
STATE_DIR="${HOME}/.educates"
mkdir -p "${STATE_DIR}"
LAST_IP_FILE="${STATE_DIR}/last_ip"

# Determine current primary IP (try common interfaces; adjust as needed)
current_ip="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [[ -z "${current_ip}" ]]; then
  current_ip="$(ipconfig getifaddr en1 2>/dev/null || true)"
fi
if [[ -z "${current_ip}" ]]; then
  # Fall back to detected host IP inside your tool if needed
  current_ip="unknown"
fi

last_ip=""
[[ -f "${LAST_IP_FILE}" ]] && last_ip="$(cat "${LAST_IP_FILE}")"

if [[ "${current_ip}" != "${last_ip}" ]]; then
  # Call your existing update command exactly as you run it manually today.
  # Example (adjust to your real subcommand/flags):
  "${EDUCATES_CLI}" local resolver update || true

  # Record new IP to avoid repeated restarts
  echo -n "${current_ip}" > "${LAST_IP_FILE}"
fi
```

**Note:** This script uses zsh, but can be easily adapted for bash with minimal modifications.

### Step 2: Make the Script Executable

```shell
chmod +x ~/bin/educates-resolver-sync
```

### Step 3: Configure LaunchAgent for Automatic Execution

Create a LaunchAgent configuration file at `~/Library/LaunchAgents/dev.educates.resolver.sync.plist` to automatically run the monitoring script at login and at regular intervals (30-60 seconds) to reliably detect network transitions.

The script intelligently only executes `educates local resolver update` when an actual IP address change is detected, preventing unnecessary container restarts.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>dev.educates.resolver.sync</string>

    <key>ProgramArguments</key>
    <array>
      <string>/Users/USERNAME/bin/educates-resolver-sync</string>
    </array>

    <!-- Run at login -->
    <key>RunAtLoad</key>
    <true/>

    <!-- Poll for changes; 30–60s is usually enough to catch roaming quickly -->
    <key>StartInterval</key>
    <integer>30</integer>

    <key>StandardOutPath</key>
    <string>/tmp/educates-resolver.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/educates-resolver.log</string>
  </dict>
</plist>
```

**Important:** Replace `USERNAME` with your actual macOS username in the configuration file.

### Step 4: Load the LaunchAgent

```shell
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/dev.educates.resolver.sync.plist
launchctl kickstart -k gui/$(id -u)/dev.educates.resolver.sync
```

### Step 5: Unloading the Service (Optional)

```shell
# To unload:
launchctl bootout gui/$(id -u)/dev.educates.resolver.sync
```

## Testing and Verification

Once configured, the system will automatically detect IP address changes within 30 seconds (configurable based on your preferences).

To verify the functionality:
1. Disconnect from your current network (WiFi or Ethernet)
2. Connect to a different network
3. Observe the `dnsmasq` container restart automatically
4. Check the current IP address at `~/.educates/last_ip`
5. Review logs at `/tmp/educates-resolver.log` for detailed execution information

## Design Rationale

This solution was designed with several key principles in mind:

- **Robustness**: Network change events on macOS vary significantly across different interfaces and system versions. A polling-based approach with short intervals provides reliable detection while maintaining minimal system overhead.
- **Efficiency**: The system only triggers updates when an actual IP address change is detected, preventing unnecessary container restarts and resource consumption.
- **Non-intrusive**: The solution leverages existing Educates functionality without requiring code modifications, utilizing the standard UpdateResolver flow that regenerates configuration and restarts containers.
- **Maintainability**: The implementation is straightforward and can be easily modified or extended as needed.

## Conclusion

This automated DNS resolver update system eliminates the manual intervention required when transitioning between networks, providing a seamless development experience for Educates users on macOS. The solution is lightweight, reliable, and can be easily customized to meet specific requirements or adapted for other operating systems.