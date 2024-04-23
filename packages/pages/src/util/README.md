# Provided utility functions

## getRuntime()

Returns a class that has information about the runtime executing the code. This is important because the code can be executed in:

- Node (during local dev)
- Deno (during production build/generation)
- the browser (any executed frontend code)

This can be useful when the function or library differs depending on the runtime. `fetch` is one example as it's not native to Node < v18.

## isProduction()

Determines if the code is being executed on the production site on the client. This is useful for things like firing analytics only in production (opposed to dev or staging) and not during server side rendering.

## dynamic()

A component that will dynamically load an import, similar to React 18's lazy component.
