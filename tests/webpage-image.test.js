/**
 * @fileoverview Tests for WebpageImage class.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import assert from "assert";
import { WebpageImage } from "../src/webpage-image.js";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("WebpageImage", () => {
	it("should create an image with correct properties", () => {
		const img = new WebpageImage("https://example.com/image.jpg", {
			secureUrl: "https://example.com/image-secure.jpg",
			type: "image/jpeg",
			width: "600",
			height: "400",
			alt: "An image",
		});
		assert.strictEqual(img.url, "https://example.com/image.jpg");
		assert.strictEqual(
			img.secureUrl,
			"https://example.com/image-secure.jpg",
		);
		assert.strictEqual(img.type, "image/jpeg");
		assert.strictEqual(img.width, "600");
		assert.strictEqual(img.height, "400");
		assert.strictEqual(img.alt, "An image");
	});

	it("should create an image with only url (no options)", () => {
		const img = new WebpageImage("https://example.com/image.jpg");
		assert.strictEqual(img.url, "https://example.com/image.jpg");
		assert.strictEqual(img.secureUrl, undefined);
		assert.strictEqual(img.type, undefined);
		assert.strictEqual(img.width, undefined);
		assert.strictEqual(img.height, undefined);
		assert.strictEqual(img.alt, undefined);
	});

	it("should create an image with only url and type", () => {
		const img = new WebpageImage("https://example.com/image.jpg", {
			type: "image/jpeg",
		});
		assert.strictEqual(img.url, "https://example.com/image.jpg");
		assert.strictEqual(img.secureUrl, undefined);
		assert.strictEqual(img.type, "image/jpeg");
		assert.strictEqual(img.width, undefined);
		assert.strictEqual(img.height, undefined);
		assert.strictEqual(img.alt, undefined);
	});

	it("should create an image with url and width only", () => {
		const img = new WebpageImage("https://example.com/image.jpg", {
			width: "600",
		});
		assert.strictEqual(img.url, "https://example.com/image.jpg");
		assert.strictEqual(img.secureUrl, undefined);
		assert.strictEqual(img.type, undefined);
		assert.strictEqual(img.width, "600");
		assert.strictEqual(img.height, undefined);
		assert.strictEqual(img.alt, undefined);
	});

	it("should throw TypeError if url is missing", () => {
		assert.throws(() => {
			// @ts-expect-error
			new WebpageImage();
		}, TypeError);
	});
});
