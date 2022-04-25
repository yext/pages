# Global Data

Global data is specified in the `global.ts` file that is at the root of the site. 

### Sample File

```jsx
// ./src/global.ts

// Global Data goes here
export const global = {
	"hello": "world"
}

// Global Stream goes here
export const streamConfig = {
source: "knowledgeGraph",
    fields: [
      "id",      
      "name",
      "address",
      "slug"
    ],
		entityId: [234724],
    filter: {
      entityTypes: ["location"],
    },
    localization: {
      locales: ["en"],
      primary: false,
    },
}

```