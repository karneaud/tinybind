describe("tinybind.formatters", function() {
  describe("watch", function() {
    // phantomjs fails but firefox and ie runs fine
    it.skip("recomputes binding when an path argument changes", function() {
      var model = {
        value: 'xxx',
        dependency: 'yyy'
      }
      var readCount = 0;      
      var el = document.createElement('div');
      el.setAttribute('rv-text', 'value | countRead | watch dependency');
      tinybind.bind(el, model, {
        formatters: { 
          countRead: function () {
            return ++readCount;
          }
        }
      });
      el.innerText.should.equal('1');
      model.dependency = 'aaa';
      el.innerText.should.equal('2');
    });
  }); 
});
