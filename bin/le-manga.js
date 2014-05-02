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
  return isNaN(parseFloat(n)) || !isFinite(n);
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
      rl.question(volumePrompt, function(answer) {
        lm.chapters = lm.getChapterRange(answer);
        cb(null, lm.volume);
      });
    },

    function(cb) {
      var chapters = lm.chapters;
      var chapterFmt = 'Which chapter ';
      var chapterPrompt = '';
      var last = chapters[chapters.length - 1];
      if (isNotANumber(last)) {
        chapterFmt += '[%s - %s, %s]';
        chapterPrompt = util.format(chapterFmt, chapters[0],
                                   chapters[chapters.length - 2],
                                   chapters[chapters.length - 1]);
      } else {
        chapterFmt += '[%s - %s]';
        chapterPrompt = util.format(chapterFmt, chapters[0],
                                   chapters[chapters.length - 1]);
      }
      chapterPrompt += ' (* for all) : ';
      rl.question(chapterPrompt, function(answer) {
        lm.chapter = answer;
        cb(null, lm.chapter);
      });
    },

    function(cb) {
      var st = lm.getSafeTitle(title);
      rl.question(util.format('Enter output directory: (%s) ',
            st), function(answer) {
        var outputDir = answer.length === 0 ? st : lm.getSafeTitle(answer);
        console.log(outputDir);
        if (lm.volume === '*') {
          lm.output = util.format('./%s', outputDir);
        } else if (lm.chapter === '*') {
          lm.output = util.format('./%s/%s', outputDir, lm.volume.volume);
        } else {
          lm.output = util.format('./%s/%s/%s', outputDir, lm.volume.volume, lm.chapter);
        }
        for (var i = 0; i < lm.volumes.length; i++) {
          // console.log(util.format('./%s', lm.volumes[i]));
          // fs.mkdirp.sync(util.format('./%s', lm.volumes[i]));
          // for (var i = 0; i < lm.chapters.length; i++)
        }
        process.exit();
        fs.exists(lm.output, function(exists) {
          mkdirp(lm.output, function(err) {
            if (err) {
              cb(err, null);
            } else {
              cb(null, lm.output);
            }
          });
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
          lm.downloadAllChapters();
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
