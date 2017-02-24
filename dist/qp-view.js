define(module, function(exports, require, make) {

  var qp = require('qp-utility');

  make({

    ns: 'qp-view/view',

    model: null,
    node: null,

    init: function(o) {
      this.model = o.model;
      this.node = {
        element: qp.element(o.el || o.element),
        bindings: []
      };
      if (o.auto || o.bind) this.bind();
      if (o.auto || (o.bind && o.update_view)) this.update_view();
    },

    bind: function() {
      this.parse(this.node);
    },

    update_view: function(node_name) {
      this.sync('view', this.node, this.model, node_name);
    },

    update_model: function(node_name) {
      this.sync('model', this.node, this.model, node_name);
    },

    sync: function(target, node, model, node_name) {
      if (!node_name || node.name === node_name) {
        node_name = null;
        qp.each(node.bindings, function(binding) {
          binding['update_' + target].call(this, model);
        }, this);
      }
      qp.each(node.children, function(child_node, index) {
        if (node.each) {
          var binder = qp.find(node.bindings, { name: 'each' });
          model[binder.item_name] = model[binder.path][index];
        }
        this.sync(target, child_node, model, node_name);
        if (node.each) qp.delete(model, binder.item_name);
      }, this);
    },

    parse: function(node) {
      this.parse_node(node);
      if (node.element.parentNode) {
        node.children = qp.select(qp.to_array(node.element.children), function(child_element) {
          if (qp.is_element(child_element)) {
            if (child_element.hasAttribute('v-each')) {
              node.parent = node.element;
              node.element = child_element;
              node.each = true;
              this.parse_node(node);
            } else {
              return this.parse({ element: child_element, bindings: [] });
            }
          }
        }, this);
      }
      return node;
    },

    parse_node: function(node) {
      if (qp.has_attr(node.element, 'v-scope')) {
        node.element.removeAttribute('v-scope');
        return;
      }
      qp.each(qp.get_attributes(node.element), function(attribute) {
        if (attribute.name.slice(0, 2) === 'v-') {
          var binding = this.create_binding(node, attribute);
          node.element.removeAttribute(binding.key);
          if (binding.name === 'node') {
            node.name = binding.path;
          } else if (binding.name === 'if') {
            binding.type = 'if';
          } else if (qp.in(binding.name, 'show', 'hide')) {
            binding.type = 'visible';
            binding.show = binding.name === 'show';
            binding.hide = !binding.show;
          } else if (qp.in(binding.name, 'readonly', 'disabled')) {
            binding.attribute = binding.name;
            binding.boolean = true;
          } else if (binding.name === 'text') {
            binding.property = 'textContent';
          } else if (binding.name === 'html') {
            binding.property = 'innerHTML';
          } else if (binding.name === 'value') {
            binding.property = 'value';
          } else if (binding.name === 'template') {
            binding.type = 'template';
          } else if (binding.name === 'each') {
            var items = binding.path.split(' in ');
            binding.item_name = items[0];
            binding.path = items[1];
            binding.template = node.parent.removeChild(node.element);
            node.element = node.parent;
            delete node.parent;
          } else if (binding.name === 'add-class') {
            binding.type = 'add_class';
          } else if (qp.match(binding.name, 'on-*')) {
            binding.type = 'on';
            binding.event = binding.name.slice(3);
          } else if (qp.match(binding.name, 'class-*')) {
            binding.type = 'class';
            binding.class = binding.name.slice(6);
          } else if (qp.match(binding.name, 'style-*')) {
            binding.type = 'style';
            binding.style = binding.name.slice(6);
          } else {
            binding.attribute = binding.type;
          }

          if (binding.ignore) {
            //
          } else if (binding.property) {
            this.property(binding, node.element);
          } else if (binding.attribute) {
            this.attribute(binding, node.element);
          } else if (binding.name === 'each') {
            this.each(binding, node);
          } else {
            this[binding.type](binding, node.element);
          }
        }
      }.bind(this));
    },

    create_binding: function(node, attribute) {
      var attribute_name = attribute.name.slice(2);
      var binding = {
        key: attribute.name,
        name: attribute_name,
        type: attribute_name,
        path: attribute.value,
        negate: false,
        priority: 99
      };
      if (qp.match(binding.path, 'not *')) {
        binding.path = attribute.value.slice(4);
        binding.negate = true;
      }
      if (qp.match(binding.path, 'app.*')) {
        binding.path = 'global.' + binding.path;
      }
      if (qp.in(binding.type, 'node', 'page')) {
        node.ignore = true;
      } else {
        node.bindings.push(binding);
      }
      return binding;
    },

    if: function(binding, element) {
      binding.priority = 1;
    },

    visible: function(binding, element) {
      binding.update_view = function(model) {
        var toggle = qp.get(model, binding.path);
        if ((binding.show && toggle) || (binding.hide && !toggle)) {
          qp.show(element);
        } else {
          qp.hide(element);
        }
      };
      binding.update_model = function(model) {
        qp.set(model, binding.path, (element.style.display === 'block' && binding.show));
      };
    },

    class: function(binding, element) {
      binding.update_view = function(model) {
        if (qp.get(model, binding.path)) {
          qp.add_class(element, binding.class);
        } else {
          qp.remove_class(element, binding.class);
        }
      };
      binding.update_model = function(model) {
        qp.set(model, binding.path, qp.has_class(element));
      };
    },

    style: function(binding, element) {
      binding.update_view = function(model) {
        qp.set_style(element, binding.style, qp.get(model, binding.path));
      };
      binding.update_model = function(model) {
        qp.set(model, binding.path, qp.get_style(element, binding.style));
      };
    },

    template: function(binding, element) {
      binding.update_view = function(model) {
        element.textContent = qp.format(binding.path, model);
      };
      binding.update_model = function(model) { };
    },

    property: function(binding, element) {
      binding.update_view = function(model) {
        element[binding.property] = qp.get(model, binding.path);
      };
      binding.update_model = function(model) {
        qp.set(model, binding.path, element[binding.property]);
      };
    },

    attribute: function(binding, element) {
      if (binding.boolean) {
        binding.update_view = function(model) {
          if (qp.get(model, binding.path)) {
            element.setAttribute(binding.attribute);
          } else {
            element.removeAttribute(binding.attribute);
          }
        };
        binding.update_model = function(model) {
          qp.set(model, binding.path, element.hasAttribute(binding.attribute));
        };
      } else {
        binding.update_view = function(model) {
          element.setAttribute(binding.attribute, qp.get(model, binding.path));
        };
        binding.update_model = function(model) {
          qp.set(model, binding.path, element.getAttribute(binding.attribute));
        };
      }
    },

    on: function(binding, element) {
      binding.update_view = function(model) {
        if (!binding.bound) {
          binding.event_listener = function(e) {
            qp.nodefault(e);
            var id = element.getAttribute('data-id');
            if (!id) {
              id = qp.parents_until(e.target, element,
                function(el) { return el.getAttribute('data-id'); }
              );
            }
            qp.get(model, binding.path).call(model, Number(id));
          };
          qp.on(element, binding.event, binding.event_listener);
          binding.bound = true;
        }
      };
      binding.update_model = function(model) { };
    },

    each: function(binding, node) {
      var list_element = node.element;
      binding.update_view = function(model) {
        list_element.innerHTML = '';
        node.children = qp.map(qp.get(model, binding.path), function(item) {
          var item_element = binding.template.cloneNode(true);
          item_element.setAttribute('data-id', item.id);
          list_element.appendChild(item_element);
          return this.parse({ element: item_element, bindings: [] });
        }, this);
      };
      binding.update_model = function(model) { };
    }

  });

});

define(module, function(exports, require, make) {

  var qp = require('qp-utility');
  var view = require('qp-view/view');

  make({

    ns: 'qp-view/viewmodel',

    view: null,

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
