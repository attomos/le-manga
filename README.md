# Le manga [![npm Version](https://img.shields.io/npm/v/le-manga.svg)](https://www.npmjs.com/package/le-manga) [![License](https://img.shields.io/npm/l/le-manga.svg)](https://www.npmjs.com/package/le-manga) [![Build Status](https://travis-ci.org/attomos/le-manga.svg)](https://travis-ci.org/attomos/le-manga) [![Coverage Status](https://coveralls.io/repos/attomos/le-manga/badge.svg?branch=master&service=github)](https://coveralls.io/github/attomos/le-manga?branch=master)

Le manga (`le-manga`) is a CLI tool for download
[Manga](http://en.wikipedia.org/wiki/Manga) from
[mangafox](http://mangafox.me/) and serve it locally.

# Installation

le-manga currently requires node 0.11.x for [Koa](http://koajs.com/).
You may have to install [n](https://github.com/visionmedia/n), a node version manager to install 0.11.x:

    $ npm install -g n
    $ n 0.11.12
    $ npm install -g le-manga

# Usage

Wanna read One Piece from MangaFox?

    $ le-manga -t "One Piece"
    Which volume [01 - 73, TBD] : 1
    Which chapter [1 - 8] (* for all) : *
    Enter output directory: (one_piece)


# Credit

Big thanks to [@macbaszii](https://github.com/macbaszii), I created `le-manga`
as he suggested. Thanks man. :smile:

# LICENSE

See [LICENSE](LICENSE)
