define(module, function(exports, require, make) {

  var qp = require('qp-utility');
  var view = require('qp-view/view');
  var controller = require('qp-view/controller');

  make({

    ns: 'qp-view/viewmodel',

    view: null,
    controller: null,
    visible: false,
    hidden: true,
    item_key: '',
    list_key: '',
    controls: [],

    init: function(o) {
      o = qp.options(o, { auto: true, bind: true, draw: true });
      this.view = view.create({
        model: this,
        element: o.el || o.element,
        auto: o.auto,
        bind: o.bind,
        update_view: o.draw
      });
    },

    setup: function() { },

    load: function(data, done) { done(); },
    get_data: function(done) { },
    show: function() { },
    ready: function() { },
    requery: function(done) { this.get_data(done); },
    hide: function() { },
    unload: function() { },
    reset: function() { },

    view_controller: function(o) {
      this.controller = controller.create(o.controller);
      if (this.controller) {
        qp.each(o.views, this.controller.add_view);
      }
    },

    next: function(o) { this.controller.next_view(o); },
    back: function(o) { this.controller.back_view(o); },

    set_visible: function(visible) {
      this.visible = visible;
      this.draw();
    },

    set_hidden: function(hidden) {
      this.hidden = hidden;
      this.draw();
    },

    draw: function(node) {
      this.view.update_view(node);
    },

    read: function(node) {
      this.view.update_model(node);
    },

    set_data: function(data, done) {
      qp.merge(this, data);
      this.draw();
      qp.invoke_next(done);
    }

  });

});
