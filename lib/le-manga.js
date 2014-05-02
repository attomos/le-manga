var fs = require('fs');
var _ = require('lodash');
var util = require('util');
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
      var match = /(0*)(.+)/.exec(m.volume);
      var volumeInt = match[2];
      return parseInt(m.volume, 10) === parseInt(volumeInt, 10);
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

LM.prototype.getImage = function(url) {
  var self = this;
  request({
    url: url,
    pool: {
      maxSockets: 100
    }
  }, function(err, res, body) {
    $ = cheerio.load(body);
    var imageUri = $('#viewer').children().find('img').first().attr('src');
    var outputFile =  self.output + imageUri.substring(imageUri.lastIndexOf('/'));
    console.log('Downloading ' + imageUri + ' to ' + outputFile);
    request(imageUri).pipe(fs.createWriteStream(outputFile).on('close', function() { }));
  });
};

LM.prototype.startDownload = function(title, volume, chapter) {
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
    _.each(pages, function(p) {
      self.getImage(chapterLink.replace('1.html', p + '.html'));
    });
  });
};

LM.prototype.downloadAllChapters = function() {
  console.log(this.getVolumeRange());
};

module.exports = LM;
