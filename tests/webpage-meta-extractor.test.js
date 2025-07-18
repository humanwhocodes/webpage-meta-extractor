/**
 * @fileoverview Tests for WebpageMetaExtractor class.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import assert from "assert";
import { JSDOM } from "jsdom";
import { WebpageMetaExtractor } from "../src/webpage-meta-extractor.js";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("WebpageMetaExtractor", () => {
	let extractor;
	beforeEach(() => {
		extractor = new WebpageMetaExtractor();
	});

	it("should extract Open Graph, Twitter Card, and other meta tags", () => {
		const html = `
            <html><head>
                <meta property="og:title" content="OG Title" />
                <meta property="og:image" content="img1.jpg" />
                <meta property="og:image" content="img2.jpg" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@site" />
                <meta name="description" content="desc" />
                <meta property="custom:tag" content="custom" />
            </head></html>
        `;
		const dom = new JSDOM(html);
		const { openGraph, twitterCard, meta } = extractor.extract(
			dom.window.document,
		);
		assert.deepStrictEqual(openGraph.get("title"), ["OG Title"]);
		assert.deepStrictEqual(openGraph.get("image"), [
			"img1.jpg",
			"img2.jpg",
		]);
		assert.deepStrictEqual(twitterCard.get("card"), ["summary"]);
		assert.deepStrictEqual(twitterCard.get("site"), ["@site"]);
		assert.deepStrictEqual(meta.get("description"), ["desc"]);
		assert.deepStrictEqual(meta.get("custom:tag"), ["custom"]);
	});

	it("should handle missing content attributes gracefully", () => {
		const html = `<html><head>
            <meta property="og:title" />
            <meta name="twitter:card" />
            <meta name="description" />
        </head></html>`;
		const dom = new JSDOM(html);
		const { openGraph, twitterCard, meta } = extractor.extract(
			dom.window.document,
		);
		assert.strictEqual(openGraph.size, 0);
		assert.strictEqual(twitterCard.size, 0);
		assert.strictEqual(meta.size, 0);
	});

	it("should throw TypeError for invalid input", () => {
		assert.throws(() => extractor.extract(null), {
			name: "TypeError",
			message: "Expected a DOM Document with querySelectorAll.",
		});
		assert.throws(() => extractor.extract({}), {
			name: "TypeError",
			message: "Expected a DOM Document with querySelectorAll.",
		});
	});

	it("should not include Open Graph or Twitter Card tags in meta", () => {
		const html = `<html><head>
            <meta property="og:title" content="OG Title" />
            <meta name="twitter:card" content="summary" />
            <meta name="description" content="desc" />
        </head></html>`;
		const dom = new JSDOM(html);
		const { meta } = extractor.extract(dom.window.document);
		assert.strictEqual(meta.has("description"), true);
		assert.strictEqual(meta.has("title"), false);
		assert.strictEqual(meta.has("card"), false);
	});

	it("should support concurrent extraction", async () => {
		const html = `<html><head>
            <meta property="og:title" content="OG Title" />
            <meta name="twitter:card" content="summary" />
            <meta name="description" content="desc" />
        </head></html>`;
		const dom = new JSDOM(html);
		const results = await Promise.all([
			extractor.extract(dom.window.document),
			extractor.extract(dom.window.document),
		]);
		for (const { openGraph, twitterCard, meta } of results) {
			assert.deepStrictEqual(openGraph.get("title"), ["OG Title"]);
			assert.deepStrictEqual(twitterCard.get("card"), ["summary"]);
			assert.deepStrictEqual(meta.get("description"), ["desc"]);
		}
	});
	describe("feeds array content-type filtering", () => {
		it("should include only RSS, Atom, and JSONFeed feeds", () => {
			const html = `
			<html><head>
				<link rel="alternate" type="application/rss+xml" href="/rss.xml" title="RSS Feed" />
				<link rel="alternate" type="application/atom+xml" href="/atom.xml" title="Atom Feed" />
				<link rel="alternate" type="application/feed+json" href="/feed.json" title="JSONFeed" />
				<link rel="alternate" type="application/json" href="/feed2.json" title="JSONFeed2" />
				<link rel="alternate" type="text/xml" href="/not-feed.xml" title="Not a Feed" />
				<link rel="alternate" type="text/html" href="/not-feed.html" title="Not a Feed" />
			</head></html>
			`;
			const dom = new JSDOM(html);
			const { feeds } = extractor.extract(dom.window.document);
			assert.strictEqual(feeds.length, 4);
			assert.deepStrictEqual(
				feeds.map(f => f.type),
				[
					"application/rss+xml",
					"application/atom+xml",
					"application/feed+json",
					"application/json",
				],
			);
			assert.deepStrictEqual(
				feeds.map(f => f.href),
				["/rss.xml", "/atom.xml", "/feed.json", "/feed2.json"],
			);
		});

		it("should ignore feeds with missing or unsupported type", () => {
			const html = `
			<html><head>
				<link rel="alternate" href="/no-type.xml" title="No Type" />
				<link rel="alternate" type="text/xml" href="/not-feed.xml" title="Not a Feed" />
			</head></html>
			`;
			const dom = new JSDOM(html);
			const { feeds } = extractor.extract(dom.window.document);
			assert.strictEqual(feeds.length, 0);
		});
	});
});
