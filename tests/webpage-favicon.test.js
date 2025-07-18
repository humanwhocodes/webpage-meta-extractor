/**
 * @fileoverview Tests for WebpageFavicon class.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import assert from "assert";
import { WebpageFavicon } from "../src/webpage-favicon.js";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("WebpageFavicon", () => {
	it("should create a favicon with correct properties", () => {
		const favicon = new WebpageFavicon("/favicon.ico", {
			rel: "icon",
			type: "image/x-icon",
			sizes: "16x16",
		});
		assert.strictEqual(favicon.rel, "icon");
		assert.strictEqual(favicon.href, "/favicon.ico");
		assert.strictEqual(favicon.type, "image/x-icon");
		assert.strictEqual(favicon.sizes, "16x16");
	});

	it("should create a favicon with only href (no options)", () => {
		const favicon = new WebpageFavicon("/favicon.ico");
		assert.strictEqual(favicon.href, "/favicon.ico");
		assert.strictEqual(favicon.rel, undefined);
		assert.strictEqual(favicon.type, undefined);
		assert.strictEqual(favicon.sizes, undefined);
	});

	it("should create a favicon with only href and rel", () => {
		const favicon = new WebpageFavicon("/favicon.ico", { rel: "icon" });
		assert.strictEqual(favicon.href, "/favicon.ico");
		assert.strictEqual(favicon.rel, "icon");
		assert.strictEqual(favicon.type, undefined);
		assert.strictEqual(favicon.sizes, undefined);
	});

	it("should create a favicon with href and type only", () => {
		const favicon = new WebpageFavicon("/favicon.ico", {
			type: "image/x-icon",
		});
		assert.strictEqual(favicon.href, "/favicon.ico");
		assert.strictEqual(favicon.rel, undefined);
		assert.strictEqual(favicon.type, "image/x-icon");
		assert.strictEqual(favicon.sizes, undefined);
	});

	it("should create a favicon with href and sizes only", () => {
		const favicon = new WebpageFavicon("/favicon.ico", { sizes: "16x16" });
		assert.strictEqual(favicon.href, "/favicon.ico");
		assert.strictEqual(favicon.rel, undefined);
		assert.strictEqual(favicon.type, undefined);
		assert.strictEqual(favicon.sizes, "16x16");
	});

	it("should throw TypeError if href is missing", () => {
		assert.throws(() => {
			// @ts-expect-error
			new WebpageFavicon();
		}, TypeError);
	});

	it("should return the correct extname for .ico, .png, .svg", () => {
		assert.strictEqual(new WebpageFavicon("/favicon.ico").extname, ".ico");
		assert.strictEqual(new WebpageFavicon("/favicon.png").extname, ".png");
		assert.strictEqual(new WebpageFavicon("/favicon.svg").extname, ".svg");
	});

	it("should strip query strings and fragments before checking extname", () => {
		assert.strictEqual(
			new WebpageFavicon("/favicon.ico?v=1").extname,
			".ico",
		);
		assert.strictEqual(
			new WebpageFavicon("/favicon.png?foo=bar#section").extname,
			".png",
		);
		assert.strictEqual(
			new WebpageFavicon("/favicon.svg#icon").extname,
			".svg",
		);
	});

	it("should return undefined if no extname is present", () => {
		assert.strictEqual(new WebpageFavicon("/favicon").extname, undefined);
		assert.strictEqual(new WebpageFavicon("/favicon?").extname, undefined);
		assert.strictEqual(new WebpageFavicon("/favicon#").extname, undefined);
	});
});
