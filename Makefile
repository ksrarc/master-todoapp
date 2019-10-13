.DEFAULT_GOAL=all
S3PATH=caac/static/todoapp
MC=mc
CACHECONTROL=--attr Cache-Control=max-age=0
DEPLOY_FILES=index.html $(wildcard *.js) $(wildcard *.css)

deploy: all
	${MC} cp ${CACHECONTROL} ${DEPLOY_FILES} ${S3PATH}/

all: elm

elm:
	${MAKE} -C elm
	
clean:
	${MAKE} -C elm clean

.PHONY: elm clean