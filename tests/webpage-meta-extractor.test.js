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

	describe("Canonical URLs", () => {
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

	describe("WebpageMeta videos property", () => {
		let extractor;

		beforeEach(() => {
			extractor = new WebpageMetaExtractor();
		});

		it("should extract all og:video meta fields as WebpageVideo objects", () => {
			const html = `
			<html><head>
				<meta property="og:video" content="vid1.mp4" />
				<meta property="og:video:width" content="1280" />
				<meta property="og:video:height" content="720" />
				<meta property="og:video:alt" content="First video" />
				<meta property="og:video:secure_url" content="https://vid1-secure.mp4" />
				<meta property="og:video:type" content="video/mp4" />
				<meta property="og:video" content="vid2.webm" />
				<meta property="og:video:width" content="1920" />
				<meta property="og:video:alt" content="Second video" />
				<meta property="og:video" content="vid3.ogv" />
			</head></html>
		`;
			const dom = new JSDOM(html);
			const meta = extractor.extract(dom.window.document);
			assert.strictEqual(Array.isArray(meta.videos), true);
			assert.strictEqual(meta.videos.length, 3);

			const toPlain = vid => ({
				url: vid.url,
				secureUrl: vid.secureUrl,
				type: vid.type,
				width: vid.width,
				height: vid.height,
				alt: vid.alt,
			});

			assert.deepStrictEqual(toPlain(meta.videos[0]), {
				url: "vid1.mp4",
				secureUrl: "https://vid1-secure.mp4",
				type: "video/mp4",
				width: 1280,
				height: 720,
				alt: "First video",
			});
			assert.deepStrictEqual(toPlain(meta.videos[1]), {
				url: "vid2.webm",
				secureUrl: undefined,
				type: undefined,
				width: 1920,
				height: undefined,
				alt: "Second video",
			});
			assert.deepStrictEqual(toPlain(meta.videos[2]), {
				url: "vid3.ogv",
				secureUrl: undefined,
				type: undefined,
				width: undefined,
				height: undefined,
				alt: undefined,
			});
		});

		it("should treat og:video and og:video:url as the same for url", () => {
			const html = `
			<html><head>
				<meta property="og:video:url" content="vid-url.mp4" />
			</head></html>
		`;
			const dom = new JSDOM(html);
			const meta = extractor.extract(dom.window.document);
			assert.strictEqual(meta.videos.length, 1);
			assert.strictEqual(meta.videos[0].url, "vid-url.mp4");
		});

		it("should not include videos without a url", () => {
			const html = `
			<html><head>
				<meta property="og:video:width" content="1280" />
				<meta property="og:video:alt" content="No url video" />
			</head></html>
		`;
			const dom = new JSDOM(html);
			const meta = extractor.extract(dom.window.document);
			assert.strictEqual(meta.videos.length, 0);
		});

		it("should support both og:video and og:video:url with structured properties for each video", () => {
			const html = `
			<html><head>
				<meta property="og:video" content="vid1.mp4" />
				<meta property="og:video:width" content="1280" />
				<meta property="og:video:height" content="720" />
				<meta property="og:video:alt" content="First video" />
				<meta property="og:video:url" content="vid2.webm" />
				<meta property="og:video:width" content="1920" />
				<meta property="og:video:height" content="1080" />
				<meta property="og:video:alt" content="Second video" />
			</head></html>
		`;
			const dom = new JSDOM(html);
			const meta = extractor.extract(dom.window.document);
			assert.strictEqual(meta.videos.length, 2);

			const toPlain = vid => ({
				url: vid.url,
				secureUrl: vid.secureUrl,
				type: vid.type,
				width: vid.width,
				height: vid.height,
				alt: vid.alt,
			});

			assert.deepStrictEqual(toPlain(meta.videos[0]), {
				url: "vid1.mp4",
				secureUrl: undefined,
				type: undefined,
				width: 1280,
				height: 720,
				alt: "First video",
			});
			assert.deepStrictEqual(toPlain(meta.videos[1]), {
				url: "vid2.webm",
				secureUrl: undefined,
				type: undefined,
				width: 1920,
				height: 1080,
				alt: "Second video",
			});
		});
	});

	describe("WebpageMetaExtractor images extraction", () => {
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
				width: 600,
				height: 400,
				alt: "First image",
			});
			assert.strictEqual(typeof meta.images[0].width, "number");
			assert.strictEqual(typeof meta.images[0].height, "number");

			assert.deepStrictEqual(toPlain(meta.images[1]), {
				url: "img2.jpg",
				secureUrl: undefined,
				type: undefined,
				width: 800,
				height: undefined,
				alt: "Second image",
			});
			assert.strictEqual(typeof meta.images[1].width, "number");
			assert.strictEqual(meta.images[1].height, undefined);

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
				width: 600,
				height: 400,
				alt: "First image",
			});
			assert.deepStrictEqual(toPlain(meta.images[1]), {
				url: "img2.jpg",
				secureUrl: undefined,
				type: undefined,
				width: 800,
				height: 500,
				alt: "Second image",
			});
		});
	});

	it("should unescape HTML entities in meta tag content", () => {
		const html = `
	<html><head>
		<meta property="og:title" content="Hello &amp; Welcome &lt;Test&gt;" />
		<meta name="description" content="A &quot;quoted&quot; description &amp; more" />
		<meta property="og:image:alt" content="Alt &amp; &lt;img&gt;" />
	</head></html>
	`;
		const dom = new JSDOM(html);
		const meta = extractor.extract(dom.window.document);
		assert.deepStrictEqual(meta.meta.get("og:title"), [
			"Hello & Welcome <Test>",
		]);
		assert.deepStrictEqual(meta.meta.get("description"), [
			'A "quoted" description & more',
		]);
		// Also check og:image:alt is unescaped in images array
		const imgHtml = `
	<html><head>
		<meta property="og:image" content="img.jpg" />
		<meta property="og:image:alt" content="Alt &amp; &lt;img&gt;" />
	</head></html>
	`;
		const imgDom = new JSDOM(imgHtml);
		const imgMeta = extractor.extract(imgDom.window.document);
		assert.strictEqual(imgMeta.images[0].alt, "Alt & <img>");
	});
});
