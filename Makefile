# --- parole

git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: install build min lint custom-tests test-new test-defer test-future promises-aplus-tests promises-aplus-tests.min karma karma.min test npm.increaseVersion npm.pushVersion git.tag npm.publish github.release release

ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

install:
	npm install

build:
	@$(shell npm bin)/rollup parole.js --file dist/parole.js --format cjs
	@$(shell npm bin)/rollup parole.js --file dist/parole.umd.js --format umd --name "Parole"

min:
	@echo "minified version"
	@$(shell npm bin)/uglifyjs dist/parole.umd.js -o dist/parole.min.js -c -m

lint:
	@echo "checking syntax"
	@$(shell npm bin)/eslint lib

custom-tests:
	@echo "passing es6 methods tests"
	@$(shell npm bin)/mocha tests/*-test.js --exit

test-new:
	@$(shell npm bin)/promises-aplus-tests tests/promises-aplus-adapter-new.js

test-defer:
	@$(shell npm bin)/eslint src/defer.js
	@$(shell npm bin)/promises-aplus-tests tests/promises-aplus-adapter-defer.js

test-future:
	@$(shell npm bin)/eslint src/future.js
	@$(shell npm bin)/promises-aplus-tests tests/promises-aplus-adapter-future.js

promises-aplus-tests: export TEST_JS = normal
promises-aplus-tests:
	@echo "passing promises-aplus tests"
	@$(shell npm bin)/promises-aplus-tests tests/promises-aplus-adapter.js

promises-aplus-tests.min: export TEST_JS = min
promises-aplus-tests.min:
	@echo "passing promises-aplus tests"
	@$(shell npm bin)/promises-aplus-tests tests/promises-aplus-adapter.js

karma: export TEST_JS = normal
karma:
	@echo "passing browser tests (karma)"
	@$(shell npm bin)/karma start karma.conf.js

karma.min: export TEST_JS = min
karma.min:
	@echo "passing browser tests (karma)"
	@$(shell npm bin)/karma start karma.conf.js

test: install lint build min custom-tests promises-aplus-tests promises-aplus-tests.min karma karma.min

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

npm.publish: npm.pushVersion git.tag
	# - cd dist && npm publish --access public
	- npm publish --access public
	# - node -e "var fs = require('fs'); var pkg = require('./dist/package.json'); pkg.name = 'parole'; fs.writeFile('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf8', function (err) { if( err ) console.log('Error: ' + err); });"
	- node -e "var fs = require('fs'); var pkg = require('./package.json'); pkg.name = 'parole'; fs.writeFile('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf8', function (err) { if( err ) console.log('Error: ' + err); });"
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

release: test npm.publish github.release

# DEFAULT TASKS

.DEFAULT_GOAL := test
