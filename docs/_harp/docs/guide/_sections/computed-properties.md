Computed properties are re-evaluated when one or more dependent properties change. Declaring computed properties in Tinybind.js is possible by using buitin `watch` formatter followed by its dependencies. The following text binding will get re-evaluated when either the event's `start` or `end` attribute changes.

```html
<span rv-text="dateRange | watch start end"></span>
```
