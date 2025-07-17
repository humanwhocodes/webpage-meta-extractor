/**
 * @fileoverview Represents an Open Graph image and its associated meta information.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export class WebpageImage {
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
	 * Creates a new WebpageImage instance.
	 * @param {string} url The image URL (required).
	 * @param {object} [options] Optional image properties.
	 * @param {string} [options.secureUrl] The secure image URL.
	 * @param {string} [options.type] The image type.
	 * @param {string} [options.width] The image width.
	 * @param {string} [options.height] The image height.
	 * @param {string} [options.alt] The image alt text.
	 * @throws {TypeError} If url is missing.
	 */
	constructor(url, options = {}) {
		if (!url) {
			throw new TypeError("WebpageImage: url is required");
		}
		this.url = url;
		this.secureUrl = options.secureUrl;
		this.type = options.type;
		this.width = options.width;
		this.height = options.height;
		this.alt = options.alt;
	}
}
