SHELL=/bin/bash

WORKDIR?=.

.ONESHELL:
build-container:
	@if [ "$$(docker images -q blog 2> /dev/null)" = "" ]; then \
		docker build -t blog . -f Dockerfile; \
	fi

.ONESHELL:
server: build-container	
	@docker run -it --rm --mount type=bind,source="$$(pwd)",target=/blog/ -p 4000:4000\
		blog bash -c "jekyll build && jekyll server"
