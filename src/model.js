define(module, function(exports, require, make) {

  var qp = require('qp-utility');

  make({

    ns: 'Model',

    set_members: function(o) {
      qp.each_own(o, function(v, k) { this.set_member(k, v); }.bind(this));
    },

    set_member: function(key, o) {
      if (o) {
        this[key] = o;
        this[key + '_id'] = o.id;
      }
    }

  });

});
