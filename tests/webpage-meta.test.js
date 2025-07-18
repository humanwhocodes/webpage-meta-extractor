/**
 * @fileoverview Tests for WebpageMeta class and its properties.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import assert from "assert";
import { JSDOM } from "jsdom";
import { WebpageMetaExtractor } from "../src/webpage-meta-extractor.js";
import { WebpageMeta } from "../src/webpage-meta.js";
import { WebpageFavicon } from "../src/webpage-favicon.js";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("WebpageMeta property getters", () => {
	let extractor;

	beforeEach(() => {
		extractor = new WebpageMetaExtractor();
	});

	it("should resolve title from og:title, twitter:title, then title", () => {
		const html = `
			<html><head>
				<meta property="og:title" content="OG Title" />
				<meta name="twitter:title" content="Twitter Title" />
				<meta name="title" content="Meta Title" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.title, "OG Title");
	});

	it("should resolve title from twitter:title if og:title is missing", () => {
		const html = `
			<html><head>
				<meta name="twitter:title" content="Twitter Title" />
				<meta name="title" content="Meta Title" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.title, "Twitter Title");
	});

	it("should resolve title from meta title if others are missing", () => {
		const html = `
			<html><head>
				<meta name="title" content="Meta Title" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.title, "Meta Title");
	});

	it("should resolve description from og:description, twitter:description, then description", () => {
		const html = `
			<html><head>
				<meta property="og:description" content="OG Desc" />
				<meta name="twitter:description" content="Twitter Desc" />
				<meta name="description" content="Meta Desc" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.description, "OG Desc");
	});

	it("should resolve image from og:image, twitter:image, then image", () => {
		const html = `
			<html><head>
				<meta property="og:image" content="ogimg.jpg" />
				<meta name="twitter:image" content="twimg.jpg" />
				<meta name="image" content="metaimg.jpg" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.image, "ogimg.jpg");
	});

	it("should resolve url from og:url, twitter:url, then url", () => {
		const html = `
			<html><head>
				<meta property="og:url" content="https://og.example" />
				<meta name="twitter:url" content="https://tw.example" />
				<meta name="url" content="https://meta.example" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.url, "https://og.example");
	});

	it("should resolve siteName from og:site_name, then site_name", () => {
		const html = `
			<html><head>
				<meta property="og:site_name" content="OG Site" />
				<meta name="twitter:site" content="@twsite" />
				<meta name="site_name" content="Meta Site" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.siteName, "OG Site");
	});

	it("should resolve siteName from site_name if og:site_name is missing, ignoring twitter:site", () => {
		const html = `
			<html><head>
				<meta name="twitter:site" content="@twsite" />
				<meta name="site_name" content="Meta Site" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.siteName, "Meta Site");
	});

	it("should return undefined for missing properties", () => {
		const html = `<html><head></head></html>`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.title, undefined);
		assert.strictEqual(meta.description, undefined);
		assert.strictEqual(meta.image, undefined);
		assert.strictEqual(meta.url, undefined);
		assert.strictEqual(meta.siteName, undefined);
	});
});

describe("WebpageMeta images property", () => {
	let extractor;

	beforeEach(() => {
		extractor = new WebpageMetaExtractor();
	});

	it("should extract all og:image meta fields as MetaImage objects", () => {
		const html = `
			<html><head>
				<meta property="og:image" content="img1.jpg" />
				<meta property="og:image:width" content="600" />
				<meta property="og:image:height" content="400" />
				<meta property="og:image:alt" content="First image" />
				<meta property="og:image:secure_url" content="https://img1-secure.jpg" />
				<meta property="og:image:type" content="image/jpeg" />
				<meta property="og:image" content="img2.jpg" />
				<meta property="og:image:width" content="800" />
				<meta property="og:image:alt" content="Second image" />
				<meta property="og:image" content="img3.jpg" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(Array.isArray(meta.images), true);
		assert.strictEqual(meta.images.length, 3);

		const toPlain = img => ({
			url: img.url,
			secureUrl: img.secureUrl,
			type: img.type,
			width: img.width,
			height: img.height,
			alt: img.alt,
		});

		assert.deepStrictEqual(toPlain(meta.images[0]), {
			url: "img1.jpg",
			secureUrl: "https://img1-secure.jpg",
			type: "image/jpeg",
			width: "600",
			height: "400",
			alt: "First image",
		});
		assert.deepStrictEqual(toPlain(meta.images[1]), {
			url: "img2.jpg",
			secureUrl: undefined,
			type: undefined,
			width: "800",
			height: undefined,
			alt: "Second image",
		});
		assert.deepStrictEqual(toPlain(meta.images[2]), {
			url: "img3.jpg",
			secureUrl: undefined,
			type: undefined,
			width: undefined,
			height: undefined,
			alt: undefined,
		});
	});

	it("should treat og:image and og:image:url as the same for url", () => {
		const html = `
			<html><head>
				<meta property="og:image:url" content="img-url.jpg" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.images.length, 1);
		assert.strictEqual(meta.images[0].url, "img-url.jpg");
	});

	it("should not include images without a url", () => {
		const html = `
			<html><head>
				<meta property="og:image:width" content="600" />
				<meta property="og:image:alt" content="No url image" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.images.length, 0);
	});

	it("should support both og:image and og:image:url with structured properties for each image", () => {
		const html = `
			<html><head>
				<meta property="og:image" content="img1.jpg" />
				<meta property="og:image:width" content="600" />
				<meta property="og:image:height" content="400" />
				<meta property="og:image:alt" content="First image" />
				<meta property="og:image:url" content="img2.jpg" />
				<meta property="og:image:width" content="800" />
				<meta property="og:image:height" content="500" />
				<meta property="og:image:alt" content="Second image" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.images.length, 2);

		const toPlain = img => ({
			url: img.url,
			secureUrl: img.secureUrl,
			type: img.type,
			width: img.width,
			height: img.height,
			alt: img.alt,
		});

		assert.deepStrictEqual(toPlain(meta.images[0]), {
			url: "img1.jpg",
			secureUrl: undefined,
			type: undefined,
			width: "600",
			height: "400",
			alt: "First image",
		});
		assert.deepStrictEqual(toPlain(meta.images[1]), {
			url: "img2.jpg",
			secureUrl: undefined,
			type: undefined,
			width: "800",
			height: "500",
			alt: "Second image",
		});
	});
});

describe("WebpageMeta jsonld property", () => {
	let extractor;

	beforeEach(() => {
		extractor = new WebpageMetaExtractor();
	});

	it("should extract JSON-LD data from script tags", () => {
		const html = `
			<html><head>
				<script type="application/ld+json">
					{"@context": "https://schema.org", "@type": "Person", "name": "John Doe"}
				</script>
				<script type="application/ld+json">
					{"@context": "https://schema.org", "@type": "Organization", "name": "Acme Corp"}
				</script>
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(Array.isArray(meta.jsonld), true);
		assert.strictEqual(meta.jsonld.length, 2);
		assert.deepStrictEqual(meta.jsonld[0], {
			"@context": "https://schema.org",
			"@type": "Person",
			name: "John Doe",
		});
		assert.deepStrictEqual(meta.jsonld[1], {
			"@context": "https://schema.org",
			"@type": "Organization",
			name: "Acme Corp",
		});
	});

	it("should ignore malformed JSON-LD", () => {
		const html = `
			<html><head>
				<script type="application/ld+json">{bad json}</script>
				<script type="application/ld+json">{"@type": "Test"}</script>
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.jsonld.length, 1);
		assert.deepStrictEqual(meta.jsonld[0], { "@type": "Test" });
	});
});

describe("WebpageMeta favicons and favicon getter", () => {
	let extractor;

	beforeEach(() => {
		extractor = new WebpageMetaExtractor();
	});

	it("should extract all favicon candidates and prefer SVG", () => {
		const html = `
			<html><head>
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
				<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
				<link rel="shortcut icon" href="/favicon.ico" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.favicons.length, 4);
		assert.deepStrictEqual(
			meta.favicons.map(f => f.href),
			[
				"/favicon-16.png",
				"/favicon-32.png",
				"/favicon.svg",
				"/favicon.ico",
			],
		);
		assert.strictEqual(meta.favicon, "/favicon.svg");
	});

	it("should prefer PNG 32x32+ if no SVG", () => {
		const html = `
			<html><head>
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
				<link rel="shortcut icon" href="/favicon.ico" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.favicon, "/favicon-32.png");
	});

	it("should prefer PNG over ICO if no SVG or large PNG", () => {
		const html = `
			<html><head>
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
				<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.favicon, "/favicon-16.png");
	});

	it("should fallback to /favicon.ico if no icons found", () => {
		const html = `<html><head></head></html>`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.favicon, "/favicon.ico");
	});
});

describe("WebpageMeta direct property logic", () => {
	it("should prefer SVG favicon even with query string", () => {
		const meta = new WebpageMeta();
		meta.favicons = [
			new WebpageFavicon("/favicon.svg?ver=2", { type: "image/svg+xml" }),
			new WebpageFavicon("/favicon.png", {
				type: "image/png",
				sizes: "32x32",
			}),
		];
		assert.strictEqual(meta.favicon, "/favicon.svg?ver=2");
	});

	it("should prefer PNG favicon with query string if no SVG", () => {
		const meta = new WebpageMeta();
		meta.favicons = [
			new WebpageFavicon("/favicon.png?v=1", {
				type: "image/png",
				sizes: "32x32",
			}),
			new WebpageFavicon("/favicon.ico", { type: "image/x-icon" }),
		];
		assert.strictEqual(meta.favicon, "/favicon.png?v=1");
	});

	it("should prefer ICO favicon with query string if no SVG or PNG", () => {
		const meta = new WebpageMeta();
		meta.favicons = [
			new WebpageFavicon("/favicon.ico?foo=bar", {
				type: "image/x-icon",
			}),
		];
		assert.strictEqual(meta.favicon, "/favicon.ico?foo=bar");
	});

	it("should fallback to /favicon.ico if no favicons present", () => {
		const meta = new WebpageMeta();
		assert.strictEqual(meta.favicon, "/favicon.ico");
	});
});
