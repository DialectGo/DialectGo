const { withAndroidManifest } = require("expo/config-plugins");
const { mkdirSync, writeFileSync, existsSync } = require("fs");
const { resolve, join } = require("path");

/**
 * Custom Expo Config Plugin: withNetworkSecurityConfig
 *
 * Creates an Android network_security_config.xml that explicitly trusts
 * system certificates for all domains. This matches Expo Go's permissive
 * behavior and fixes "Network Error" in standalone APK builds on Android 7+.
 */

const NETWORK_SECURITY_CONFIG_XML = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <base-config cleartextTrafficPermitted="true">
    <trust-anchors>
      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </base-config>

  <!-- Explicitly trust these domains with system + user certs -->
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">onrender.com</domain>
    <domain includeSubdomains="true">supabase.co</domain>
    <domain includeSubdomains="true">ngrok-free.dev</domain>
    <domain includeSubdomains="true">googleapis.com</domain>
    <trust-anchors>
      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </domain-config>
</network-security-config>
`;

function withNetworkSecurityConfig(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;

    // 1. Write the network_security_config.xml file
    const resDir = resolve(
      config.modRequest.platformProjectRoot,
      "app",
      "src",
      "main",
      "res",
      "xml"
    );

    if (!existsSync(resDir)) {
      mkdirSync(resDir, { recursive: true });
    }

    writeFileSync(
      join(resDir, "network_security_config.xml"),
      NETWORK_SECURITY_CONFIG_XML,
      "utf-8"
    );

    // 2. Add the reference in AndroidManifest.xml
    const application = manifest.manifest.application?.[0];
    if (application) {
      application.$["android:networkSecurityConfig"] =
        "@xml/network_security_config";
    }

    return config;
  });
}

module.exports = withNetworkSecurityConfig;
