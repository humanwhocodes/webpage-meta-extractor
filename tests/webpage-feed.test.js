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
		const feed = new WebpageFeed(
			"Feed Title",
			"application/rss+xml",
			"https://example.com/feed",
		);
		assert.strictEqual(feed.title, "Feed Title");
		assert.strictEqual(feed.type, "application/rss+xml");
		assert.strictEqual(feed.href, "https://example.com/feed");
	});
});
