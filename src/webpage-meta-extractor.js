/**
 * @fileoverview WebpageMetaExtractor extracts Open Graph, Twitter Card, and other meta tag information from a DOM Document.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Imports
//-----------------------------------------------------------------------------

import { WebpageMeta } from "./webpage-meta.js";
import { WebpageFeed } from "./webpage-feed.js";
import { WebpageImage } from "./webpage-image.js";
import { WebpageFavicon } from "./webpage-favicon.js";
import { WebpageVideo } from "./webpage-video.js";

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

/**
 * Allowed content-types for feeds (RSS, Atom, JSONFeed).
 * @type {Set<string>}
 */
const ALLOWED_FEED_TYPES = new Set([
	"application/rss+xml",
	"application/atom+xml",
	"application/feed+json",
	"application/json",
]);

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

/**
 * Decodes HTML entities in a string using text-based replacement.
 * Handles common named and numeric entities.
 * @param {string} value
 * @returns {string}
 */
function decodeHtmlEntities(value) {
	if (!value || typeof value !== "string") {
		return value;
	}
	return value
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&#(x?)([0-9a-fA-F]+);/g, (m, hex, code) => {
			const n = hex ? parseInt(code, 16) : parseInt(code, 10);
			return String.fromCodePoint(n);
		});
}

/**
 * Recursively extracts a microdata item as a JSON object.
 * @param {any} itemElem
 * @param {Set<any>} memory
 * @returns {object|undefined}
 */
function extractMicrodataItem(itemElem, memory = new Set()) {
	if (memory.has(itemElem)) {
		return undefined;
	}
	/** @type {{ [key: string]: any }} */
	const result = {};
	const nextMemory = new Set(memory);
	nextMemory.add(itemElem);

	// type
	const itemtype = itemElem.getAttribute("itemtype");
	if (itemtype) {
		const types = itemtype.trim().split(/\s+/).filter(Boolean);
		if (types.length) {
			result.type = types[0]; // always a string, not an array
		}
	}

	// id
	const itemid = itemElem.getAttribute("itemid");
	if (itemid) {
		result.id = itemid.trim();
	}

	// properties
	/** @type {{ [key: string]: any[] }} */
	const properties = {};
	const propElems = [];
	const pending = [];

	// Add children
	for (const child of itemElem.children) {
		pending.push(child);
	}
	// Add itemref
	const itemref = itemElem.getAttribute("itemref");
	if (itemref) {
		for (const refId of itemref.trim().split(/\s+/)) {
			const refElem = itemElem.ownerDocument.getElementById(refId);
			if (refElem) {
				pending.push(refElem);
			}
		}
	}
	// Traverse
	const visited = new Set();
	while (pending.length) {
		const current = pending.shift();
		if (!current || visited.has(current)) {
			continue;
		}
		visited.add(current);
		if (!current.hasAttribute("itemscope")) {
			for (const child of current.children) {
				pending.push(child);
			}
		}
		if (current.hasAttribute("itemprop")) {
			propElems.push(current);
		}
	}
	// Sort propElems in tree order (a precedes b if a comes before b in the document)
	propElems.sort((a, b) => {
		if (a === b) {
			return 0;
		}
		const pos = a.compareDocumentPosition(b);
		if (pos & 2) {
			return 1;
		} else if (pos & 4) {
			return -1;
		}
		return 0;
	});
	// Extract property values
	for (const elem of propElems) {
		const names = elem
			.getAttribute("itemprop")
			.trim()
			.split(/\s+/)
			.filter(Boolean);
		let value;
		if (elem.hasAttribute("itemscope")) {
			value = extractMicrodataItem(elem, memory);
			if (typeof value === "undefined") {
				continue; // skip cyclic reference
			}
		} else if (elem.tagName === "META") {
			value = decodeHtmlEntities(elem.getAttribute("content") || "");
		} else if (["A", "AREA", "LINK"].includes(elem.tagName)) {
			value = elem.getAttribute("href") || "";
		} else if (
			[
				"AUDIO",
				"EMBED",
				"IFRAME",
				"IMG",
				"SOURCE",
				"TRACK",
				"VIDEO",
			].includes(elem.tagName)
		) {
			value = elem.getAttribute("src") || "";
		} else if (elem.tagName === "OBJECT") {
			value = elem.getAttribute("data") || "";
		} else if (elem.tagName === "DATA") {
			value = elem.getAttribute("value") || "";
		} else if (elem.tagName === "METER") {
			value = elem.getAttribute("value") || "";
		} else if (elem.tagName === "TIME") {
			value = elem.getAttribute("datetime") || elem.textContent || "";
		} else {
			value = elem.textContent || "";
		}
		for (const name of names) {
			if (!properties[name]) {
				properties[name] = [];
			}
			properties[name].push(value);
		}
	}

	// Flatten properties to be direct keys and convert single-item arrays to values
	for (const [key, values] of Object.entries(properties)) {
		if (values.length === 1) {
			result[key] = values[0];
		} else {
			result[key] = values;
		}
	}

	return result;
}

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * WebpageMetaExtractor extracts Open Graph, Twitter Card, and other meta tag information from a DOM Document.
 */
export class WebpageMetaExtractor {
	/**
	 * Extracts Open Graph, Twitter Card, and other meta tag information from a DOM Document.
	 *
	 * @param {any} document - A DOM Document (e.g., from jsdom or DenoDom).
	 * @returns {WebpageMeta} An instance of WebpageMeta containing extracted data.
	 * @throws {TypeError} If the argument is not a valid Document.
	 */
	extract(document) {
		if (!document || typeof document.querySelectorAll !== "function") {
			throw new TypeError(
				"Expected a DOM Document with querySelectorAll.",
			);
		}

		const OG_PREFIX = "og:";
		const metaTags = document.querySelectorAll("meta");
		const result = new WebpageMeta();

		/**
		 * Adds a value to a map of arrays.
		 * @param {Map<string, string[]>} map
		 * @param {string} key
		 * @param {string} value
		 */
		function addToMap(map, key, value) {
			if (!map.has(key)) {
				map.set(key, []);
			}
			const arr = map.get(key);
			if (arr) {
				arr.push(value);
			}
		}

		// Extract <link rel="icon"> and <link rel="shortcut icon"> (and all rels containing "icon")
		const linkTags = document.querySelectorAll("link[rel]");
		for (const tag of linkTags) {
			const rel = tag.getAttribute("rel").trim().toLowerCase();
			const href = tag.getAttribute("href");
			const type = tag.getAttribute("type") || undefined;
			const sizes = tag.getAttribute("sizes") || undefined;

			if (!href || !rel) {
				continue;
			}

			if (rel === "icon" || rel === "shortcut icon") {
				result.favicons.push(
					new WebpageFavicon(href, { rel, type, sizes }),
				);
			}
			if (rel === "icon" && !result.other.has("icon")) {
				result.other.set("icon", href);
			}
			if (rel === "shortcut icon" && !result.other.has("shortcut icon")) {
				result.other.set("shortcut icon", href);
			}
		}

		for (const tag of metaTags) {
			const property = tag.getAttribute("property");
			const name = tag.getAttribute("name");
			const contentRaw = tag.getAttribute("content");

			if (!contentRaw) {
				continue;
			}

			const content = decodeHtmlEntities(contentRaw);

			// Special Open Graph image handling (property only)
			if (property && property.startsWith(OG_PREFIX)) {
				if (property === "og:image" || property === "og:image:url") {
					result.images.push(new WebpageImage(content));
				} else if (
					property.startsWith("og:image:") &&
					result.images.length > 0
				) {
					const lastImage = result.images[result.images.length - 1];
					const subKey = property.slice("og:image:".length);
					if (subKey === "secure_url") {
						lastImage.secureUrl = content;
					} else if (subKey === "type") {
						lastImage.type = content;
					} else if (subKey === "width") {
						const num = Number(content);
						lastImage.width = Number.isNaN(num) ? undefined : num;
					} else if (subKey === "height") {
						const num = Number(content);
						lastImage.height = Number.isNaN(num) ? undefined : num;
					} else if (subKey === "alt") {
						lastImage.alt = content;
					}
				}

				// --- VIDEO HANDLING ---
				if (property === "og:video" || property === "og:video:url") {
					result.videos.push(new WebpageVideo(content));
				} else if (
					property.startsWith("og:video:") &&
					result.videos.length > 0
				) {
					const lastVideo = result.videos[result.videos.length - 1];
					const subKey = property.slice("og:video:".length);
					if (subKey === "secure_url") {
						lastVideo.secureUrl = content;
					} else if (subKey === "type") {
						lastVideo.type = content;
					} else if (subKey === "width") {
						const num = Number(content);
						lastVideo.width = Number.isNaN(num) ? undefined : num;
					} else if (subKey === "height") {
						const num = Number(content);
						lastVideo.height = Number.isNaN(num) ? undefined : num;
					} else if (subKey === "alt") {
						lastVideo.alt = content;
					}
				}
			}

			// Add property and name to meta map
			if (property) {
				addToMap(result.meta, property, content);
			}
			if (name) {
				addToMap(result.meta, name, content);
			}
		}

		// Extract <title> and first <h1> as potential title sources
		const canonicalTag = document.querySelector('link[rel="canonical"]');
		if (canonicalTag) {
			const canonicalHref = canonicalTag.getAttribute("href");

			if (canonicalHref) {
				result.canonicalUrl = canonicalHref;
			}
		}

		const titleTag = document.querySelector("title");
		if (titleTag && titleTag.textContent) {
			result.other.set("title", titleTag.textContent);
		}

		const h1Tag = document.querySelector("h1");
		if (h1Tag && h1Tag.textContent) {
			result.other.set("firstHeading", h1Tag.textContent);
		}

		// Extract feeds from <link rel="alternate" type="application/rss+xml"> or similar
		const feedLinkTags = document.querySelectorAll('link[rel="alternate"]');
		for (const tag of feedLinkTags) {
			const href = tag.getAttribute("href");
			if (!href) {
				continue;
			}
			const title = tag.getAttribute("title") || undefined;
			const type = tag.getAttribute("type") || undefined;

			// Only allow RSS, Atom, or JSONFeed
			if (type && ALLOWED_FEED_TYPES.has(type)) {
				result.feeds.push(new WebpageFeed(href, { title, type }));
			}
		}

		// Extract JSON-LD data
		const scriptTags = document.querySelectorAll(
			'script[type="application/ld+json"]',
		);
		for (const tag of scriptTags) {
			try {
				const json = JSON.parse(tag.textContent);
				if (Array.isArray(json)) {
					for (const item of json) {
						result.jsonld.push(item);
					}
				} else {
					result.jsonld.push(json);
				}
			} catch {
				// Ignore JSON-LD parsing errors
			}
		}

		// Find all top-level microdata items
		const topLevelItems = document.querySelectorAll(
			"[itemscope]:not([itemprop])",
		);
		for (const itemElem of topLevelItems) {
			const item = extractMicrodataItem(itemElem);
			if (item) {
				result.microdata.push(item);
			}
		}

		return result;
	}
}
