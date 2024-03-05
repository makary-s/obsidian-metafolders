import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.argv[2];
if (!targetVersion) {
	console.error("You must specify a target version as an argument");
	process.exit(1);
}

const packageJsonPath = "package.json"
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
packageJson.version = targetVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "\t"));

const manifestPath = "manifest.json"
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.version = targetVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t"));

const versionsPath = "versions.json";
const versions = JSON.parse(readFileSync(versionsPath, "utf8"));
versions[targetVersion] = manifest.minAppVersion;
writeFileSync(versionsPath, JSON.stringify(versions, null, "\t"));
