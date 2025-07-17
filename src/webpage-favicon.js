/**
 * @fileoverview Favicon represents a favicon link element.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

/**
 * Favicon represents a favicon link element.
 */
export class WebpageFavicon {
	/**
	 * The rel attribute of the favicon.
	 * @type {string|undefined}
	 */
	rel;

	/**
	 * The type attribute of the favicon.
	 * @type {string|undefined}
	 */
	type;

	/**
	 * The href attribute of the favicon.
	 * @type {string}
	 */
	href;

	/**
	 * The sizes attribute of the favicon.
	 * @type {string|undefined}
	 */
	sizes;

	/**
	 * Creates a new Favicon instance.
	 * @param {string} href The href attribute (required).
	 * @param {object} [options] Optional favicon properties.
	 * @param {string} [options.rel] The rel attribute.
	 * @param {string} [options.type] The type attribute.
	 * @param {string} [options.sizes] The sizes attribute.
	 * @throws {TypeError} If href is missing.
	 */
	constructor(href, options = {}) {
		if (!href) {
			throw new TypeError("WebpageFavicon: href is required");
		}
		this.href = href;
		this.rel = options.rel;
		this.type = options.type;
		this.sizes = options.sizes;
	}
}
