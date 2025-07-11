/**
 * WebpageMeta represents extracted Open Graph, Twitter Card, and other meta tag information.
 */
export class WebpageMeta {
	/**
	 * Open Graph meta tags.
	 * @type {Map<string, string[]>}
	 */
	openGraph = new Map();

	/**
	 * Twitter Card meta tags.
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
	 * @type {Feed[]}
	 */
	feeds = [];

	/**
	 * Creates a new instance of WebpageMeta.
	 */
	constructor() {}

	/**
	 * The favicon URL of the page, determined by icon, shortcut icon, or defaults to /favicon.ico.
	 * @returns {string} The favicon URL.
	 */
	get favicon() {
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
		const og = this.openGraph.get("og:title");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.twitterCard.get("twitter:title");
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
		const og = this.openGraph.get("og:description");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.twitterCard.get("twitter:description");
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
		const og = this.openGraph.get("og:image");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.twitterCard.get("twitter:image");
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
		const og = this.openGraph.get("og:url");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.twitterCard.get("twitter:url");
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
		const og = this.openGraph.get("og:site_name");
		if (og && og.length) {
			return og[0];
		}

		const tw = this.twitterCard.get("twitter:site");
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

/**
 * Represents a feed discovered in the page.
 */
export class Feed {
	/**
	 * The title of the feed, if available.
	 * @type {string|undefined}
	 */
	title;

	/**
	 * The type of the feed (e.g., 'application/rss+xml').
	 * @type {string}
	 */
	type;

	/**
	 * The href (URL) of the feed.
	 * @type {string}
	 */
	href;

	/**
	 * Creates a new Feed instance.
	 * @param {string|undefined} title The feed title.
	 * @param {string} type The feed type.
	 * @param {string} href The feed URL.
	 */
	constructor(title, type, href) {
		this.title = title;
		this.type = type;
		this.href = href;
	}
}

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
			throw new TypeError("Expected a DOM Document with querySelectorAll.");
		}

		const OG_PREFIX = "og:";
		const TWITTER_PREFIX = "twitter:";
		const metaTags = document.querySelectorAll("meta");
		const result = new WebpageMeta();

		// Extract <link rel="icon"> and <link rel="shortcut icon">
		const linkTags = document.querySelectorAll("link[rel]");
		for (const tag of linkTags) {
			const rel = tag.getAttribute("rel");
			const href = tag.getAttribute("href");

			if (!href) {
				continue;
			}

			if (rel === "icon") {
				if (!result.other.has("icon")) {
					result.other.set("icon", href);
				}
			}

			if (rel === "shortcut icon") {
				if (!result.other.has("shortcut icon")) {
					result.other.set("shortcut icon", href);
				}
			}
		}

		// Extract Open Graph and Twitter Card meta tags
		for (const tag of metaTags) {
			const property = tag.getAttribute("property");
			const name = tag.getAttribute("name");
			const content = tag.getAttribute("content");

			if (property && content) {
				if (property.startsWith(OG_PREFIX)) {
					if (!result.openGraph.has(property)) {
						result.openGraph.set(property, []);
					}
					const ogList = result.openGraph.get(property);
					if (ogList) {
						ogList.push(content);
					}
				} else if (property.startsWith(TWITTER_PREFIX)) {
					if (!result.twitterCard.has(property)) {
						result.twitterCard.set(property, []);
					}
					const twList = result.twitterCard.get(property);
					if (twList) {
						twList.push(content);
					}
				}
			}

			// Also handle Twitter Card and Open Graph via name attribute
			if (name && content) {
				if (name.startsWith(OG_PREFIX)) {
					if (!result.openGraph.has(name)) {
						result.openGraph.set(name, []);
					}
					const ogList = result.openGraph.get(name);
					if (ogList) {
						ogList.push(content);
					}
				} else if (name.startsWith(TWITTER_PREFIX)) {
					if (!result.twitterCard.has(name)) {
						result.twitterCard.set(name, []);
					}
					const twList = result.twitterCard.get(name);
					if (twList) {
						twList.push(content);
					}
				}
			}

			// Only store meta tags that are not Open Graph or Twitter Card in meta
			if (name && content && !name.startsWith(OG_PREFIX) && !name.startsWith(TWITTER_PREFIX)) {
				if (!result.meta.has(name)) {
					result.meta.set(name, []);
				}
				const metaList = result.meta.get(name);
				if (metaList) {
					metaList.push(content);
				}
			}

			// Also store non-OG/non-Twitter property attributes in meta
			if (property && content && !property.startsWith(OG_PREFIX) && !property.startsWith(TWITTER_PREFIX)) {
				if (!result.meta.has(property)) {
					result.meta.set(property, []);
				}
				const metaList = result.meta.get(property);
				if (metaList) {
					metaList.push(content);
				}
			}
		}

		// Extract <title> tag
		const titleTag = document.querySelector("title");
		if (titleTag && titleTag.textContent) {
			result.other.set("title", titleTag.textContent);
		}

		// Extract first <h1> tag
		const h1Tag = document.querySelector("h1");
		if (h1Tag && h1Tag.textContent) {
			result.other.set("firstHeading", h1Tag.textContent);
		}

		// Extract feeds from <link rel="alternate" type="application/rss+xml"> and similar
		const feedLinkTags = document.querySelectorAll("link[rel='alternate']");
		for (const tag of feedLinkTags) {
			const title = tag.getAttribute("title") || undefined;
			const type = tag.getAttribute("type") || "";
			const href = tag.getAttribute("href");

			if (href) {
				result.feeds.push(new Feed(title, type, href));
			}
		}

		return result;
	}
}
