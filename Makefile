# --- promise-q

npm.install:
	npm install

test.base: npm.install
	$(shell npm bin)/mocha tests

test: test.base
	node make build
	$(shell npm bin)/karma start karma.conf.js

build: test.base
	node make build

master.increaseVersion:
	git fetch origin
	git checkout master
	@git pull origin master
	@node make pkg:increaseVersion

git.increaseVersion: master.increaseVersion
	git add .
	git commit -a -n -m "increased version [$(shell node make pkg:version)]"
	@git push origin master
	npm publish

git.updateRelease:
	git checkout release
	@git pull origin release
	@git merge --no-edit master

release: test git.increaseVersion git.updateRelease build
	@git add dist -f --all
	@git add .
	-@git commit -n -m "updating built versions"
	@git push origin release
	@echo "\n\trelease version $(shell node make pkg:version)\n"
	@git checkout master

# DEFAULT TASKS

.DEFAULT_GOAL := build
