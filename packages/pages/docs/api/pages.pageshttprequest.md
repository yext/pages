<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@yext/pages](./pages.md) &gt; [PagesHttpRequest](./pages.pageshttprequest.md)

## PagesHttpRequest interface

The argument passed to a http/api type function.

**Signature:**

```typescript
export interface PagesHttpRequest
```

## Properties

| Property                                               | Modifiers | Type                             | Description                                            |
| ------------------------------------------------------ | --------- | -------------------------------- | ------------------------------------------------------ |
| [body](./pages.pageshttprequest.body.md)               |           | string                           | The body of the request                                |
| [headers](./pages.pageshttprequest.headers.md)         |           | { \[key: string\]: string\[\]; } | Request headers in the request                         |
| [method](./pages.pageshttprequest.method.md)           |           | string                           | Method of the request                                  |
| [pathParams](./pages.pageshttprequest.pathparams.md)   |           | { \[key: string\]: string; }     | Object containing each path parameter.                 |
| [queryParams](./pages.pageshttprequest.queryparams.md) |           | { \[key: string\]: string; }     | Object containing each query parameter.                |
| [site](./pages.pageshttprequest.site.md)               |           | [Site](./pages.site.md)          | Site object containing all deploy-related information. |