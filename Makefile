#!make
SHELL := env PATH=$(shell npm bin):$(PATH) /bin/bash -O extglob

.SILENT:
.PHONY: install build min lint custom-tests test-new test-defer test-future promises-aplus-tests promises-aplus-tests.min karma karma.min test npm.increaseVersion npm.pushVersion git.tag npm.publish github.release release

git_branch := $(shell git rev-parse --abbrev-ref HEAD)

ifndef FORCE_COLOR
  export FORCE_COLOR=true
endif

ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

node_modules:; npm install
install:; npm install
i: install

build.cjs: node_modules
	esbuild src/* --format=cjs --outdir=dist/cjs

build.esm: node_modules
	esbuild src/* --format=esm --outdir=dist/esm

build: build.cjs build.esm

min:
	@echo "minified version"
	@$(shell npm bin)/uglifyjs dist/parole.umd.js -o dist/parole.min.js -c -m

eslint: node_modules
	eslint src

upload.codecov:
	curl -Os https://uploader.codecov.io/latest/linux/codecov
	chmod +x codecov
	./codecov

test.parole: node_modules
	nyc --reporter=lcov promises-aplus-tests ./tests/parole.adapter.cjs

test.future: node_modules
	promises-aplus-tests ./tests/future.adapter.cjs

test.defer: node_modules
	promises-aplus-tests ./tests/defer.adapter.cjs

test.promise: node_modules
	promises-aplus-tests ./tests/promise.adapter.cjs

test: build test.parole

test.ci:
	nyc --reporter=lcov $(MAKE) -j 2 test.defer test.parole

npm.publish:
	npm version $(NPM_VERSION)
	git push origin $(git_branch)
	git push --tags
	npm publish

npm.increaseVersion:
	npm version ${NPM_VERSION} --no-git-tag-version

npm.pushVersion: npm.increaseVersion
	git commit -a -n -m "v$(shell node -e "process.stdout.write(require('./package').version + '\n')")" 2> /dev/null; true
	git push origin $(master_branch)

git.tag: build
	git pull --tags
	git add dist -f --all
	-git commit -n -m "updating dist" 2> /dev/null; true
	git tag -a v$(shell node -e "process.stdout.write(require('./package').version + '\n')") -m "v$(shell node -e "process.stdout.write(require('./package').version + '\n')")"
	git push --tags
	# git push origin $(git_branch)

npm.publishOld: npm.pushVersion git.tag
	# - cd dist && npm publish --access public
	- npm publish --access public
	# - node -e "var fs = require('fs'); var pkg = require('./dist/package.json'); pkg.name = 'parole'; fs.writeFile('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf8', function (err) { if( err ) console.log('Error: ' + err); });"
	- node -e "var fs = require('fs'); var pkg = require('./package.json'); pkg.name = 'parole'; fs.writeFile('package.json', JSON.stringify(pkg, null, '  '), 'utf8', function (err) { if( err ) console.log('Error: ' + err); });"
	# - cd dist && npm publish
	- npm publish
	git reset --hard origin/$(git_branch)
	@git checkout $(git_branch)

github.release: export REPOSITORY="kiltjs/parole"
github.release: export PKG_VERSION=$(shell node -e "console.log('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/${REPOSITORY}/releases" )
github.release:
	@echo ${RELEASE_URL}
	@true

release: test npm.publishOld github.release

# DEFAULT TASKS

.DEFAULT_GOAL := test
