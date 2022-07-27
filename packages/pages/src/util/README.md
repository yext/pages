# Provided utility functions

## getRuntime()

Returns a class that has information about the runtime executing the code. This is important because the code can be executed in:
- Node (during local dev)
- Deno (during production build/generation)
- the browser (any executed frontend code)

This can be useful when the function or library differs depending on the runtime. `fetch` is one example as it's not native to Node < v18.

## fetch()

A custom fetch implementation that determines which fetch library to use depending on the current runtime. When locally developing, Node is used. Since fetch is only native starting in v18 and the version on the user's machine is up to them, we need to polyfill fetch. Under the hood this uses cross-fetch. 