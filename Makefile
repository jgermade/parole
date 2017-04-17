# --- parole

git_branch := $(shell git rev-parse --abbrev-ref HEAD)

install:
	npm install

min:
	@echo "minified version"
	@$(shell npm bin)/uglifyjs parole.js -o parole.min.js -c -m

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

github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "v$(shell npm view parole version)", "target_commitish": "$(git_branch)", "name": "v$(shell npm view parole version)", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/kiltjs/parole/releases" )
github.release:
	@echo ${RELEASE_URL}
	@true

publish: test
	npm version patch
	git push origin $(git_branch)
	npm publish
	make github.release

# DEFAULT TASKS

.DEFAULT_GOAL := test
