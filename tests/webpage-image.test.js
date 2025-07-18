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

describe("WebpageImage extname property", () => {
	it("should return .png for a simple PNG URL", () => {
		const img = new WebpageImage("https://example.com/image.png");
		assert.strictEqual(img.extname, ".png");
	});

	it("should return .jpg for a JPG URL with query string", () => {
		const img = new WebpageImage(
			"https://example.com/photo.jpg?size=large",
		);
		assert.strictEqual(img.extname, ".jpg");
	});

	it("should return .jpeg for a JPEG URL with fragment", () => {
		const img = new WebpageImage("https://example.com/photo.jpeg#section");
		assert.strictEqual(img.extname, ".jpeg");
	});

	it("should return .svg for a SVG URL with query and fragment", () => {
		const img = new WebpageImage(
			"https://example.com/vector.svg?foo=bar#icon",
		);
		assert.strictEqual(img.extname, ".svg");
	});

	it("should return empty string for URL with no extension", () => {
		const img = new WebpageImage("https://example.com/image");
		assert.strictEqual(img.extname, "");
	});

	it("should return .png for URL with multiple dots", () => {
		const img = new WebpageImage(
			"https://example.com/archive.backup.image.png?foo=bar",
		);
		assert.strictEqual(img.extname, ".png");
	});

	it("should return empty string for URL ending with a slash", () => {
		const img = new WebpageImage("https://example.com/images/");
		assert.strictEqual(img.extname, "");
	});
});
