/**
 * @fileoverview Tests for WebpageFeed class.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import assert from "assert";
import { WebpageFeed } from "../src/webpage-feed.js";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("WebpageFeed", () => {
	it("should create a feed with correct properties", () => {
		const feed = new WebpageFeed("https://example.com/feed", {
			title: "Feed Title",
			type: "application/rss+xml",
		});
		assert.strictEqual(feed.title, "Feed Title");
		assert.strictEqual(feed.type, "application/rss+xml");
		assert.strictEqual(feed.href, "https://example.com/feed");
	});

	it("should create a feed with only href (no options)", () => {
		const feed = new WebpageFeed("https://example.com/feed");
		assert.strictEqual(feed.href, "https://example.com/feed");
		assert.strictEqual(feed.title, undefined);
		assert.strictEqual(feed.type, undefined);
	});

	it("should create a feed with only href and title", () => {
		const feed = new WebpageFeed("https://example.com/feed", {
			title: "Feed Title",
		});
		assert.strictEqual(feed.href, "https://example.com/feed");
		assert.strictEqual(feed.title, "Feed Title");
		assert.strictEqual(feed.type, undefined);
	});

	it("should create a feed with only href and type", () => {
		const feed = new WebpageFeed("https://example.com/feed", {
			type: "application/rss+xml",
		});
		assert.strictEqual(feed.href, "https://example.com/feed");
		assert.strictEqual(feed.title, undefined);
		assert.strictEqual(feed.type, "application/rss+xml");
	});

	it("should throw TypeError if href is missing", () => {
		assert.throws(() => {
			// @ts-expect-error
			new WebpageFeed();
		}, TypeError);
	});
});
