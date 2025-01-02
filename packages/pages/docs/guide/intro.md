# What is PagesJS?

PagesJS is a NextJS-like framework that makes development on the Yext Pages platform simple. It allows you to easily generate hundreds or event thousands of webpages from a single template file.

<div class="tip custom-block" style="padding-top: 8px">

Just want to try it out? Skip to the [Quickstart](./getting-started).

</div>

## Performance

Each template defines a _scope_, which is the set of entities to generate Pages for. A Page will be generated for every entity in the template's scope.

The Yext Pages system intelligently recognizes any updates made to your entity in the Knowledge Graph and will generate a new page automatically, ensuring that your Pages always stay up to date with your data.

Each Page is statically generated and backed by a CDN (Cloudflare). There is no server. This means that your customers will be able to load your Pages as fast as possible within their browser.
