#!/usr/bin/env node
var fs = require('fs');
var _ = require('lodash');
var util = require('util');
var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var manga = {};
var title = '';
var volumes = [];
var volume = {};
var chapters = [];
var chapter = '';

function getBaseUrl(url) {
  var urlScheme = '://';
  var appendProtocal = url.indexOf(urlScheme) == -1;
  if (appendProtocal) {
    return 'http://' + url.split('/')[0];
  }
  var splittedUrl = url.split(urlScheme);
  var protocol = splittedUrl.shift();
  return protocol + urlScheme + splittedUrl[0].split('/')[0];
}

function getChapters(start, end) {
  return _.range(parseInt(start, 10), parseInt(end, 10) + 1);
}

String.prototype.join = function(str) {
  return this.split(' ').join(str);
};

function formatTitle(title) {
  return title.join('_').toLowerCase();
}

function getMangaUrl(title) {
  return util.format('http://mangafox.me/manga/%s/', formatTitle(title));
}

function extractVolumeData(text) {
  var match = /Volume (\w+) Chapter (\d+) - (\d+)/.exec(text);
  return {
    volume:       match[1],
    volumeInt:    parseInt(match[1], 10),
    startChapter: match[2],
    endChapter:   match[3]
  };
}

function getMangaData(url, cb) {
  var metaData = [];
  request(url, function(err, res, body) {
    $ = cheerio.load(body);
    $('h3.volume').each(function(i, elem) {
      metaData.push(extractVolumeData($(this).text()));
    });
    cb(null, metaData);
  });
}

function getImage(url) {
  request({
    uri: url,
    pool: {
      maxSockets: 100
    }
  }, function(err, res, body) {
    $ = cheerio.load(body);
    var imageUri = $('#viewer').children().find('img').first().attr('src');
    console.log(imageUri);
    console.log(imageUri.substring(imageUri.lastIndexOf('/')));
    request(imageUri).pipe(fs.createWriteStream('output' + imageUri.substring(imageUri.lastIndexOf('/'))).on('close', function() { }));
  });
}

async.series([
  function(cb) {
    rl.question('What manga would you like to download? ', function(answer) {
      title = answer;
      getMangaData(getMangaUrl(title), function(err, data) {
        if (data.length > 0) {
          manga = data;
          volumes = _.sortBy(_.pluck(data, 'volume'), function(vol) { return vol; });
          cb(null, title);
        } else {
          cb('Cannot find ' + title, null);
        }
      });
    });
  },
  function(cb) {
    rl.question(util.format('Which volume %d - %d ?',
        volumes[0], volumes[volumes.length - 1]), function(answer) {
      volume = _.find(manga, { volumeInt: parseInt(answer, 10) });
      chapters = getChapters(volume.startChapter, volume.endChapter);
      cb(null, volume);
    });
  },
  function(cb) {
    rl.question(util.format('Which chapter %d - %d ?',
          chapters[0], chapters[chapters.length - 1]), function(answer) {
      chapter = answer;
      cb(null, chapter);
    });
  }
], function(err, data) {
    if (err) {
      console.log(err);
    } else {
      rl.close();
      console.log(data);
      var chapterLink = util.format('http://mangafox.me/manga/%s/v%s/c%s/1.html',
          formatTitle(title), volume.volume, chapter);
      request(chapterLink, function(err, res, body) {
        $ = cheerio.load(body);
        var pages = Object.keys($('select.m').first().children());
        pages = _.reject(pages, function(p) {
          return isNaN(p) || p === '0';
        });
        _.each(pages, function(p) {
          getImage(chapterLink.replace('1.html', p + '.html'), 250);
        });
      });
    }
  }
);
