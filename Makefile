install:
	npm ci
develop:
	npm run dev
build:
	npm run build
lint:
	npx eslint .
html-lint:
	npx htmlhint .
lint-fix:
	npx eslint . --fix