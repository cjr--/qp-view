define(module, function(exports, require, make) {

  var qp = require('qp-utility');
  var view = require('qp-view/view');

  make({

    ns: 'qp-view/viewmodel',

    view: null,

    init: function(o) {
      o = qp.options(o, { bind: true, draw: true });
      this.view = view.create({
        model: this,
        element: o.el || o.element,
        bind: o.bind,
        update_view: o.draw
      });
    },

    draw: function(node) {
      this.view.update_view(node);
    },

    read: function(node) {

    }

  });

});
