# Pages

Pages are static pages that aren’t used with a stream. You can use a static page for your homepage, your search results page and any other page that doesn’t correspond to an entity in your Knowledge Graph.

# Path

The URL of the page is based upon the file path inside the repo. For example:

```jsx
.
├── src
│   ├── pages
│   │   ├── index.tsx // domain.com
│   │   ├── legal // This is a folder
│   │   │   ├── index.tsx // domain.com/legal
│   │   │   ├── faq.tsx // domain.com/legal/faq
│   │   │   └── tac.tsx // domain.com/legal/tac
│   │   └── search.tsx // domain.com/search

```

# Sample Page

A simple page looks like this:

```jsx
const Index = () => {
  return (
    <div>
      <div>Hello World</div>
    </div>
  );
};

export default Index;
```

# Exports

Each page exports a few key functions:

## `default`

_required_

The default export must be a React component. Here are the props that are passed into that component:

- `global` - This is the global data for the site.
- `site` - The site stream entity that was specified in global.ts
- `manifest` - I’m confused by what this is
- `loader` - Any data returned by the loader

## `getMeta`

_optional_

`meta` is an optional function that allows you to set meta information on the page. While it’s optional it’s highly recommended for SEO best practices. Here is an example:

```jsx
export const getMeta: GetMeta = async ({ global, manifest, siteStream }) => {
  return {
    title: document.title,
    description: document.description,
  };
};
```

## `getStaticProps`

_optional_

Loader is a function that allows you to perform data loading tasks during the page generation. Here is an example:

```tsx
export const getStaticProps: GetStaticProps = async ({
  global,
  manifest,
  siteStream,
}) => {
  return { hello: "world" };
};
```

It should return an object. This object is then passed into the default component as a prop. Some things to note:

- This function is async so you can do data fetching from external APIs. Note that if this function is slow it will slow down your page generation time.
- This function runs in Deno so make sure your function is compatible with that environment.

## `getHeaders`

_option_

`getHeaders` is a function that allows you to customize the headers that are returned for a given template. This also works on pages. Here is an example:

```jsx
export const getHeaders: GetHeaders = ({ global, manifest, siteStream }) => {
  return {
    "X-Stretchy-Pants": "its for fun",
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
};
```
