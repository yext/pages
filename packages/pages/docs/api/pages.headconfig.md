<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@yext/pages](./pages.md) &gt; [HeadConfig](./pages.headconfig.md)

## HeadConfig interface

The configuration that allows users to entirely arbitarily set the inner contents of the head element that will be prepended to the generated HTML document.

<b>Signature:</b>

```typescript
export interface HeadConfig
```

## Properties

| Property                                    | Modifiers | Type                              | Description                                                                                                                                                         |
| ------------------------------------------- | --------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [charset?](./pages.headconfig.charset.md)   |           | string                            | <i>(Optional)</i> Declares the document's encoding. Will default to 'UTF-8' if omitted.                                                                             |
| [lang?](./pages.headconfig.lang.md)         |           | string                            | <i>(Optional)</i> Lang of the page. Will be set to the document's locale if omitted.                                                                                |
| [other?](./pages.headconfig.other.md)       |           | string                            | <i>(Optional)</i> For any content that can't be fully encapsulted by our Tag interface, (i.e. template or style) an arbitrary, user-defined string can be provided. |
| [tags?](./pages.headconfig.tags.md)         |           | [Tag](./pages.tag.md)<!-- -->\[\] | <i>(Optional)</i> Well-defined interface for adding HTML tags (such as meta tags)                                                                                   |
| [title?](./pages.headconfig.title.md)       |           | string                            | <i>(Optional)</i> Title of the page. Will default to 'Yext Pages Site' if omitted.                                                                                  |
| [viewport?](./pages.headconfig.viewport.md) |           | string                            | <i>(Optional)</i> Declares the size and shape of the document's viewport. Will default to 'width=device-width, initial-scale=1' if omitted.                         |