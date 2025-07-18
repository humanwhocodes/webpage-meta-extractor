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
 */

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export class WebpageMeta {
	/**
	 * Open Graph meta tags. Keys are stripped of the 'og:' prefix.
	 * @type {Map<string, string[]>}
	 */
	openGraph = new Map();

	/**
	 * Twitter Card meta tags. Keys are stripped of the 'twitter:' prefix.
	 * @type {Map<string, string[]>}
	 */
	twitterCard = new Map();

	/**
	 * Other meta tags.
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
	 * Creates a new instance of WebpageMeta.
	 */
	constructor() {}

	/**
	 * The favicon URL of the page, determined by icon, shortcut icon, or defaults to /favicon.ico.
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

		// Prefer PNG 32x32 or larger
		const pngs = this.favicons.filter(
			f => f.type === "image/png" || f.extname === ".png",
		);
		const largePng = pngs.find(f => {
			if (!f.sizes) {
				return false;
			}
			// sizes can be "32x32" or "16x16 32x32"
			return f.sizes.split(/\s+/).some(size => {
				const [w, h] = size.split("x").map(Number);
				return w >= 32 && h >= 32;
			});
		});
		if (largePng) {
			return largePng.href;
		}
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
		const og = this.openGraph.get("title");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.twitterCard.get("title");
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
		const og = this.openGraph.get("description");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.twitterCard.get("description");
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
		const og = this.openGraph.get("image");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.twitterCard.get("image");
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
		const og = this.openGraph.get("url");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.twitterCard.get("url");
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
	 * The site name of the page, determined by Open Graph, Twitter Card, or meta tags.
	 * @returns {string|undefined} The site name if found, otherwise undefined.
	 */
	get siteName() {
		const og = this.openGraph.get("site_name");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.twitterCard.get("site");
		if (tw && tw.length) {
			return tw[0];
		}

		const meta = this.meta.get("site_name");
		if (meta && meta.length) {
			return meta[0];
		}

		return undefined;
	}
}
