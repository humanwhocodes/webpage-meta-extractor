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
