import tinybind from './tinybind'
import View from './view'
import {OPTIONS, EXTENSIONS} from './constants'
import adapter from './adapter'
import binders from './binders'
import formatters from './formatters'
import Observer from './observer'
import Component from './component'

// Returns the public interface.

tinybind.binders = binders
tinybind.formatters = formatters
tinybind.adapters['.'] = adapter
tinybind.Component = Component

// Binds some data to a template / element. Returns a tinybind.View instance.
tinybind.bind = (el, models, options) => {
  let viewOptions = {}
  models = models || {}
  options = options || {}

  EXTENSIONS.forEach(extensionType => {
    viewOptions[extensionType] = Object.create(null)

    if (options[extensionType]) {
      Object.keys(options[extensionType]).forEach(key => {
        viewOptions[extensionType][key] = options[extensionType][key]
      })
    }

    Object.keys(tinybind[extensionType]).forEach(key => {
      if (!viewOptions[extensionType][key]) {
        viewOptions[extensionType][key] = tinybind[extensionType][key]
      }
    })
  })

  OPTIONS.forEach(option => {
    let value = options[option]
    viewOptions[option] = value != null ? value : tinybind[option]
  })

  viewOptions.starBinders = Object.keys(viewOptions.binders).filter(function (key) {
    return key.indexOf('*') > 0
  })

  Observer.updateOptions(viewOptions)

  let view = new View(el, models, viewOptions)
  view.bind()
  return view
}

export default tinybind
