/**
 * @fileoverview Represents an Open Graph video and its associated meta information.
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Exports
//-----------------------------------------------------------------------------

export class WebpageVideo {
	/**
	 * The video URL (required).
	 * @type {string}
	 */
	url;

	/**
	 * The video secure URL (optional).
	 * @type {string|undefined}
	 */
	secureUrl;

	/**
	 * The video type (optional).
	 * @type {string|undefined}
	 */
	type;

	/**
	 * The video width (optional).
	 * @type {number|undefined}
	 */
	width;

	/**
	 * The video height (optional).
	 * @type {number|undefined}
	 */
	height;

	/**
	 * The video alt text (optional).
	 * @type {string|undefined}
	 */
	alt;

	/**
	 * Creates a new WebpageVideo instance.
	 * @param {string} url The video URL (required).
	 * @param {object} [options] Optional video properties.
	 * @param {string} [options.secureUrl] The secure video URL.
	 * @param {string} [options.type] The video type.
	 * @param {number} [options.width] The video width.
	 * @param {number} [options.height] The video height.
	 * @param {string} [options.alt] The video alt text.
	 * @throws {TypeError} If url is missing.
	 */
	constructor(url, options = {}) {
		if (!url) {
			throw new TypeError("WebpageVideo: url is required");
		}
		this.url = url;
		this.secureUrl = options.secureUrl;
		this.type = options.type;
		this.width = options.width;
		this.height = options.height;
		this.alt = options.alt;
	}

	/**
	 * The file extension of the video URL, including the leading dot (e.g., ".mp4").
	 * Strips query strings and fragments before determining the extension.
	 * Returns an empty string if no extension is found.
	 * @returns {string} The file extension, or an empty string if not found.
	 */
	get extname() {
		if (!this.url) {
			return "";
		}

		const cleanUrl = this.url.split(/[?#]/)[0];
		const lastDot = cleanUrl.lastIndexOf(".");
		if (lastDot === -1 || lastDot < cleanUrl.lastIndexOf("/")) {
			return "";
		}
		return cleanUrl.slice(lastDot).toLowerCase();
	}
}
