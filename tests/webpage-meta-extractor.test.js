import assert from "assert";
import { JSDOM } from "jsdom";
import { WebpageMetaExtractor } from "../src/webpage-meta-extractor.js";

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
});
