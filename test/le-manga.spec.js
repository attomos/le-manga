var LM = require('../lib/le-manga.js');
var assert = require('assert');

describe('When download', function () {
  describe('INUGAMI-SAN TO SARUTOBI-KUN WA NAKA GA WARUI with "volume not available", chapter 1 - 16', function () {
    it('should have 16 chapters in total', function (done) {
      var lm = new LM();
      var url = lm.getMangaUrl('inugami_san_to_sarutobi_kun_wa_naka_ga_warui');
      lm.getMangaData(url, function (err, data) {
        var volume = data[0].volume;
        var startChapter = data[0].startChapter;
        var endChapter = data[0].endChapter;
        if (volume === 'Not Available') {
          assert.equal(startChapter, 1);
          assert.equal(endChapter, 16);
        }
        done();
      });
    });
  });
});
