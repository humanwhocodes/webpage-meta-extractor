/**
 * @fileoverview WebpageMeta represents extracted Open Graph, Twitter Card, and other meta tag information.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Types
//-----------------------------------------------------------------------------

/**
 * @import { WebpageFeed } from "./webpage-feed.js";
 * @import { WebpageImage } from "./webpage-image.js";
 * @import { WebpageFavicon } from "./webpage-favicon.js";
 * @import { WebpageVideo } from "./webpage-video.js";
 */

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export class WebpageMeta {
	/**
	 * Other meta tags, including Open Graph (og:*) and Twitter Card (twitter:*) tags.
	 * All meta tag data is stored here, with the key as the meta name/property and the value as an array of strings.
	 * @type {Map<string, string[]>}
	 */
	meta = new Map();

	/**
	 * Other extracted data (icon, shortcut icon, <title>, firstHeading).
	 * @type {Map<string, string>}
	 */
	other = new Map();

	/**
	 * Feeds discovered in the page.
	 * @type {WebpageFeed[]}
	 */
	feeds = [];

	/**
	 * All Open Graph images found on the page.
	 * @type {WebpageImage[]}
	 */
	images = [];

	/**
	 * All JSON-LD data found in the page.
	 * @type {any[]}
	 */
	jsonld = [];

	/**
	 * All favicon candidates found on the page.
	 * @type {WebpageFavicon[]}
	 */
	favicons = [];

	/**
	 * All Open Graph videos found on the page.
	 * @type {import("./webpage-video.js").WebpageVideo[]}
	 */
	videos = [];

	/**
	 * The canonical URL for the page, if found.
	 * @type {string|undefined}
	 */
	canonicalUrl;

	/**
	 * The favicon URL of the page, determined by icon, shortcut icon, or defaults to /favicon.ico.
	 * Favors SVG, then largest PNG, then any PNG, then everything else as-is.
	 * @returns {string} The favicon URL.
	 */
	get favicon() {
		// Prefer SVG
		const svg = this.favicons.find(
			f => f.type === "image/svg+xml" || f.extname === ".svg",
		);
		if (svg) {
			return svg.href;
		}

		// Prefer PNG with largest size
		const pngs = this.favicons.filter(
			f => f.type === "image/png" || f.extname === ".png",
		);
		let largestPng = undefined;
		let largestArea = 0;

		for (const png of pngs) {
			if (png.sizes) {
				// sizes can be "32x32" or "16x16 32x32"
				for (const size of png.sizes.split(/\s+/)) {
					const [w, h] = size.split("x").map(Number);
					if (!isNaN(w) && !isNaN(h)) {
						const area = w * h;
						if (area > largestArea) {
							largestArea = area;
							largestPng = png;
						}
					}
				}
			}
		}

		if (largestPng) {
			return largestPng.href;
		}

		// If no PNG with size, pick any PNG
		if (pngs.length) {
			return pngs[0].href;
		}

		// Prefer ICO
		const ico = this.favicons.find(
			f =>
				(f.type === "image/x-icon" ||
					((f.rel === "icon" || f.rel === "shortcut icon") &&
						f.extname === ".ico")) &&
				f.href,
		);
		if (ico) {
			return ico.href;
		}

		// Fallback to previous logic
		const icon = this.other.get("icon");
		if (icon) {
			return icon;
		}

		const shortcut = this.other.get("shortcut icon");
		if (shortcut) {
			return shortcut;
		}

		return "/favicon.ico";
	}

	/**
	 * The title of the page, determined by Open Graph, Twitter Card, meta tags, <title>, or first <h1>.
	 * @returns {string|undefined} The title if found, otherwise undefined.
	 */
	get title() {
		const og = this.meta.get("og:title");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.meta.get("twitter:title");
		if (tw && tw.length) {
			return tw[0];
		}

		const meta = this.meta.get("title");
		if (meta && meta.length) {
			return meta[0];
		}

		const otherTitle = this.other.get("title");
		if (otherTitle) {
			return otherTitle;
		}

		const firstHeading = this.other.get("firstHeading");
		if (firstHeading) {
			return firstHeading;
		}

		return undefined;
	}

	/**
	 * The description of the page, determined by Open Graph, Twitter Card, or meta tags.
	 * @returns {string|undefined} The description if found, otherwise undefined.
	 */
	get description() {
		const og = this.meta.get("og:description");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.meta.get("twitter:description");
		if (tw && tw.length) {
			return tw[0];
		}

		const meta = this.meta.get("description");
		if (meta && meta.length) {
			return meta[0];
		}

		return undefined;
	}

	/**
	 * The image URL of the page, determined by Open Graph, Twitter Card, or meta tags.
	 * @returns {string|undefined} The image URL if found, otherwise undefined.
	 */
	get image() {
		const og = this.meta.get("og:image");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.meta.get("twitter:image");
		if (tw && tw.length) {
			return tw[0];
		}

		const meta = this.meta.get("image");
		if (meta && meta.length) {
			return meta[0];
		}

		return undefined;
	}

	/**
	 * The canonical URL of the page, determined by Open Graph, Twitter Card, or meta tags.
	 * @returns {string|undefined} The URL if found, otherwise undefined.
	 */
	get url() {
		const og = this.meta.get("og:url");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.meta.get("twitter:url");
		if (tw && tw.length) {
			return tw[0];
		}

		const meta = this.meta.get("url");
		if (meta && meta.length) {
			return meta[0];
		}

		return undefined;
	}

	/**
	 * The site name of the page, determined by Open Graph or meta tags.
	 * @returns {string|undefined} The site name if found, otherwise undefined.
	 */
	get siteName() {
		const og = this.meta.get("og:site_name");
		if (og && og.length) {
			return og[0];
		}

		const meta = this.meta.get("site_name");
		if (meta && meta.length) {
			return meta[0];
		}

		return undefined;
	}

	/**
	 * The Open Graph object for the page, based on og:type and related properties.
	 * Returns an object with keys for each property prefixed by type (e.g., article:*) for the current type.
	 * Keys are in their original format (not camelCase) and values are from the meta map. If a property occurs more than once, the value is an array.
	 * If og:type contains a dot (e.g., video.other), only the part before the dot is used as the prefix (e.g., video:).
	 * @returns {{ [key: string]: string | string[] }} The Open Graph object for the current type, or an empty object if not applicable.
	 */
	get openGraphObject() {
		/** @type {{ [key: string]: string | string[] }} */
		const result = {};
		const typeArr = this.meta.get("og:type");
		if (!typeArr || !typeArr.length) {
			return result;
		}

		let type = typeArr[0];

		// Only use the part before the dot, if present
		const dotIndex = type.indexOf(".");
		if (dotIndex !== -1) {
			type = type.slice(0, dotIndex);
		}

		const prefix = `${type}:`;

		for (const [key, values] of this.meta.entries()) {
			if (key.startsWith(prefix)) {
				const prop = key.slice(prefix.length);
				if (prop) {
					result[prop] = values.length === 1 ? values[0] : values;
				}
			}
		}
		return result;
	}

	/**
	 * All microdata items found in the page, as per the WHATWG microdata JSON extraction algorithm.
	 * Each entry is an object representing a top-level microdata item and its properties.
	 * @type {object[]}
	 */
	microdata = [];
}
