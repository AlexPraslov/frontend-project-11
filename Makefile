install:
	npm ci

develop:
	npm run dev

build:
	npm run build

lint:
	npx eslint .

test:
	echo "No tests configured"

check:
	build lint

.PHONY:
	install develop build lint test check
