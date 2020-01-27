exports.create = page => new DeckPlus(page);

class DeckPlus {

  constructor(page) {
    this.page = page;
  }

  getName() {
    return 'DeckPlus';
  }

  async isActive() {
    let active = await this.page.evaluate(_ => typeof $ === 'function' && typeof $.deck === 'function'
                                          && $('.use-deckplus, .print, .no-print, .print-png').size() > 0);
    if (!active) return active;
    var res = await this.page.evaluate(function() {
      var $ = window.jQuery
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
    });
    this.slideIndices = res[0];
    this.rasterIndices = res[1]; // ignored
    this.i = 0; // index in slideIndices
    this.nextSlide();
    return active;
  }

  slideCount() {
    return this.slideIndices.length;
  }

  nextSlide() {
    let to = this.slideIndices[this.i];
    this.i += 1;
    return this.page.evaluate(to => $.deck('go', to), to);
  }

  currentSlideIndex() {
    return this.page.evaluate(_ => $.deck('getSlide').attr('id'));
  }

}
