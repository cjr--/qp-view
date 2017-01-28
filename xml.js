// https://github.com/vkiryukhin/pretty-data
// http://www.eslinstructor.net/pretty-data/
//
// MIT License
//
// Copyright (c) 2012 Vadim Kiryukhin ( vkiryukhin @ gmail.com )
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

define(module, function(exports, require) {

  exports({

    ns: 'qp-view/xml',

    format: function(text, options) {
      options = options || {};
      var indent = options.indent || '  ';
      var offset = options.offset || '';
      var shift = ['\n' + offset];
      var comment = false;
      var depth = 0;
      var xml = '';

      for (var i = 0, l = 100; i < l; i++) { shift.push(shift[i] + indent); }

      var chunks = text
        .replace(/>\s{0,}</g, '><')
        .replace(/</g, '~::~<')
        .replace(/xmlns\:/g, '~::~xmlns:')
        .replace(/xmlns\=/g, '~::~xmlns=')
        .split('~::~');

      for (var i = 0, l = chunks.length; i < l; i++) {

        // start comment or <![CDATA[...]]> or <!DOCTYPE //
        if (chunks[i].search(/<!/) > -1) {
          xml += shift[depth] + chunks[i];
          comment = true;
          // end comment  or <![CDATA[...]]> //
          if (chunks[i].search(/-->/) > -1 || chunks[i].search(/\]>/) > -1 || chunks[i].search(/!DOCTYPE/) > -1 ) {
            comment = false;
          }

        // end comment  or <![CDATA[...]]> //
        } else if (chunks[i].search(/-->/) > -1 || chunks[i].search(/\]>/) > -1) {
          xml += chunks[i];
          comment = false;

        // <elm></elm> //
        } else if (/^<\w/.exec(chunks[i - 1]) && /^<\/\w/.exec(chunks[i]) && /^<[\w:\-\.\,]+/.exec(chunks[i - 1]) == /^<\/[\w:\-\.\,]+/.exec(chunks[i])[0].replace('/', '')) {
          xml += chunks[i];
          if (!comment) depth--;

        // <elm> //
        } else if (chunks[i].search(/<\w/) > -1 && chunks[i].search(/<\//) == -1 && chunks[i].search(/\/>/) == -1 ) {
          xml = !comment ? xml += shift[depth++] + chunks[i] : xml += chunks[i];

        // <elm>...</elm> //
        } else if (chunks[i].search(/<\w/) > -1 && chunks[i].search(/<\//) > -1) {
          xml = !comment ? xml += shift[depth] + chunks[i] : xml += chunks[i];

        // </elm> //
        } else if (chunks[i].search(/<\//) > -1) {
          xml = !comment ? xml += shift[--depth] + chunks[i] : xml += chunks[i];

        // <elm/> //
        } else if (chunks[i].search(/\/>/) > -1 ) {
          xml = !comment ? xml += shift[depth] + chunks[i] : xml += chunks[i];

        // <? xml ... ?> //
        } else if (chunks[i].search(/<\?/) > -1) {
          xml += shift[depth] + chunks[i];

        // xmlns //
        } else if (chunks[i].search(/xmlns\:/) > -1 || chunks[i].search(/xmlns\=/) > -1) {
          xml += shift[depth] + chunks[i];

        } else {
          xml += chunks[i];
        }
      }
      return (xml[0] == '\n') ? xml.slice(1) : xml;
    },

    minify: function(text, preserve_comments) {
      if (!preserve_comments) {
        text = text.replace(/\<![ \r\n\t]*(--([^\-]|[\r\n]|-[^\-])*--[ \r\n\t]*)\>/g, '');
      }
  	  return text.replace(/>\s{0,}</g, '><');
    }

  });

});
