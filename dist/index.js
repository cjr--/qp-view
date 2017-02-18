define(module, function(exports, require, make) {

  var path = require('path');
  var glob = require('glob');
  var qp = require('qp-utility');
  var fss = require('qp-library/fss');
  var log = require('qp-library/log');
  var parser = require('qp-view/src/parser');

  make({

    ns: 'qp-view/builder',

    root_directory: '',

    node: null,
    token: '',

    html: '',
    file_list: [],

    init: function(options) {
      this.root_directory = options.root || process.cwd();
      this.node = this.parse_file(options.file);
      this.token = this.tokenize(this.node);
      this.parse_node(this.token, this.node);
      this.html = parser.serialize(this.node, { format: true, offset: '  ' });
    },

    parse_file: function(filename) {
      if (fss.exists(filename)) {
        return parser.parse_file(filename, true);
      }
    },

    parse_node: function(token, node) {
      qp.each(node.childNodes, (child_node) => {
        var child_token = this.tokenize(child_node);
        if (child_token) {
          var new_node = this.parse_file(child_token.filename);
          if (new_node) {
            qp.each(glob.sync(child_token.pattern), (file) => {
              if (qp.not_in(file, this.file_list)) this.file_list.push(file);
            });
            parser.set_class_list(new_node, parser.get_class_list(child_node));
            child_token = this.tokenize(new_node) || child_token;
            parser.replace_child(child_node, new_node);
          }
          qp.push(token.children, child_token);
          this.parse_node(child_token, new_node || child_node);
        } else {
          this.parse_node(token, child_node);
        }
      });
    },

    tokenize: function(node) {
      var token = { children: [] };
      var attributes = parser.get_attributes(node);
      if (attributes['v-page']) {
        token.type = 'page';
        token.page = attributes['v-page'];
        token.title = attributes['v-title'];
        token.dir = path.join(token.type, token.page);
        parser.remove_attributes(node, 'v-title');
      } else if (attributes['v-view']) {
        token.type = 'view';
      } else if (attributes['v-component']) {
        token.type = 'component';
      } else {
        return null;
      }
      token[token.type] = true;
      token.class = attributes.class || '';
      token.path = path.join(this.root_directory, token.dir || token.type, attributes['v-' + token.type]);
      token.filename = path.join(token.path, path.basename(token.path) + '.html');
      if (token.view || token.component) {
        token.pattern = path.join(token.path, path.basename(token.path)) + '.+(js|css)';
      }
      return token;
    }

  });

});
