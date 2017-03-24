define(module, function(exports, require, make) {

  var qp = require('qp-utility');
  var view = require('qp-view/view');
  var controller = require('qp-view/controller');

  make({

    ns: 'qp-view/viewmodel',

    view: null,

    controller: null,

    visible: false,
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

    create_controller: function(name) {
      this.controller = controller.create({ name: name });
    },

    views: function(views) {
      if (this.controller) {
        qp.each(views, this.controller.add_view);
      }
    },

    get_current_view: function() { return this.controller.get_current_view(); },
    toggle_view: function(o) { this.controller.toggle_view(o); },
    swap_view: function(o) { this.controller.swap_view(o); },
    next_view: function(o) { this.controller.next_view(o); },
    back_view: function(o) { this.controller.back_view(o); },
    show_view: function(o) { this.controller.show_view(o); },
    hide_view: function(o) { this.controller.hide_view(o); },

    set_visible: function(visible) {
      this.visible = visible;
      this.draw();
    },

    draw: function(node) {
      this.view.update_view(node);
    },

    read: function(node) {
      this.view.update_model(node);

      // should this return an independant tree?
      // one-way binding but still able to get control values
      // one.5-way binding?
      // manual binding?
      // v-on-blur="handler"
      // v-on-change="handler"
      // sugar for manual binding;
      // v-on-change="path" - if path is a property it sets the property
    },

    // <div v-control="control_1"> ... </div>
    //
    // add value to the object config?
    //
    // GETTERS
    // this.control('control_1')
    // this.control([ 'control_1', 'control_2' ])
    //
    // SETTERS
    // this.control('control_1', { key: value, ... })
    // this.control([ 'control_1', 'control_2' ], { key: value, ... })
    // this.control({ id: 'control_1', key: value, ... })
    // this.control([{ id: 'control_1', key: value, ... }, { id: 'control_2', key: value, ... }])
    control: function(arg0, arg1) {
      if (qp.is(arg0, 'string')) {
        if (qp.is(arg1, 'object')) {

        } else {
          return qp.find(this.controls, { id: arg0 });
        }
      } else if (qp.is(arg0, 'array')) {

      } else if (qp.is(arg0, 'object')) {

      }
    }

  });

});
