/**
 * WebpageMeta represents extracted Open Graph, Twitter Card, and other meta tag information.
 */
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
	 * @type {Feed[]}
	 */
	feeds = [];

	/**
	 * All Open Graph images found on the page.
	 * @type {MetaImage[]}
	 */
	images = [];

	/**
	 * All JSON-LD data found in the page.
	 * @type {any[]}
	 */
	jsonld = [];

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
 * Represents an Open Graph image and its associated meta information.
 */
export class MetaImage {
	/**
	 * The image URL (required).
	 * @type {string}
	 */
	url;

	/**
	 * The image secure URL (optional).
	 * @type {string|undefined}
	 */
	secureUrl;

	/**
	 * The image type (optional).
	 * @type {string|undefined}
	 */
	type;

	/**
	 * The image width (optional).
	 * @type {string|undefined}
	 */
	width;

	/**
	 * The image height (optional).
	 * @type {string|undefined}
	 */
	height;

	/**
	 * The image alt text (optional).
	 * @type {string|undefined}
	 */
	alt;

	/**
	 * Creates a new MetaImage instance.
	 * @param {object} params The image parameters.
	 * @param {string} params.url The image URL.
	 * @param {string} [params.secureUrl] The secure image URL.
	 * @param {string} [params.type] The image type.
	 * @param {string} [params.width] The image width.
	 * @param {string} [params.height] The image height.
	 * @param {string} [params.alt] The image alt text.
	 */
	constructor({ url, secureUrl, type, width, height, alt }) {
		this.url = url;
		this.secureUrl = secureUrl;
		this.type = type;
		this.width = width;
		this.height = height;
		this.alt = alt;
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
			throw new TypeError(
				"Expected a DOM Document with querySelectorAll.",
			);
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

		// Temporary storage for grouping og:image meta fields by index
		const ogImageMap = new Map();

		// Extract Open Graph and Twitter Card meta tags
		let currentImageObj = null;
		for (const tag of metaTags) {
			const property = tag.getAttribute("property");
			const name = tag.getAttribute("name");
			const content = tag.getAttribute("content");

			if (property && content) {
				if (property.startsWith(OG_PREFIX)) {
					const key = property.slice(OG_PREFIX.length);
					if (!result.openGraph.has(key)) {
						result.openGraph.set(key, []);
					}
					const ogList = result.openGraph.get(key);
					if (ogList) {
						ogList.push(content);
					}
				} else if (property.startsWith(TWITTER_PREFIX)) {
					const key = property.slice(TWITTER_PREFIX.length);
					if (!result.twitterCard.has(key)) {
						result.twitterCard.set(key, []);
					}
					const twList = result.twitterCard.get(key);
					if (twList) {
						twList.push(content);
					}
				}
			}

			// Also handle Twitter Card and Open Graph via name attribute
			if (name && content) {
				if (name.startsWith(OG_PREFIX)) {
					const key = name.slice(OG_PREFIX.length);
					if (!result.openGraph.has(key)) {
						result.openGraph.set(key, []);
					}
					const ogList = result.openGraph.get(key);
					if (ogList) {
						ogList.push(content);
					}
				} else if (name.startsWith(TWITTER_PREFIX)) {
					const key = name.slice(TWITTER_PREFIX.length);
					if (!result.twitterCard.has(key)) {
						result.twitterCard.set(key, []);
					}
					const twList = result.twitterCard.get(key);
					if (twList) {
						twList.push(content);
					}
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

			// Collect Open Graph image meta fields for images array (Open Graph spec)
			if (property && content && property.startsWith(OG_PREFIX)) {
				const key = property.slice(OG_PREFIX.length);
				if (key === "image" || key === "image:url") {
					// Start a new image object
					currentImageObj = { url: content };
					result.images.push(new MetaImage(currentImageObj));
				} else if (key.startsWith("image:")) {
					// Structured property for the most recent image
					if (result.images.length > 0) {
						const lastImage =
							result.images[result.images.length - 1];
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
			}
		}

		// After all meta tags, create MetaImage instances for each og:image
		for (const imageObj of ogImageMap.values()) {
			if (imageObj.url) {
				result.images.push(new MetaImage(imageObj));
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

		// Extract <script type="application/ld+json">
		const jsonLdTags = document.querySelectorAll(
			"script[type='application/ld+json']",
		);
		for (const tag of jsonLdTags) {
			try {
				if (tag.textContent) {
					result.jsonld.push(JSON.parse(tag.textContent));
				}
			} catch {
				// Ignore JSON parse errors for malformed JSON-LD
			}
		}

		return result;
	}
}
