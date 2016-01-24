var LM = require('../lib/le-manga.js');
var assert = require('assert');

describe('LM', function () {
  var lm;
  beforeEach(function () {
    lm = new LM();
  });

  describe('getBaseUrl', function () {
    it('should return correct base URL when the URL is correct', function () {
      var expected = 'http://www.mangafox.me';
      var actual = lm.getBaseUrl('http://www.mangafox.me');
      assert.equal(actual, expected);
    });

    it('should return correct base URL when tghe URL has no protocol', function () {
      var expected = 'http://www.mangafox.me';
      var actual = lm.getBaseUrl('www.mangafox.me');
      assert.equal(actual, expected);
    });

    it('should return empty string when called with empty string', function () {
      var expected = '';
      var actual = lm.getBaseUrl('');
      assert.equal(actual, expected);
    });
  });

  xdescribe('getChapterRange', function () {
  });

  describe('getSafeTitle', function () {
    it('should return snake case string', function () {
      var expected = 'some_random_manga';
      var actual = lm.getSafeTitle('Some Random MANGA');
      assert.equal(actual, expected);
    });

    xit('should strip out exclaimation marks, punctuations, and alike', function () {
    });
  });

  describe('getMangaUrl', function () {
  });

  describe('extractVolumeData', function () {
  });

  describe('getmangaData', function () {
  });

  describe('getVolumeRange', function () {
  });
});
