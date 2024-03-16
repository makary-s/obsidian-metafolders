import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin";
import fs, { copyFileSync, existsSync, mkdirSync } from "fs";
import "dotenv/config";

const renamePlugin = (oldName, newName) => ({
	name: "rename-plugin",
	setup(build) {
		build.onEnd(async () => {
			try {
				fs.renameSync(oldName, newName);
			} catch (error) {
				console.error(
					`Failed to rename "${oldName}" to "${newName}"`,
					error,
				);
			}
		});
	},
});

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = process.argv[2] === "production";

let outputDir = ".";

if (!prod) {
	const outputDirBase = process.env["OUTPUT"];
	if (!existsSync(outputDirBase)) {
		throw new Error(`output directory ${outputDirBase} does not exist`);
	}

	outputDir = `${outputDirBase}/metafolders`;
	mkdirSync(outputDir, { recursive: true });

	copyFileSync("./manifest.json", `${outputDir}/manifest.json`);
}

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ["main.ts"],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtins,
	],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	minify: prod,
	outfile: `${outputDir}/main.js`,
	plugins: [
		sassPlugin({
			filter: /\.scss$/,
			transform: postcssModules({
				generateScopedName: "[name]-[local]-[hash:base64:3]",
				localsConvention: "dashesOnly",
				globalModulePaths: ["src/styles/*.scss"],
			}),
		}),
		renamePlugin(`${outputDir}/main.css`, `${outputDir}/styles.css`),
	],
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
