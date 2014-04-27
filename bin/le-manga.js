#!/usr/bin/env node

var fs = require('fs');
var _ = require('lodash');
var util = require('util');
var async = require('async');
var mkdirp = require('mkdirp');
var cheerio = require('cheerio');
var request = require('request');
var readline = require('readline');
var program = require('commander');

var DEBUG = false;

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
var outputDir = '';

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

function safeTitle(title) {
  return title.join('_').toLowerCase();
}

function getMangaUrl(title) {
  return util.format('http://mangafox.me/manga/%s/', safeTitle(title));
}

function extractVolumeData(text) {
  var match = /Volume (\w+) Chapter (\d+) - (\d+)/.exec(text);
  return {
    volume:       match[1],
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
    url: url,
    pool: {
      maxSockets: 100
    }
  }, function(err, res, body) {
    $ = cheerio.load(body);
    var imageUri = $('#viewer').children().find('img').first().attr('src');
    if (DEBUG) {
      console.log(imageUri);
      console.log(imageUri.substring(imageUri.lastIndexOf('/')));
    }
    var outputFile =  outputDir + imageUri.substring(imageUri.lastIndexOf('/'));
    console.log('Downloading ' + imageUri + ' to ' + outputFile);
    request(imageUri).pipe(fs.createWriteStream(outputFile).on('close', function() { }));
  });
}
function main(title) {
  async.series([
    function(cb) {
      getMangaData(getMangaUrl(title), function(err, data) {
        if (data.length > 0) {
          manga = data;
          volumes = _.sortBy(_.pluck(data, 'volume'), function(vol) { return vol; });
          cb(null, title);
        } else {
          cb('Cannot find ' + title, null);
        }
      });
    },
    function(cb) {
      rl.question(util.format('Which volume? [%s - %s] : ',
          volumes[0], volumes[volumes.length - 1]), function(answer) {
        volume = _.find(manga, function(m) {
          if (!isNaN(parseFloat(answer)) && isFinite(answer)) {
            var match = /(0*)(.+)/.exec(m.volume);
            var volumeInt = match[2];
            return parseInt(m.volume, 10) === parseInt(volumeInt, 10);
          } else {
            return m.volume === answer;
          }
        });
        chapters = getChapters(volume.startChapter, volume.endChapter);
        console.log(chapters);
        cb(null, volume);
      });
    },
    function(cb) {
      rl.question(util.format('Which chapter? [%s - %s] : ',
            chapters[0], chapters[chapters.length - 1]), function(answer) {
        chapter = answer;
        cb(null, chapter);
      });
    },
    function(cb) {
      rl.question(util.format('Enter output directory: (%s) ', safeTitle(title)), function(answer) {
        outputDir = util.format('./%s', answer.length === 0 ? safeTitle(title) : answer);
        fs.exists(outputDir, function(exists) {
          if (!exists) {
            mkdirp(outputDir, function(err) {
              if (err) {
                cb(err, null);
              } else {
                cb(null, outputDir);
              }
            });
          } else {
            cb(null, outputDir);
          }
        });
      });
    }
  ], function(err, data) {
      if (err) {
        console.log(err);
      } else {
        rl.close();
        console.log(data);
        var chapterLink = util.format('http://mangafox.me/manga/%s/v%s/c%s/1.html',
            safeTitle(title), volume.volume, chapter);
        request(chapterLink, function(err, res, body) {
          $ = cheerio.load(body);
          var pages = Object.keys($('select.m').first().children());
          pages = _.reject(pages, function(p) {
            return isNaN(p) || p === '0';
          });
          _.each(pages, function(p) {
            getImage(chapterLink.replace('1.html', p + '.html'));
          });
        });
      }
    }
  );
}

program
  .version('0.0.3')
  .option('-t, --title <title>', 'Specify manga\'s title')
  .option('-s, --serve', 'Serve downloaded manga locally')
  .parse(process.argv);

if (program.title) {
  main(program.title);
} else if (program.serve) {
  console.log('Serving on port 3000');
  rl.close();
} else {
  program.outputHelp();
  rl.close();
}
