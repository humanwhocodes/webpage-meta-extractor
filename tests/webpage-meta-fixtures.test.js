/**
 * @fileoverview Fixture-based tests for WebpageMetaExtractor using HTML/JSON pairs.
 * Auto-discovers tests/fixtures/*.html, extracts meta, and compares to expected JSON.
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import { WebpageMetaExtractor } from "../src/webpage-meta-extractor.js";

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Convert WebpageMeta instance to a plain serializable JSON object for snapshots.
 * - Maps are converted to plain objects (sorted by key for stability)
 * - Arrays of class instances (images, favicons, videos) reduced to plain objects
 * - Undefined properties are omitted
 *
 * @param {import("../src/webpage-meta.js").WebpageMeta} meta
 * @returns {object}
 */
function serializeMeta(meta) {
	/** @type {(m: Map<string, any>) => Record<string, any>} */
	const mapToObject = m => {
		const obj = {};
		for (const key of Array.from(m.keys()).sort()) {
			const value = m.get(key);
			obj[key] = value;
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

/**
 * Read a file as UTF-8 if it exists.
 * @param {string} p
 * @returns {string|null}
 */
function readIfExists(p) {
	try {
		return fs.readFileSync(p, "utf8");
	} catch {
		return null;
	}
}

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("WebpageMetaExtractor fixtures", () => {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const fixturesDir = path.join(__dirname, "fixtures");
	const extractor = new WebpageMetaExtractor();

	const files = fs
		.readdirSync(fixturesDir)
		.filter(f => f.endsWith(".html"))
		.sort();

	if (files.length === 0) {
		it("should have at least one HTML fixture", () => {
			assert.fail("No .html fixtures found in tests/fixtures");
		});
	}

	for (const htmlFile of files) {
		const base = htmlFile.replace(/\.html$/i, "");
		const htmlPath = path.join(fixturesDir, htmlFile);
		const jsonPath = path.join(fixturesDir, `${base}.json`);

		it(`extracts and matches ${base}`, () => {
			const html = fs.readFileSync(htmlPath, "utf8");
			const dom = new JSDOM(html);
			const meta = extractor.extract(dom.window.document);
			const snapshot = serializeMeta(meta);

			const expectedRaw = readIfExists(jsonPath);
			if (expectedRaw === null) {
				// First run: create snapshot JSON with pretty formatting
				fs.writeFileSync(
					jsonPath,
					JSON.stringify(snapshot, null, 2) + "\n",
				);
				assert.ok(
					true,
					`Wrote missing snapshot ${path.basename(jsonPath)}`,
				);
				return;
			}

			const expected = JSON.parse(expectedRaw);
			assert.deepStrictEqual(snapshot, expected);
		});
	}
});
