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
	 * @type {string}
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
	 * @param {string} rel The rel attribute.
	 * @param {string} href The href attribute.
	 * @param {string|undefined} type The type attribute.
	 * @param {string|undefined} sizes The sizes attribute.
	 */
	constructor(rel, href, type, sizes) {
		this.rel = rel;
		this.href = href;
		this.type = type;
		this.sizes = sizes;
	}
}
