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
		const meta = extractor.extract(dom.window.document);
		assert.deepStrictEqual(meta.meta.get("og:title"), ["OG Title"]);
		assert.deepStrictEqual(meta.meta.get("og:image"), [
			"img1.jpg",
			"img2.jpg",
		]);
		assert.deepStrictEqual(meta.meta.get("twitter:card"), ["summary"]);
		assert.deepStrictEqual(meta.meta.get("twitter:site"), ["@site"]);
		assert.deepStrictEqual(meta.meta.get("description"), ["desc"]);
		assert.deepStrictEqual(meta.meta.get("custom:tag"), ["custom"]);
	});

	it("should handle missing content attributes gracefully", () => {
		const html = `<html><head>
            <meta property="og:title" />
            <meta name="twitter:card" />
            <meta name="description" />
        </head></html>`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.meta.size, 0);
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

	it("should not include Open Graph or Twitter Card tags in meta (legacy test, now always included)", () => {
		const html = `<html><head>
            <meta property="og:title" content="OG Title" />
            <meta name="twitter:card" content="summary" />
            <meta name="description" content="desc" />
        </head></html>`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.meta.has("description"), true);
		assert.strictEqual(meta.meta.has("og:title"), true);
		assert.strictEqual(meta.meta.has("twitter:card"), true);
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
		for (const meta of results) {
			assert.deepStrictEqual(meta.meta.get("og:title"), ["OG Title"]);
			assert.deepStrictEqual(meta.meta.get("twitter:card"), ["summary"]);
			assert.deepStrictEqual(meta.meta.get("description"), ["desc"]);
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
	it('should extract canonicalUrl from <link rel="canonical">', () => {
		const html = `
			<html><head>
				<link rel="canonical" href="https://example.com/canonical-url" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(
			meta.canonicalUrl,
			"https://example.com/canonical-url",
		);
	});

	it('should set canonicalUrl to undefined if <link rel="canonical"> is missing', () => {
		const html = `<html><head></head></html>`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(meta.canonicalUrl, undefined);
	});
});

describe("WebpageMetaExtractor meta property population", () => {
	let extractor;

	beforeEach(() => {
		extractor = new WebpageMetaExtractor();
	});

	it("should include all meta tags (og:, twitter:, and others) from both property and name attributes in meta property", () => {
		const html = `
			<html><head>
				<meta property="og:title" content="OG Title Property" />
				<meta name="og:title" content="OG Title Name" />
				<meta property="twitter:title" content="Twitter Title Property" />
				<meta name="twitter:title" content="Twitter Title Name" />
				<meta property="description" content="Description Property" />
				<meta name="description" content="Description Name" />
				<meta name="custom" content="Custom Name" />
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);

		// og:title
		assert.deepStrictEqual(meta.meta.get("og:title"), [
			"OG Title Property",
			"OG Title Name",
		]);
		// twitter:title
		assert.deepStrictEqual(meta.meta.get("twitter:title"), [
			"Twitter Title Property",
			"Twitter Title Name",
		]);
		// description
		assert.deepStrictEqual(meta.meta.get("description"), [
			"Description Property",
			"Description Name",
		]);
		// custom
		assert.deepStrictEqual(meta.meta.get("custom"), ["Custom Name"]);
	});
});

describe("WebpageMetaExtractor microdata extraction", () => {
	let extractor;
	beforeEach(() => {
		extractor = new WebpageMetaExtractor();
	});

	it("should extract a simple microdata item", () => {
		const html = `
			<html><body>
				<div itemscope itemtype="http://schema.org/Person">
					<span itemprop="name">Alice</span>
					<span itemprop="jobTitle">Engineer</span>
				</div>
			</body></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.deepStrictEqual(meta.microdata, [
			{
				type: ["http://schema.org/Person"],
				properties: {
					name: ["Alice"],
					jobTitle: ["Engineer"],
				},
			},
		]);
	});

	it("should extract nested microdata items", () => {
		const html = `
			<html><body>
				<div itemscope itemtype="http://schema.org/Person">
					<span itemprop="name">Bob</span>
					<div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
						<span itemprop="streetAddress">123 Main St</span>
						<span itemprop="addressLocality">Metropolis</span>
					</div>
				</div>
			</body></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.deepStrictEqual(meta.microdata, [
			{
				type: ["http://schema.org/Person"],
				properties: {
					name: ["Bob"],
					address: [
						{
							type: ["http://schema.org/PostalAddress"],
							properties: {
								streetAddress: ["123 Main St"],
								addressLocality: ["Metropolis"],
							},
						},
					],
				},
			},
		]);
	});

	it("should extract multiple top-level microdata items", () => {
		const html = `
			<html><body>
				<div itemscope itemtype="http://schema.org/Person">
					<span itemprop="name">Carol</span>
				</div>
				<div itemscope itemtype="http://schema.org/Person">
					<span itemprop="name">Dave</span>
				</div>
			</body></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.deepStrictEqual(meta.microdata, [
			{
				type: ["http://schema.org/Person"],
				properties: {
					name: ["Carol"],
				},
			},
			{
				type: ["http://schema.org/Person"],
				properties: {
					name: ["Dave"],
				},
			},
		]);
	});

	it("should extract itemid and various value types", () => {
		const html = `
			<html><body>
				<div itemscope itemtype="http://schema.org/Thing" itemid="#thing1">
					<meta itemprop="metaProp" content="metaValue">
					<a itemprop="url" href="https://example.com">Link</a>
					<time itemprop="date" datetime="2020-01-01">Jan 1, 2020</time>
					<span itemprop="text">Some text</span>
				</div>
			</body></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.deepStrictEqual(meta.microdata, [
			{
				type: ["http://schema.org/Thing"],
				id: "#thing1",
				properties: {
					metaProp: ["metaValue"],
					url: ["https://example.com"],
					date: ["2020-01-01"],
					text: ["Some text"],
				},
			},
		]);
	});

	it("should handle cycles gracefully (itemref self-reference)", () => {
		const html = `
				<html><body>
					<div itemscope itemtype="http://schema.org/Thing" id="item1" itemref="item1">
						<span itemprop="name">Cycle</span>
					</div>
				</body></html>
			`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.deepStrictEqual(meta.microdata, [
			{
				type: ["http://schema.org/Thing"],
				properties: {
					name: ["Cycle"],
				},
			},
		]);
	});

	it("should support multiple itemprop names on one element", () => {
		const html = `
			<html><body>
				<div itemscope itemtype="http://schema.org/Thing">
					<span itemprop="foo bar">baz</span>
				</div>
			</body></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.deepStrictEqual(meta.microdata, [
			{
				type: ["http://schema.org/Thing"],
				properties: {
					foo: ["baz"],
					bar: ["baz"],
				},
			},
		]);
	});
});

describe("WebpageMetaExtractor JSON-LD", () => {
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

	it("should extract JSON-LD when script contains an array of objects", () => {
		const html = `
			<html><head>
				<script type="application/ld+json">
					[
						{"@context": "https://schema.org", "@type": "Person", "name": "Alice"},
						{"@context": "https://schema.org", "@type": "Person", "name": "Bob"}
					]
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
			name: "Alice",
		});
		assert.deepStrictEqual(meta.jsonld[1], {
			"@context": "https://schema.org",
			"@type": "Person",
			name: "Bob",
		});
	});

	it("should extract JSON-LD with both object and array script tags", () => {
		const html = `
			<html><head>
				<script type="application/ld+json">
					{"@context": "https://schema.org", "@type": "Person", "name": "Carol"}
				</script>
				<script type="application/ld+json">
					[
						{"@context": "https://schema.org", "@type": "Person", "name": "Dave"},
						{"@context": "https://schema.org", "@type": "Person", "name": "Eve"}
					]
				</script>
			</head></html>
		`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.strictEqual(Array.isArray(meta.jsonld), true);
		assert.strictEqual(meta.jsonld.length, 3);
		assert.deepStrictEqual(meta.jsonld[0], {
			"@context": "https://schema.org",
			"@type": "Person",
			name: "Carol",
		});
		assert.deepStrictEqual(meta.jsonld[1], {
			"@context": "https://schema.org",
			"@type": "Person",
			name: "Dave",
		});
		assert.deepStrictEqual(meta.jsonld[2], {
			"@context": "https://schema.org",
			"@type": "Person",
			name: "Eve",
		});
	});
});
