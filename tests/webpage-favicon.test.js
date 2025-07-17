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
});
