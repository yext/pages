# Templates

A template in Yext Sites is a file that tells the system how to render each document from a stream. This document are usually sets of entities inside a Yext Knowledge Graph. Each template could represent as few as 1 page or millions of pages. Each document in the stream is run through the template and produced as a new page.

# Sample Template

A simple template looks like this:

```jsx
// Configuration for the content to pull from Knowledge Graph
export const config = {
  stream: {
    source: "knowledgeGraph",
    fields: [
      "id",      
      "name",
      "address",
      "slug"
    ],
    filter: {
      entityTypes: ["location"],
    },
    localization: {
      locales: ["en"],
      primary: false,
    },
  },

  // Choose the field to use as the path. Slug is recommended.
  path: "slug"
};

const Index = ({ document }: { document: any }) => {
  const {
    id
    name,
    address,    
  } = document;

  return (
		<div>
			<div>{name}</div>
			<div>{JSON.stringify(address)}</div>
		</div>
  );
};

export default Index;
```

# Exports

Each template exports a few key functions:

## `config`

*required*

`config` is a required named export that is a an object that contains the following properties

- `stream` - Stream configuration for the template
- `path` - Field to use as the path (url) for the page. This field must be in the stream.

## `default`

*required*

The default export must be a React component. Here are the props that are passed into that component:

- `document` - This is the primary document for the page
- `global` - This is the global data for the site defined in `global.ts`
- `site` - The site stream entity defined in `global.ts`
- `loader` - This is data returned by the loader
- `links` -
- `manifest` - I’m confused by what this is...

Here is an example:

```jsx
const Index = ({ document, global, site, manifest }) => {
  const {
    id
    name,
    address,    
  } = document;

  return (
		<div>
			<div>{name}</div>
			<div>{JSON.stringify(address)}</div>
		</div>
  );
};

export default Index;
```

## `meta`

*optional*

`meta` is an optional function that allows you to set meta information on the page. While it’s optional it’s highly recommended for SEO best practices. Here is an example:

```jsx
export const getMeta: GetMeta = async ({ document, global, siteStream, manifest }) => {
   return { 
		title: document.title,
		description: document.description
	}
}
```

## `getStaticProps`

*optional*

Loader is a function that allows you to perform data loading tasks during the page generation. Here is an example:

```tsx
export const getStaticProps: GetStaticProps = async ({ document, global, siteStream, manifest }) => {
   return { hello: "world"}
}
```

It should return an object. This object is then passed into the default component as a prop. Some things to note:

- This function is async so you can do data fetching from external APIs. Note that if this function is slow it will slow down your page generation time.
- This function runs in Deno so make sure your function is compatible with that environment.

## `headers`

*option*

`headers` is a function that allows you to customize the headers that are returned for a given template. This also works on pages. Here is an example:

```jsx
 export const getHeaders: GetHeaders = ({ document, global, siteStream, manifest }) => {
  return {
    "X-Stretchy-Pants": "its for fun",
    "Cache-Control": "max-age=300, s-maxage=3600",
  };
}
```

## `path`

*optional*

`path` is an optional way to customize paths even further. If you don’t want to use the `slug` field then you can write a custom javascript function.  To do this you should export the `path` object which has two functions: 

1. `documentToPath` - This function takes in the `document` and returns the path of the document. This can be async but that will impact page generation speeds. 
2. `pathToId` - This function takes in a `path` and returns the given entity ID. This is required in order for local dev to have consistent URLs with production. This can be an async function if you need to query the KG in order to find the ID but that will impact local dev speed. 

```jsx
export const path = {
	getPath: async ({ document, global, siteStream, manifest }) => {
		const { id, name } = document;
		return `locations/${name}/${id}`
	},
  getIdFromPath: async ({ path }) => {
		const parts = path.split("/");
		return parts[2]
	}

```