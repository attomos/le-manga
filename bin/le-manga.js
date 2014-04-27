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
      rl.question(util.format('Which volume? [%s - %s] : ',
        lm.volumes[0], lm.volumes[lm.volumes.length - 1]), function(answer) {
        lm.chapters = lm.getChapterRange(answer);
        cb(null, lm.volume);
      });
    },
    function(cb) {
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
        lm.output = util.format('./%s', answer.length === 0 ? st : answer);
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
        rl.close();
        process.exit(1);
      } else {
        console.log(data);
        lm.startDownload();
        rl.close();
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
