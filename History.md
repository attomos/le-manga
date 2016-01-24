0.0.6 / 2014-05-15
==================
 * Added test for INUGAMI-SAN TO SARUTOBI-KUN WA NAKA GA WARUI.
 * Fixed readline prompt bug when manga's volume is not available.
 * Changed regexp in extractVolumeData function to handle `Volume Not Available` correctly.
 * Fixed prompt message.
 * Updated README.md

0.0.5 / 2014-05-03
==================
 * Allow * for download all chapters.
 * Working with callbacks.
 * Fixed LM.prototype.getChapterRange function.
 * Fixed isNotANumber function and download all volumes is too harsh.
 * Making use of mkdirp package :)
 * Added npm version badge fury.

0.0.4 / 2014-04-27
==================
 * Use version from package.json
 * Removed debugging log.
 * Created bin directory and modularized the library a bit.
 * Removed unused method range.
 * Renamed test.js to le-manga-test.js
 * Added MIT License.
 * Use assert instead of should.
 * Fixed some typos and move le-manga.js to bin/
 * Deleted Makefile, use npm test to test instead of make test.
 * Removed node 0.8 from .travis.yml
 * Merge branch 'master' of github.com:attomos/le-manga
 * Added `should` and dummy test.
 * Update README.md
 * Travis CI activated.

0.0.3 / 2014-04-27
==================
 * Revamped the prompt message and added details to README.md
 * Integrated with commander.js

0.0.2 / 2014-04-26
==================
 * Added credit to @macbaszii
 * Try to make bin option in package.json work.

0.0.1 / 2014-04-26
==================
 * Added shebang and `chmod +x app.js`
 * Updated the name and added README file.
 * Initial commit
