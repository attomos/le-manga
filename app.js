var views = require('co-views');
var route = require('koa-route');
var koa = require('koa');
var app = koa();

var render = views(__dirname + '/views', { ext: 'ejs' });

app.use(route.get('/', list));

function *list() {
  this.body = yield render('index', {});
}


app.use(function *() {
  this.body = 'Hello World';
});

app.listen(3000);
console.log('le-manga running on http://0.0.0.0:3000');
