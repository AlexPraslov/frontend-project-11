install:
	npm ci

develop:
	npm run dev

build:
	npm run build

lint:
	npx eslint .

html-lint:
	npx htmlhint *.html

test:
	echo "No tests configured"

check:
	build lint

.PHONY:
	install develop build lint test check
