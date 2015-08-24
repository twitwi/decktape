function DeckPlus(page) {
    this.page = page;
    this._initIfActive(page);
}

DeckPlus.prototype = {

    getName: function () {
        return "Deck JS (+ print classes)";

        // This plugin handles more advanced deck.js printing specialized for handout:
        // - only print toplevel slides (no incremental) unless they have the 'print' class
        // - do not print slides with the 'no-print' class
        // - print a raster versions of slides with the 'print-png' class (to be done)
    },

    isActive: function () {
        return this.page.evaluate(function () {
            return typeof $ === "function" && typeof $.deck === "function"
                && $('.use-deckplus, .print, .no-print, .print-png').size() > 0;
        });
    },

    _initIfActive: function (page) {
        if (!this.isActive()) return;
        var res = this.page.evaluate(function(superSampling) {
            var unjquery = function(o) { return o.get(0); };
            var allSlides = $.deck('getSlides').map(unjquery);
            var topLevelSlides = $.deck('getTopLevelSlides').map(unjquery);
            var indices = Array();
            var pngs = Array();
            for (k in topLevelSlides) {
                var s = topLevelSlides[k];
                var i = allSlides.indexOf(s);
                var nested = $.deck('getNestedSlides', i).map(unjquery);
                $(".print:not(.slide)", $(s)).each(function() {
                    var inWhat = allSlides.indexOf(s);
                    indices.push("[[[WARNING '.print:not(.slide)' in "+inWhat+"]]]");
                    indices.push(inWhat);
                });
                $(nested).filter(".print").each(function() {
                    indices.push(allSlides.indexOf(this));
                });
                if (! $(s).hasClass('no-print') && ! $(s).hasClass('q')) {
                    var what = nested.length == 0 ? s : nested[nested.length -1];
                    indices.push(allSlides.indexOf(what));
                    if ($(s).hasClass('print-png')) {
                        pngs.push(allSlides.indexOf(what));
                    }
                }
            }
            //return [indices, indices];
            return [indices, pngs];
        }, 1);
        this.slideIndices = res[0];
        this.rasterIndices = res[1];
        this.i = 0; // index in slideIndices
        this.nextSlide();
    },

    slideCount: function () {
        return this.slideIndices.length;
    },

    nextSlide: function () {
        if (this.rasterIndices.indexOf(this.i) != -1) {
            // this slide should be printed rasterized
            // we use 'page' to communicate with the printer
            this.page.deckplusRasterized = true;
        } else {
            this.page.deckplusRasterized = false;
        }
        this.page.evaluate(function(to) {
            $.deck('go', to);
	}, this.slideIndices[this.i]);
        this.i += 1;
    },

    currentSlideIndex: function () {
        return this.page.evaluate(function () {
	    var $ = window.jQuery;
            return $.deck("getSlide").attr("id");
        });
    }
};

exports.create = function (page) {
    return new DeckPlus(page);
};
exports.priority = 10; // default is 0, and we want to be before plain deck.js
