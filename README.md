# Le manga [![Build Status](https://secure.travis-ci.org/attomos/le-manga.svg?branch=master)](http://travis-ci.org/attomos/le-manga) [![NPM version](https://badge.fury.io/js/le-manga.svg)](http://badge.fury.io/js/le-manga)

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

Copyright (C) 2014 Nattaphoom Ch. &lt;attomos@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
