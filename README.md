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
console.log(meta.favicon); // "/favicon.ico"
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
- `favicon` — Favicon URL (string)
- `title` — Page title (string or undefined)
- `description` — Page description (string or undefined)
- `image` — Page image URL (string or undefined)
- `url` — Canonical URL (string or undefined)
- `siteName` — Site name (string or undefined)

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
