The following formatters are provided by default:

#### not (alias: negate)

Returns `false` to truthy values and `true` for falsy values

#### watch

Returns the value as is. Can be used to track changes on one or more dependent properties that must be passed as arguments

```html
<span rv-text="dateRange | someFormatter | watch start end"></span>
```

In the example above the binding value will be updated when start or end properties changes
