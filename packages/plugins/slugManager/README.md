## Slug Manager Plugin

This plugin is intended to be used to assist in managing slug fields in the Knowledge Graph.

It provides two functions:
* `connector` - this function can be used as a function source for a data connector. It will update the slug field for all entities it is configured for. This is useful when the desired format of the slug field changes and all entities need to be updated. 
* `webhook` - this function can be used to respond to entity webhook events. It applies the desired slug format to new entities as they are created.