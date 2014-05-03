var fs = require('fs');
var _ = require('lodash');
var util = require('util');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');


var LM = function(title) {
  this.manga = {};
  this.title = title;
  this.volumes = [];
  this.volume = {};
  this.chapters = [];
  this.chapter = '';
  this.output = '';
};

LM.prototype.getBaseUrl = function(url) {
  var urlScheme = '://';
  var appendProtocal = url.indexOf(urlScheme) == -1;
  if (appendProtocal) {
    return 'http://' + url.split('/')[0];
  }
  var splittedUrl = url.split(urlScheme);
  var protocol = splittedUrl.shift();
  return protocol + urlScheme + splittedUrl[0].split('/')[0];
};

LM.prototype.getChapterRange = function(selectedVolume) {
  this.volume = _.find(this.manga, function(m) {
    if (!isNaN(parseFloat(selectedVolume)) && isFinite(selectedVolume)) {
      return parseInt(m.volume, 10) === parseInt(selectedVolume, 10);
    } else {
      return m.volume === selectedVolume;
    }
  });
  return _.range(parseInt(this.volume.startChapter, 10), parseInt(this.volume.endChapter, 10) + 1);
};

LM.prototype.getSafeTitle = function(title) {
  return title.split(' ').join('_').toLowerCase();
};

LM.prototype.getMangaUrl = function(title) {
  return util.format('http://mangafox.me/manga/%s/', this.getSafeTitle(title));
};

LM.prototype.extractVolumeData = function(text) {
  var match = /Volume (\w+) Chapter (\d+) - (\d+)/.exec(text);
  return {
    volume:       match[1],
    startChapter: match[2],
    endChapter:   match[3]
  };
};

LM.prototype.getMangaData = function(url, cb) {
  var metaData = [];
  var self = this;
  request(url, function(err, res, body) {
    $ = cheerio.load(body);
    $('h3.volume').each(function(i, elem) {
      metaData.push(self.extractVolumeData($(this).text()));
    });
    cb(null, metaData);
  });
};

LM.prototype.getVolumeRange = function() {
  return  _.sortBy(_.pluck(this.manga, 'volume'), function(vol) { return vol; });
};

LM.prototype.getImage = function(url, chapter, callback) {
  var self = this;
  request({
    url: url,
    pool: {
      maxSockets: 100
    }
  }, function(err, res, body) {
    $ = cheerio.load(body);
    var imgUri = $('#viewer').children().find('img').first().attr('src');
    var outputFile = util.format('./%s/%s/%s', self.output, self.volume.volume,
                                 chapter) + imgUri.substring(imgUri.lastIndexOf('/'));
    console.log('Downloading ' + imgUri);
    request(imgUri).pipe(fs.createWriteStream(outputFile).on('close', function() {
      callback();
    }));
  });
};

LM.prototype.startDownload = function(title, volume, chapter, callback) {
  var self = this;
  var chapterLink = util.format('http://mangafox.me/manga/%s/v%s/c%s/1.html',
      this.getSafeTitle(title), volume.volume, chapter);
  request(chapterLink, function(err, res, body) {
    if (err || res.statusCode !== 200) {
      console.log('Unable to download Manga from %s', chapterLink);
      console.log('Status code: ', res.statusCode);
      process.exit(1);
    }
    $ = cheerio.load(body);
    var pages = Object.keys($('select.m').first().children());
    pages = _.reject(pages, function(p) {
      return isNaN(p) || p === '0';
    });

    async.eachLimit(pages, 4, function(page, cb) {
      self.getImage(chapterLink.replace('1.html', page + '.html'), chapter, function() {
        cb();
      });
    });
    callback();

  });
};

LM.prototype.downloadAllChapters = function() {
  var self = this;
  async.eachSeries(self.chapters, function(chapter, callback) {
    self.startDownload(self.title, self.volume, chapter, callback);
  }, function(err) {
    if (err) {
      console.log('An error occurred.');
    }
  });
};

module.exports = LM;
