describe('Functional', function() {
  var data, bindData, el, input, originalPrefix, adapter;

  beforeEach(function() {
    originalPrefix = tinybind.prefix;
    tinybind.prefix = 'data';
    adapter = {
      observe: function(obj, keypath, callback) {
        obj.on(keypath, callback)
      },
      unobserve: function(obj, keypath, callback) {
        obj.off(keypath, callback)
      },
      get: function(obj, keypath) {
        return obj.get(keypath)
      },
      set: function(obj, keypath, value) {
        attributes = {};
        attributes[keypath] = value;
        obj.set(attributes)
      }
    };

    tinybind.adapters[':'] = adapter;
    tinybind.configure({preloadData: true});

    data = new Data({
      foo: 'bar',
      items: [{name: 'a'}, {name: 'b'}]
    });

    bindData = {data: data};

    el = document.createElement('div');
    input = document.createElement('input');
    input.setAttribute('type', 'text')
  });

  afterEach(function() {
    tinybind.prefix = originalPrefix
  });

  describe('Adapter', function() {
    it('should read the initial value', function() {
      sinon.spy(data, 'get');
      el.setAttribute('data-text', 'data:foo');
      tinybind.bind(el, bindData);
      data.get.calledWith('foo').should.be.true
    });

    it('should read the initial value unless preloadData is false', function() {
      tinybind.configure({preloadData: false});
      sinon.spy(data, 'get');
      el.setAttribute('data-value', 'data:foo');
      tinybind.bind(el, bindData);
      data.get.called.should.be.false
    });

    it('should subscribe to updates', function() {
      sinon.spy(data, 'on');
      el.setAttribute('data-value', 'data:foo');
      tinybind.bind(el, bindData);
      data.on.called.should.be.true
    })
  });

  describe('Binds', function() {
    describe('Text', function() {
      it('should set the text content of the element', function() {
        el.setAttribute('data-text', 'data:foo');
        tinybind.bind(el, bindData);
        el.textContent.should.equal(data.get('foo'))
      });

      it('should correctly handle HTML in the content', function() {
        el.setAttribute('data-text', 'data:foo');
        var value = '<b>Fail</b>';
        data.set({foo: value});
        tinybind.bind(el, bindData);
        el.textContent.should.equal(value)
      })
    });

    describe('HTML', function() {
      it('should set the html content of the element', function() {
        el.setAttribute('data-html', 'data:foo');
        tinybind.bind(el, bindData);
        el.textContent.should.equal(data.get('foo'))
      });

      it('should correctly handle HTML in the content', function() {
        el.setAttribute('data-html', 'data:foo');
        var value = '<b>Fail</b>';
        data.set({foo: value});
        tinybind.bind(el, bindData);
        el.innerHTML.should.equal(value)
      })
    });

    describe('Value', function() {
      it('should set the value of the element', function() {
        input.setAttribute('data-value', 'data:foo');
        tinybind.bind(input, bindData);
        input.value.should.equal(data.get('foo'))
      })
    });

    describe('Multiple', function() {
      it('should bind a list of multiple elements', function() {
        el.setAttribute('data-html', 'data:foo');
        input.setAttribute('data-value', 'data:foo');
        tinybind.bind([el, input], bindData);
        el.textContent.should.equal(data.get('foo'));
        input.value.should.equal(data.get('foo'))
      })
    });

    describe('Priority', function() {
      beforeEach(function() {
        tinybind.binders.a = {bind: function(){}};
        tinybind.binders.b = {bind: function(){}};

        sinon.spy(tinybind.binders.a, 'bind');
        sinon.spy(tinybind.binders.b, 'bind');

        el.setAttribute('data-a', 'data:foo');
        el.setAttribute('data-b', 'data:foo')
      });

      describe('a:10, b:30', function() {
        beforeEach(function() {
          tinybind.binders.a.priority = 10;
          tinybind.binders.b.priority = 30;
          tinybind.bind(el, bindData)
        });

        it('should bind b before a', function() {
          tinybind.binders.b.bind.calledBefore(tinybind.binders.a.bind).should.be.true
        })
      });

      describe('a:5, b:2', function() {
        beforeEach(function() {
          tinybind.binders.a.priority = 5;
          tinybind.binders.b.priority = 2;
          tinybind.bind(el, bindData)
        });

        it('should bind a before b', function() {
          tinybind.binders.a.bind.calledBefore(tinybind.binders.b.bind).should.be.true
        })
      });

      describe('a:undefined, b:1', function() {
        beforeEach(function() {
          tinybind.binders.b.priority = 1;
          tinybind.bind(el, bindData)
        });

        it('should bind b before a', function() {
          tinybind.binders.b.bind.calledBefore(tinybind.binders.a.bind).should.be.true
        })
      })
    });

    describe('Iteration', function() {
      var listItem;
      beforeEach(function(){
        list = document.createElement('ul');
        el.appendChild(list);
        listItem = document.createElement('li');
        listItem.setAttribute('data-each-item', 'data:items');
        list.appendChild(listItem)
      });

      it('should loop over a collection and create new instances of that element + children', function() {
        el.getElementsByTagName('li').length.should.equal(1);
        tinybind.bind(el, bindData);
        el.getElementsByTagName('li').length.should.equal(2)
      });

      it('should not fail if the collection being bound to is null', function() {
        data.set({ items: null});
        tinybind.bind(el, bindData);
        el.getElementsByTagName('li').length.should.equal(0)
      });

      it('should re-loop over the collection and create new instances when the array changes', function() {
        tinybind.bind(el, bindData);
        el.getElementsByTagName('li').length.should.equal(2);

        var newItems = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
        data.set({items: newItems});
        el.getElementsByTagName('li').length.should.equal(3)
      });

      it('should allow binding to the iterated item as well as any parent contexts', function() {
        var span1 = document.createElement('span');
        span1.setAttribute('data-text', 'item.name');
        var span2 = document.createElement('span');
        span2.setAttribute('data-text', 'data:foo');
        listItem.appendChild(span1);
        listItem.appendChild(span2);

        tinybind.bind(el, bindData);
        el.getElementsByTagName('span')[0].textContent.should.equal('a');
        el.getElementsByTagName('span')[1].textContent.should.equal('bar')
      });

      it('should allow binding to the iterated element directly', function() {
        listItem.setAttribute('data-text', 'item.name');
        listItem.setAttribute('data-class', 'data:foo');
        tinybind.bind(el, bindData);
        el.getElementsByTagName('li')[0].textContent.should.equal('a');
        el.getElementsByTagName('li')[0].className.should.equal('bar')
      });

      it('should insert items between any surrounding elements', function(){
        var firstItem = document.createElement('li');
        var lastItem = document.createElement('li');
        firstItem.textContent = 'first';
        lastItem.textContent = 'last';
        list.appendChild(lastItem);
        list.insertBefore(firstItem, listItem);
        listItem.setAttribute('data-text', 'item.name');

        tinybind.bind(el, bindData);

        el.getElementsByTagName('li')[0].textContent.should.equal('first');
        el.getElementsByTagName('li')[1].textContent.should.equal('a');
        el.getElementsByTagName('li')[2].textContent.should.equal('b');
        el.getElementsByTagName('li')[3].textContent.should.equal('last')
      });

      it('should allow binding to the iterated element index', function() {
        listItem.setAttribute('data-index', '$index');
        tinybind.bind(el, bindData);
        el.getElementsByTagName('li')[0].getAttribute('index').should.equal('0');
        el.getElementsByTagName('li')[1].getAttribute('index').should.equal('1')
      });


      it('should allow the developer to configure the index attribute available in the iteration', function() {
        listItem.setAttribute('data-index', 'itemIndex');
        listItem.setAttribute('index-property', 'itemIndex');
        tinybind.bind(el, bindData);
        el.getElementsByTagName('li')[0].getAttribute('index').should.equal('0');
        el.getElementsByTagName('li')[1].getAttribute('index').should.equal('1')
      })
    })
  });

  describe('Updates', function() {
    it('should change the value', function() {
      el.setAttribute('data-text', 'data:foo');
      tinybind.bind(el, bindData);
      data.set({foo: 'some new value'});
      el.textContent.should.equal(data.get('foo'))
    })
  });

  describe('Input', function() {
    it('should update the model value', function() {
      input.setAttribute('data-value', 'data:foo');
      tinybind.bind(input, bindData);
      input.value = 'some new value';
      var event = document.createEvent('HTMLEvents');
      event.initEvent('input', true, true);
      input.dispatchEvent(event);
      data.get('foo').should.equal('some new value');
    });

    it('should allow to change the event listened', function() {
      var event;
      input.setAttribute('data-value', 'data:foo');
      input.setAttribute('event-name', 'blur');
      tinybind.bind(input, bindData);
      input.value = 'some new value';
      event = document.createEvent('HTMLEvents');
      event.initEvent('input', true, true);
      input.dispatchEvent(event);
      data.get('foo').should.equal('bar');

      event = document.createEvent('HTMLEvents');
      event.initEvent('blur', true, true);
      input.dispatchEvent(event);
      data.get('foo').should.equal('some new value');
    })
  })

  describe('Checkbox inputs',function(){
    let multipleCheckboxesInputs = [document.createElement('input'), document.createElement('input')], radioData = { choices: [{value:'Check box 1',checked: true },{value:'Check box 2',checked:false },{value:'Check box 3',checked: true }] }
   
    before(function(){
      multipleCheckboxesInputs.forEach(function(element, index){
        element.type = 'checkbox'
        element.setAttribute('rv-value', 'choices.'+ index +'.value')
        element.setAttribute('rv-checked', 'choices.' + index + '.checked' )
        tinybind.bind(element, radioData)
      })
   })

   it('should have checkbox 1', function(){
      multipleCheckboxesInputs[0].value.should.equal(radioData.choices[0].value)
   })

   it('should equal true', function(){
      multipleCheckboxesInputs[0].checked.should.equal(true)
      multipleCheckboxesInputs[1].checked.should.equal(false)
   })


  })

  describe('Radio buttons', function(done){
    this.timeout(2000)
    let multipleRadioInputs = [document.createElement('input'), document.createElement('input')], radioData = { choice: 'Radio 1', values:['Radio 1', 'Radio 2'], choose: function(e){
        radioData.choice = e.target.value
     }}
     before(function(){
        multipleRadioInputs.forEach(function(element, index){
          element.name = 'radio-test'
          element.type = 'radio'
          element.setAttribute('rv-checked', 'choice')
          element.setAttribute('rv-value', 'values.'+index)
          element.setAttribute("rv-on-click","choose")
          tinybind.bind(element, radioData)
        })
     })

     it('should have Radio 1', function(){
        multipleRadioInputs[0].value.should.equal(radioData.choice)
     })

     it('should equal true', function(){
        multipleRadioInputs[0].checked.should.equal(true)
        multipleRadioInputs[1].checked.should.equal(false)
     })

     it('will change to false', function(done){
        multipleRadioInputs[1].click()
        setTimeout(function(){
          try {
           
          multipleRadioInputs[0].checked.should.equal(false)
          multipleRadioInputs[1].checked.should.equal(true)
          radioData.choice.should.equal('Radio 2')
          done() 
          } catch (error) {
            done(error)
          }
        }, 1990)
     })

     it('should result to false',function(){
        radioData.choice.should.equal('Radio 2')
        multipleRadioInputs[0].checked.should.equal(false)
        multipleRadioInputs[1].checked.should.equal(true)
        radioData.choose({target: { value: 'Radio 1'}})
        multipleRadioInputs[0].checked.should.equal(true)
        multipleRadioInputs[1].checked.should.equal(false)
     })
  })

  describe('Iterated checkbox', function(done){
    this.timeout(2000)
    let checkboxInput = document.createElement('input'), radioData = { choices: [{value:'Check box 1',checked: true },{value:'Check box 2',checked:false },{value:'Check box 3',checked: true }] }, div = document.createElement('div'), checkboxes 
    
    before(function(){
      checkboxInput.type = 'checkbox'
      checkboxInput.setAttribute('rv-value', 'item.value')
      checkboxInput.setAttribute('rv-checked', 'item.checked' )
      div.setAttribute('rv-each-item','choices')
      div.appendChild(checkboxInput)
      document.body.appendChild(div)
      tinybind.bind(div, radioData)
      checkboxes = document.querySelectorAll('div > input[type=checkbox]')
   })

   it('should have value of Checkbox 1 and checked', function(){
      checkboxes[0].value.should.equal(radioData.choices[0].value)
      checkboxes[0].checked.should.equal(true)
   })

   it('should have value of Checkbox 2 and unchecked', function(){
    checkboxes[1].value.should.equal(radioData.choices[1].value)
    checkboxes[1].checked.should.equal(false)
  })

  it('should be checked with a value of Checkbox 2 when checked', function(done){
    let error = '';
    checkboxes[1].click() 
    setTimeout(function(){
      try {
        checkboxes[1].value.should.equal(radioData.choices[1].value)
        checkboxes[1].checked.should.equal(true) 

        done()
      } catch (error) {
        done(error)
      }
    },1990)
  })

  })
});
