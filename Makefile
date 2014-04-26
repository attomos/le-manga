all:
	node app.js
test:
	mocha -R spec
.PHONY: test
