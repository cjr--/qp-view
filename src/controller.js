define(module, function(exports, require, make) {

  var qp = require('qp-utility');
  var store = require('qp-utility/store');

  make({

    ns: 'qp-view/controller',

    name: 'controller',

    views: [],

    history: [],

    init: function(o) {
      this.store = store.create({ key: 'help.littleacorns', ctx: o.state_context });
    },

    add_view: function(o) {
      this.views.push({ key: o.key, ctor: o.ctor, el: o.el });
      if (o.auto) {
        var next_view = qp.find(this.views, { key: o.key });
        if (next_view) {
          this.history.push(next_view);
          this.show_view(o);
        }
      }
    },

    toggle_view: function(o) {
      var view = qp.find(this.views, { key: o.key });
      if (view) {
        if (view.instance && view.instance.visible) {
          this.hide_view(o);
        } else {
          this.show_view(o);
        }
      }
    },

    next_view: function(o) {
      var last_view = this.history[this.history.length - 1];
      if (last_view) {
        this.hide_view({ key: last_view.key });
      }
      var next_view = qp.find(this.views, { key: o.key });
      if (next_view) {
        this.history.push(next_view);
        this.show_view(o);
      }
    },

    get_current_view: function() {
      var current_view = this.history[this.history.length - 1];
      if (current_view) {
        if (current_view.instance.controller === this) {
          return current_view.instance;
        } else {
          return current_view.instance.controller.get_current_view();
        }
      }
    },

    back_view: function(o) {
      var current_view = this.history[this.history.length - 1];
      if (current_view) {
        if (current_view.instance.controller === this) {
          if (this.history.length === 1) return;
          this.history.pop();
          this.hide_view({ key: current_view.key });
        } else {
          current_view.instance.controller.back_view(o);
          return;
        }
      }
      var previous_view = this.history[this.history.length - 1];
      if (previous_view) {
        this.show_view({ key: previous_view.key });
      }
    },

    swap_view: function(o) {
      var current_view = this.history.pop();
      if (current_view) {
        this.hide_view({ key: current_view.key });
      }
      var next_view = qp.find(this.views, { key: o.key });
      if (next_view) {
        this.history.push(next_view);
        this.show_view(o);
      }
    },

    show_view: function(o) {
      var view = qp.find(this.views, { key: o.key });
      if (view) {
        view.instance || (view.instance = view.ctor.create({ el: view.el, controller: this }));
        view.instance.load(o, function load_complete() {
          view.instance.show();
          view.instance.set_visible(true);
          view.instance.ready();
          if (o.done) o.done();
        }.bind(this));
      }
    },

    hide_view: function(o) {
      var view = qp.find(this.views, { key: o.key });
      if (view) {
        view.instance.hide();
        view.instance.set_visible(false);
        view.instance.unload();
        if (o.done) o.done();
      }
    }

  });

});
