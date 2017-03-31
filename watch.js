require('qp-define');

define(module, function(exports, require) {

  var path = require('path');
  var cp = require('child_process');
  var watch = require('node-watch');
  var qp = require('qp-utility');
  var log = require('qp-library/log');
  var exit = require('qp-library/exit');
  var term = require('qp-library/term');

  term.set_title('build @ qp-view');
  term.keypress((key) => {
    if (key === 'b') build();
    else if (key === 'esc') exit_process();
  });
  log.clear();
  log(log.blue_white(' qp-view '));

  var watcher = watch(path.join(process.cwd(), 'src'), { recursive: true }, (type, file) => {
    file = file || type;
    if (/\.(js|css)$/.test(file)) {
      log(qp.after(file, __dirname));
      build();
    }
  });

  function build() {
    cp.execFile('node', ['build'], () => {
      log('build @ ' + qp.now('utc'));
    });
  }

  function exit_process() {
    watcher.close();
    process.exit(0);
  }

});
