#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var async = require('async');
var mkdirp = require('mkdirp');
var readline = require('readline');
var program = require('commander');
var LM = require('../lib/le-manga.js');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function isNotANumber(n) {
  return isNaN(parseFloat(n) || !isFinite(n));
}


function main(title) {
  var lm = new LM(title);
  async.series([

    function(cb) {
      lm.getMangaData(lm.getMangaUrl(title), function(err, data) {
        if (data.length > 0) {
          lm.manga = data;
          lm.volumes = lm.getVolumeRange();
          cb(null, title);
        } else {
          console.log('Cannot find manga named "%s"', title);
          rl.close();
          process.exit(1);
        }
      });
    },

    function(cb) {
      var volumes = lm.volumes;
      var volumeFmt = 'Which volume ';
      var volumePrompt = '';
      var last = volumes[volumes.length - 1];
      if (isNotANumber(last)) {
        volumeFmt += '[%s - %s, %s]';
        volumePrompt = util.format(volumeFmt, volumes[0],
                                   volumes[volumes.length - 2],
                                   volumes[volumes.length - 1]);
      } else {
        volumeFmt += '[%s - %s]';
        volumePrompt = util.format(volumeFmt, volumes[0],
                                   volumes[volumes.length - 1]);
      }
      volumePrompt += ' (* for all) > ';
      rl.question(volumePrompt, function(answer) {
        if (answer === '*') {
          lm.volume = answer;
          cb(null, '*');
        } else {
          lm.chapters = lm.getChapterRange(answer);
          cb(null, lm.volume);
        }
      });
    },

    function(cb) {
      if (typeof lm.volume === 'string') {
        return cb(null, lm.chapter);
      }
      rl.question(util.format('Which chapter? [%s - %s] : ', lm.chapters[0],
            lm.chapters[lm.chapters.length - 1]), function(answer) {
        lm.chapter = answer;
        cb(null, lm.chapter);
      });
    },

    function(cb) {
      var st = lm.getSafeTitle(title);
      rl.question(util.format('Enter output directory: (%s) ',
            st), function(answer) {
        if (lm.volume === '*') {
          lm.output = util.format('./%s', answer.length === 0 ? st : answer);
        } else if (lm.volume === '*') {
          lm.output = util.format('./%s/%s', answer.length === 0 ? st : answer, lm.volume.volume);
        } else {
          lm.output = util.format('./%s/%s/%s', answer.length === 0 ? st : answer, lm.volume.volume, lm.chapter);
        }
        fs.exists(lm.output, function(exists) {
          if (!exists) {
            mkdirp(lm.output, function(err) {
              if (err) {
                cb(err, null);
              } else {
                cb(null, lm.output);
              }
            });
          } else {
            cb(null, lm.output);
          }
        });
      });
    }

  ], function(err, data) {
      if (err) {
        console.log(err);
        process.exit(1);
      } else {
        console.log(data);
        if (lm.volume === '*') {
          lm.downloadAllVolumes();
        } else {
          lm.startDownload(lm.title, lm.volume, lm.chapter);
        }
      }
      rl.close();
    }
  );
}

program
  .version(require('../package.json').version)
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
