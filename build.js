var path = require('path');
var fs = require('fs');
var uglify = require('uglify-js');
var qp = require('qp-utility');

var files = [ 'view.js', 'controller.js', 'model.js', 'viewmodel.js' ];

write_file('index.js', read_file('builder.js'));
write_file('qp-view.js', join_files(files));
write_file('qp-view.min.js', make_min_file('qp-view.js'));

function make_min_file(filename) {
  var min = uglify.minify(path.join('dist', filename), { compress: { dead_code: false, unused: false } });
  return min.code;
}

function join_files(files) {
  return files.map(read_file).join('\n');
}

function read_file(file) {
  var filename = path.join(__dirname, 'src', file)
  return fs.readFileSync(filename, 'utf8');
}

function write_file(file, data) {
  var filename = path.join(__dirname, 'dist', file);
  fs.writeFileSync(filename, data);
}
