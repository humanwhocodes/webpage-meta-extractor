# Webpage Meta Extractor

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate).

## Description

TODO

## Installation

```shell
npm install @humanwhocodes/webpage-meta-extractor
```

## Usage

### Basic Example

```js
import { WebpageMetaExtractor } from "@humanwhocodes/webpage-meta-extractor";
import { JSDOM } from "jsdom";

const html = `
<html><head>
  <meta property="og:title" content="Example Title" />
  <meta name="twitter:card" content="summary" />
  <meta name="description" content="A description." />
  <link rel="icon" href="/favicon.ico" />
  <title>Fallback Title</title>
</head></html>
`;
const dom = new JSDOM(html);

const extractor = new WebpageMetaExtractor();
const meta = extractor.extract(dom.window.document);

console.log(meta.title); // "Example Title"
console.log(meta.description); // "A description."
console.log(meta.favicon); // "/favicon.ico" (prefers SVG, then PNG 32x32+, then ICO, then fallback)
console.log(meta.favicons); // Array of Favicon objects
console.log(meta.openGraph); // Map { 'title' => [ 'Example Title' ] }
console.log(meta.twitterCard); // Map { 'card' => [ 'summary' ] }
console.log(meta.meta); // Map { 'description' => [ 'A description.' ] }
```

### API

#### `WebpageMetaExtractor`

- `extract(document)` — Extracts meta information from a DOM Document. Throws `TypeError` if input is invalid. Returns a `WebpageMeta` instance.

#### `WebpageMeta` properties

- `openGraph` — Map of Open Graph meta tags (without `og:` prefix)
- `twitterCard` — Map of Twitter Card meta tags (without `twitter:` prefix)
- `meta` — Map of other meta tags
- `other` — Map of other extracted data (icon, shortcut icon, `<title>`, first `<h1>`)
- `feeds` — Array of discovered feeds
- `favicons` — Array of all favicon candidates found on the page. Each item is a `Favicon` object with:
    - `rel` (string): The rel attribute
    - `type` (string, optional): The type attribute
    - `href` (string): The href attribute
    - `sizes` (string, optional): The sizes attribute
- `favicon` — Favicon URL (string, selected by preference: SVG > PNG 32x32+ > ICO > fallback)
- `title` — Page title (string or undefined)
- `description` — Page description (string or undefined)
- `image` — Page image URL (string or undefined)
- `url` — Canonical URL (string or undefined)
- `siteName` — Site name (string or undefined)
- `jsonld` — Array of all JSON-LD data found in `<script type="application/ld+json">` tags. Each element is a parsed JSON object.
- `images` — Array of all Open Graph images found on the page. Each item is a `MetaImage` object with the following properties:
    - `url` (string, required): The image URL (from `og:image` or `og:image:url`)
    - `secureUrl` (string, optional): Secure image URL (`og:image:secure_url`)
    - `type` (string, optional): Image MIME type (`og:image:type`)
    - `width` (string, optional): Image width in pixels (`og:image:width`)
    - `height` (string, optional): Image height in pixels (`og:image:height`)
    - `alt` (string, optional): Image alt text (`og:image:alt`)

#### Error Handling

- Throws `TypeError` with message `"Expected a DOM Document with querySelectorAll."` if input is not a valid DOM Document.

#### Example with Feeds

```js
const html = `
<html><head>
  <link rel="alternate" type="application/rss+xml" title="RSS" href="/feed.xml" />
</head></html>
`;
const dom = new JSDOM(html);
const meta = extractor.extract(dom.window.document);
console.log(meta.feeds); // [ { title: 'RSS', type: 'application/rss+xml', href: '/feed.xml' } ]
```

##### Example: Extracting all Open Graph images

```js
const html = `
<html><head>
  <meta property="og:image" content="img1.jpg" />
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="400" />
  <meta property="og:image:alt" content="First image" />
  <meta property="og:image:url" content="img2.jpg" />
  <meta property="og:image:width" content="800" />
  <meta property="og:image:alt" content="Second image" />
</head></html>
`;
const dom = new JSDOM(html);
const meta = extractor.extract(dom.window.document);
console.log(meta.images);
// [
//   {
//     url: "img1.jpg",
//     secureUrl: undefined,
//     type: undefined,
//     width: "600",
//     height: "400",
//     alt: "First image"
//   },
//   {
//     url: "img2.jpg",
//     secureUrl: undefined,
//     type: undefined,
//     width: "800",
//     height: undefined,
//     alt: "Second image"
//   }
// ]
```

##### Example: Extracting JSON-LD data

```js
const html = `
<html><head>
  <script type="application/ld+json">
    {"@context": "https://schema.org", "@type": "Person", "name": "John Doe"}
  </script>
  <script type="application/ld+json">
    {"@context": "https://schema.org", "@type": "Organization", "name": "Acme Corp"}
  </script>
</head></html>
`;
const dom = new JSDOM(html);
const meta = extractor.extract(dom.window.document);
console.log(meta.jsonld);
// [
//   { "@context": "https://schema.org", "@type": "Person", "name": "John Doe" },
//   { "@context": "https://schema.org", "@type": "Organization", "name": "Acme Corp" }
// ]
```

## License

Copyright 2025 Nicholas C. Zakas

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
