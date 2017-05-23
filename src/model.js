define(module, function(exports, require, make) {

  var qp = require('qp-utility');

  make({

    ns: 'Model',

    data: null,
    schema: null,

    observers: [],

    init: function(o) {
      Object.defineProperty(this, 'data', { enumerable: false });

      qp.each(this.schema.columns, function(field) {
        var key = field.name;
        Object.defineProperty(this, key, {
          enumerable: true,
          get: function() { return this.get(key); },
          set: function(value) { return this.set(key, value); }
        });
      }.bind(this));
    },

    observe: function(key) {

    },

    get: function(key) { return this.data[key]; },

    set: function(key, v1) {
      var v0 = this.data[key];
      this.data[key] = v1;
      this.property_change(key, v0, v1);
    },

    property_change: function(key, v0, v1) {

    }

  });

});
