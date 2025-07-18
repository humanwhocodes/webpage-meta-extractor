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
		const TWITTER_PREFIX = "twitter:";
		const metaTags = document.querySelectorAll("meta");
		const result = new WebpageMeta();

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
			const content = tag.getAttribute("content");

			// Open Graph (only process property)
			if (property && content && property.startsWith(OG_PREFIX)) {
				const key = property.slice(OG_PREFIX.length);
				if (!result.openGraph.has(key)) {
					result.openGraph.set(key, []);
				}
				const ogList = result.openGraph.get(key);
				if (ogList) {
					ogList.push(content);
				}

				// Only create a new image for og:image or og:image:url
				if (key === "image" || key === "image:url") {
					result.images.push(new WebpageImage(content));
				} else if (
					key.startsWith("image:") &&
					result.images.length > 0
				) {
					// Structured property for the most recent image
					const lastImage = result.images[result.images.length - 1];
					const subKey = key.slice("image:".length);
					if (subKey === "secure_url") {
						lastImage.secureUrl = content;
					} else if (subKey === "type") {
						lastImage.type = content;
					} else if (subKey === "width") {
						lastImage.width = content;
					} else if (subKey === "height") {
						lastImage.height = content;
					} else if (subKey === "alt") {
						lastImage.alt = content;
					}
				}
			}

			// Twitter Card (property)
			if (property && content && property.startsWith(TWITTER_PREFIX)) {
				const key = property.slice(TWITTER_PREFIX.length);
				if (!result.twitterCard.has(key)) {
					result.twitterCard.set(key, []);
				}
				const twList = result.twitterCard.get(key);
				if (twList) {
					twList.push(content);
				}
			}

			// Twitter Card (name)
			if (name && content && name.startsWith(TWITTER_PREFIX)) {
				const key = name.slice(TWITTER_PREFIX.length);
				if (!result.twitterCard.has(key)) {
					result.twitterCard.set(key, []);
				}
				const twList = result.twitterCard.get(key);
				if (twList) {
					twList.push(content);
				}
			}

			// Only store meta tags that are not Open Graph or Twitter Card in meta
			if (
				name &&
				content &&
				!name.startsWith(OG_PREFIX) &&
				!name.startsWith(TWITTER_PREFIX)
			) {
				if (!result.meta.has(name)) {
					result.meta.set(name, []);
				}
				const metaList = result.meta.get(name);
				if (metaList) {
					metaList.push(content);
				}
			}

			// Also store non-OG/non-Twitter property attributes in meta
			if (
				property &&
				content &&
				!property.startsWith(OG_PREFIX) &&
				!property.startsWith(TWITTER_PREFIX)
			) {
				if (!result.meta.has(property)) {
					result.meta.set(property, []);
				}
				const metaList = result.meta.get(property);
				if (metaList) {
					metaList.push(content);
				}
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
				result.jsonld.push(json);
			} catch {
				// Ignore JSON-LD parsing errors
			}
		}

		return result;
	}
}
