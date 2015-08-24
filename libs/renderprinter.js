'use strict';
var fs = require('fs');

function RenderPrinter() {
};

function padIt(number) {
    if (number<=999999) { number = ('00000'+number).slice(-6); }
    return number;
};

RenderPrinter.prototype.begin = function() {
    this.i = 0;
    this.allPdfs = [];
    fs.makeDirectory(',,temp-slides');
};

RenderPrinter.prototype.printPage = function(page) {
    var base = ",,temp-slides/output-" + padIt(this.i);
    this.i += 1;
    var pdf = base + '.pdf';
    if (page.deckplusRasterized) {
        var png = base + '.png';
        page.render(png);
        this._cmd('convert '+png+' '+pdf);
    } else {
        page.render(pdf);
    }
    this.allPdfs.push(pdf);
};

RenderPrinter.prototype._cmd = function(what) {
    console.log('\nDO: '+what);
}

RenderPrinter.prototype.end = function() {
    this._cmd('pdftk '+ this.allPdfs.concat(['cat', 'output', this.outputFileName]).join(' '));
};

module.exports = new RenderPrinter();

