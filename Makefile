.DEFAULT_GOAL=all
S3PATH=caac/static/todoapp/
MC=mc
CACHECONTROL=--attr Cache-Control=max-age=0

DEPLOY_FILES=index.html $(wildcard *.js) $(wildcard *.css)

install:
	${MAKE} -C elm install
	${MAKE} -C react install

deploy: all
	mkdir -p deploy
	cp -v elm/*.js elm/*.css deploy
	cp -v react/build/index.html deploy
	cp -rv react/build/static deploy
	cp -rv angular/dist/todo/*.js deploy/
	${MC} mirror --overwrite  --remove deploy/ ${S3PATH}

all: elm react angular

elm:
	${MAKE} -C elm all
	
react:
	${MAKE} -C react all

angular:
	${MAKE} -C angular all

clean:
	${MAKE} -C elm clean
	${MAKE} -C react clean

.PHONY: elm react clean