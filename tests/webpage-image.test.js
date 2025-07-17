import assert from "assert";
import { WebpageImage } from "../src/webpage-image.js";

describe("WebpageImage", () => {
	it("should create an image with correct properties", () => {
		const img = new WebpageImage({
			url: "https://example.com/image.jpg",
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
});
