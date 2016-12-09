# --- promise-q

install:
	npm install

min:
	@echo "minified version"
	@$(shell npm bin)/uglifyjs q.js -o q.min.js -c -m

lint:
	@echo "checking syntax"
	@$(shell npm bin)/eslint lib

custom-tests:
	@echo "passing es6 methods tests"
	@$(shell npm bin)/mocha tests

promises-aplus-tests: export TEST_JS = normal
promises-aplus-tests:
	@echo "passing promises-aplus tests"
	@$(shell npm bin)/promises-aplus-tests tests/promises-aplus-adapter.js

promises-aplus-tests.min: export TEST_JS = min
promises-aplus-tests.min: min
	@echo "passing promises-aplus tests"
	@$(shell npm bin)/promises-aplus-tests tests/promises-aplus-adapter.js

karma: export TEST_JS = normal
karma:
	@echo "passing browser tests (karma)"
	@$(shell npm bin)/karma start karma.conf.js

karma.min: export TEST_JS = min
karma.min: min
	@echo "passing browser tests (karma)"
	@$(shell npm bin)/karma start karma.conf.js

test: install lint custom-tests promises-aplus-tests promises-aplus-tests.min karma karma.min

increaseVersion:
	git fetch origin
	git checkout master
	@git pull origin master
	@node make pkg:increaseVersion

release: increaseVersion
	git add .
	git commit -a -n -m "increased version [$(shell node make pkg:version)]"
	@git push origin master
	npm publish
	@echo "updating github relase"
	@node make gh-release

# DEFAULT TASKS

.DEFAULT_GOAL := min
