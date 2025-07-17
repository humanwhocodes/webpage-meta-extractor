import assert from "assert";
import { WebpageFavicon } from "../src/webpage-favicon.js";

describe("WebpageFavicon", () => {
	it("should create a favicon with correct properties", () => {
		const favicon = new WebpageFavicon(
			"icon",
			"/favicon.ico",
			"image/x-icon",
			"16x16",
		);
		assert.strictEqual(favicon.rel, "icon");
		assert.strictEqual(favicon.href, "/favicon.ico");
		assert.strictEqual(favicon.type, "image/x-icon");
		assert.strictEqual(favicon.sizes, "16x16");
	});
});
