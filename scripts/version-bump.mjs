import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.argv[2];
if (!targetVersion) {
	console.error("You must specify a target version as an argument");
	process.exit(1);
}

const packageLockJsonPath = "package-lock.json"
const packageLockJson = JSON.parse(readFileSync(packageLockJsonPath, "utf8"));
const apiVersion = packageLockJson["packages"]["node_modules/obsidian"]?.["version"];
if (typeof apiVersion !== 'string' || !apiVersion.match(/^\d+\.\d+\.\d+$/)) {
	console.error(`Could not determine current api version, found: "${apiVersion}"`);
	process.exit(1);
}

const packageJsonPath = "package.json"
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
packageJson.version = targetVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "\t"));



const manifestPath = "manifest.json"
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.version = targetVersion;
manifest.minAppVersion = apiVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t"));



const versionsPath = "versions.json";
const versions = JSON.parse(readFileSync(versionsPath, "utf8"));
versions[targetVersion] = apiVersion;
writeFileSync(versionsPath, JSON.stringify(versions, null, "\t"));
