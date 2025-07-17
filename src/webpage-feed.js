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
