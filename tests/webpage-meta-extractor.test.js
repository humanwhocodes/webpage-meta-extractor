import assert from 'assert';
import { JSDOM } from 'jsdom';
import { WebpageMetaExtractor } from '../src/webpage-meta-extractor.js';

describe('WebpageMetaExtractor', () => {
    let extractor;
    beforeEach(() => {
        extractor = new WebpageMetaExtractor();
    });

    it('should extract Open Graph, Twitter Card, and other meta tags', () => {
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
        const { openGraph, twitterCard, meta } = extractor.extract(dom.window.document);
        assert.deepStrictEqual(openGraph.get('og:title'), ['OG Title']);
        assert.deepStrictEqual(openGraph.get('og:image'), ['img1.jpg', 'img2.jpg']);
        assert.deepStrictEqual(twitterCard.get('twitter:card'), ['summary']);
        assert.deepStrictEqual(twitterCard.get('twitter:site'), ['@site']);
        assert.deepStrictEqual(meta.get('description'), ['desc']);
        assert.deepStrictEqual(meta.get('custom:tag'), ['custom']);
    });

    it('should handle missing content attributes gracefully', () => {
        const html = `<html><head>
            <meta property="og:title" />
            <meta name="twitter:card" />
            <meta name="description" />
        </head></html>`;
        const dom = new JSDOM(html);
        const { openGraph, twitterCard, meta } = extractor.extract(dom.window.document);
        assert.strictEqual(openGraph.size, 0);
        assert.strictEqual(twitterCard.size, 0);
        assert.strictEqual(meta.size, 0);
    });

    it('should throw TypeError for invalid input', () => {
        assert.throws(() => extractor.extract(null), {
            name: 'TypeError',
            message: 'Expected a DOM Document with querySelectorAll.'
        });
        assert.throws(() => extractor.extract({}), {
            name: 'TypeError',
            message: 'Expected a DOM Document with querySelectorAll.'
        });
    });

    it('should not include Open Graph or Twitter Card tags in meta', () => {
        const html = `<html><head>
            <meta property="og:title" content="OG Title" />
            <meta name="twitter:card" content="summary" />
            <meta name="description" content="desc" />
        </head></html>`;
        const dom = new JSDOM(html);
        const { meta } = extractor.extract(dom.window.document);
        assert(meta.has('description'));
        assert(!meta.has('og:title'));
        assert(!meta.has('twitter:card'));
    });

    it('should support concurrent extraction', async () => {
        const html = `<html><head>
            <meta property="og:title" content="OG Title" />
            <meta name="twitter:card" content="summary" />
            <meta name="description" content="desc" />
        </head></html>`;
        const dom = new JSDOM(html);
        const results = await Promise.all([
            extractor.extract(dom.window.document),
            extractor.extract(dom.window.document)
        ]);
        for (const { openGraph, twitterCard, meta } of results) {
            assert.deepStrictEqual(openGraph.get('og:title'), ['OG Title']);
            assert.deepStrictEqual(twitterCard.get('twitter:card'), ['summary']);
            assert.deepStrictEqual(meta.get('description'), ['desc']);
        }
    });
});

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

	it("should resolve siteName from og:site_name, twitter:site, then site_name", () => {
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
