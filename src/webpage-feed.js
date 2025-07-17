/**
 * @fileoverview Represents a feed discovered in the page.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * Represents a feed discovered in the page.
 */
export class WebpageFeed {
	/**
	 * The href (URL) of the feed.
	 * @type {string}
	 */
	href;

	/**
	 * The title of the feed, if available.
	 * @type {string|undefined}
	 */
	title;

	/**
	 * The type of the feed (e.g., 'application/rss+xml').
	 * @type {string|undefined}
	 */
	type;

	/**
	 * Creates a new WebpageFeed instance.
	 * @param {string} href The feed URL (required).
	 * @param {object} [options] Optional feed properties.
	 * @param {string} [options.title] The feed title.
	 * @param {string} [options.type] The feed type.
	 * @throws {TypeError} If href is missing.
	 */
	constructor(href, options = {}) {
		if (!href) {
			throw new TypeError("WebpageFeed: href is required");
		}
		this.href = href;
		this.title = options.title;
		this.type = options.type;
	}
}
