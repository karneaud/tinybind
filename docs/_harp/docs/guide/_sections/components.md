Tinybind comes with a light web component implementation allowing to create reusable HTML elements.

#### Defining a template

A component must de defined as a class descendent of `tinybind.Component` with a `template` static property:

```javascript
  class MyComponent extends tinybind.Component {
    static get template() {
      return `      
      <span>{ message }</span>
      `
    }    
  }
```

The template is bound to the element instance, so, in the example above, the value of element "message" property will be displayed and its changes tracked. 

#### Tracking attributes

To use values passed to the element as attributes, is necessary to define a `properties` static property that must return a hash where the key is the property that will be used in the template and the value the attribute name or any other non string value.

```javascript
  class MyComponent extends tinybind.Component {
    static get properties() {
      return {
        message: true,
        iconUrl: 'icon'
      }
    }
  }
```

#### Registering custom element

In order to use a component it must be registered once per application:

```javascript
customElements.define('my-component', MyComponent)
```

#### Using

Just like any other html element:

```html
<my-component message="Hello"></my-component>
```

> Internet Explorer requires the use of a compiler like babel to transpile the class as well to use the [webcomponents polyfill](https://github.com/webcomponents/webcomponentsjs)