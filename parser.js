define(module, function(exports, require) {

  var path = require('path');
  var parse5 = require('parse5');
  var qp = require('qp-utility');
  var fss = require('qp-library/fss');
  var log = require('qp-library/log');

  exports({

    ns: 'qp-view/parser',

    parse: function(s, content) {
      if (s.lastIndexOf('<!DOCTYPE html>', 0) === 0) {
        return parse5.parse(s);
      } else {
        var node = parse5.parseFragment(s);
        return content ? node.childNodes[0] : node;
      }
    },

    parse_file: function(filename, content) {
      return this.parse(fss.read(filename), content);
    },

    serialize: function(node) {
      return parse5.serialize(node);
    },

    create: function() {
      return parse5.parseFragment('');
    },

    create_node: function(name, attributes) {
      attributes = attributes || [];
      if (qp.is(attributes, 'object')) {
        attributes = Object.keys(attributes).map(function(key) {
          return { name: key, value: attributes[key] };
        });
      }
      return {
        nodeName: name,
        tagName: name,
        attrs: attributes,
        childNodes: []
      };
    },

    create_text_node: function(text) {
      return {
        nodeName: '#text',
        value: text
      };
    },

    append_child: function(parent_node, node, depth) {
      node.parentNode = parent_node;
      if (depth) parent_node.childNodes.push(this.create_text_node('\n' + qp.repeat('  ', depth)));
      parent_node.childNodes.push(node);
      return node;
    },

    append_first_child: function(parent_node, node) {
      node.parentNode = parent_node;
      parent_node.childNodes.unshift(node);
      return node;
    },

    remove_child: function(node) {
      var children = node.parentNode.childNodes;
      var index = children.indexOf(node);
      if (index !== -1) {
        children.splice(index, 1);
        return node;
      }
      return null;
    },

    replace_child: function(old_node, new_node) {
      var children = old_node.parentNode.childNodes;
      var index = children.indexOf(old_node);
      if (index !== -1) {
        new_node.parentNode = old_node.parentNode;
        children.splice(index, 1, new_node);
        return old_node;
      }
      return null;
    },

    has_attributes: function(node) {
      return node.attrs && node.attrs.length;
    },

    has_attribute: function(node, key) {
      var attributes = node.attrs;
      if (attributes) {
        for (var i = 0, l = attributes.length; i < l; i++) {
          if (attributes[i].name === key) return true;
        }
      }
      return false;
    },

    get_attribute: function(node, key) {
      var attributes = node.attrs;
      if (attributes) {
        for (var i = 0, l = attributes.length; i < l; i++) {
          var attribute = attributes[i];
          if (attribute.name === key) return attribute.value;
        }
      }
      return null;
    },

    get_attributes: function(node) {
      var o = { };
      var attributes = node.attrs;
      if (attributes) {
        for (var i = 0, l = attributes.length; i < l; i++) {
          var attribute = attributes[i];
          o[attribute.name] = attribute.value;
        }
      }
      return o;
    },

    set_attribute: function(node, key, value) {
      var attributes = node.attrs = node.attrs || [];
      var attribute = null;
      for (var i = 0, l = attributes.length; i < l; i++) {
        if (attributes[i].name === key) {
          attribute = attributes[i];
          attribute.value = value;
          break;
        }
      }
      if (!attribute) {
        attribute = { name: key, value: value };
        attributes.push(attribute);
      }
      return attribute;
    },

    set_attributes: function(node, o) {
      o = o || {};
      var attributes = node.attrs = [];
      Object.keys(o).forEach(function(key) {
        attributes.push({ name: key, value: o[key] });
      });
      return o;
    },

    remove_attribute: function(node, key) {
      var attributes = node.attrs;
      if (attributes) {
        for (var i = 0, l = attributes.length; i < l; i++) {
          var attribute = attributes[i];
          if (attribute.name === key) {
            attributes.splice(i, 1);
            return attribute;
          }
        }
      }
      return null;
    },

    log_node: function(node, text_nodes, depth) {
      depth = depth || 0;
      if (node.nodeName !== '#text') {
        var attributes = qp.join(qp.map(node.attrs, attr => attr.name + ': ' + attr.value), ', ');
        log(qp.repeat(' ', depth), node.nodeName, '[', attributes, ']');
      } else if (text_nodes && node.nodeName === '#text') {
        log(qp.repeat(' ', depth), node.nodeName, '\'', node.childNodes ? node.childNodes[0].value : '', '\'');
      }
      qp.each(node.childNodes, child_node => this.log_node(child_node, text_nodes, depth + 1));
    }

  });

});
