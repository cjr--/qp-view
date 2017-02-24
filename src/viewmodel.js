define(module, function(exports, require, make) {

  var qp = require('qp-utility');
  var view = require('qp-view/view');

  make({

    ns: 'qp-view/viewmodel',

    view: null,

    visible: false,

    controls: [],

    init: function(o) {
      o = qp.options(o, { bind: true, draw: true });
      this.view = view.create({
        model: this,
        element: o.el || o.element,
        bind: o.bind,
        update_view: o.draw
      });
    },

    set_visible: function(visible) {
      if (this.visible !== visible) {
        this.visible = visible;
        this.draw();
      }
    },

    show: function() {
      this.visible = true;
      this.draw();
    },

    hide: function() {
      this.visible = false;
      this.draw();
    },

    draw: function(node) {
      this.view.update_view(node);
    },

    read: function(node) {
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
