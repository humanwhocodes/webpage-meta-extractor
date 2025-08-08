/**
 * Update JSON snapshots for HTML fixtures in tests/fixtures.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import { WebpageMetaExtractor } from "../../src/webpage-meta-extractor.js";

function serializeMeta(meta) {
	const mapToObject = m => {
		const obj = {};
		for (const key of Array.from(m.keys()).sort()) {
			obj[key] = m.get(key);
		}
		return obj;
	};
	const simplify = arr =>
		arr.map(item => {
			const out = {};
			for (const key of Object.keys(item)) {
				const v = item[key];
				if (typeof v !== "undefined") {
					out[key] = v;
				}
			}
			return out;
		});
	return {
		meta: mapToObject(meta.meta),
		other: mapToObject(meta.other),
		feeds: simplify(meta.feeds),
		images: simplify(meta.images),
		favicons: simplify(meta.favicons),
		videos: simplify(meta.videos),
		jsonld: meta.jsonld,
		microdata: meta.microdata,
		canonicalUrl: meta.canonicalUrl,
		title: meta.title,
		description: meta.description,
		image: meta.image,
		url: meta.url,
		siteName: meta.siteName,
		openGraphObject: meta.openGraphObject,
		favicon: meta.favicon,
	};
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, "..", "fixtures");

const extractor = new WebpageMetaExtractor();

const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith(".html"));
for (const htmlFile of files) {
	console.log(`Processing ${htmlFile}...`);
	const base = htmlFile.replace(/\.html$/i, "");
	const htmlPath = path.join(fixturesDir, htmlFile);
	const jsonPath = path.join(fixturesDir, `${base}.json`);
	console.log(htmlPath);
	const html = fs.readFileSync(htmlPath, "utf8");
	const dom = new JSDOM(html);
	const meta = extractor.extract(dom.window.document);
	const snapshot = serializeMeta(meta);
	fs.writeFileSync(jsonPath, JSON.stringify(snapshot, null, 2) + "\n");
	console.log(`Updated ${path.basename(jsonPath)}`);
}
