.DEFAULT_GOAL=all
S3PATH=caac/static/todoapp
MC=mc
CACHECONTROL=--attr Cache-Control=max-age=9000,min-fresh=9000

deploy: all
	${MC} cp ${CACHECONTROL} index.html *.js ${S3PATH}/

all: elm

elm:
	${MAKE} -C elm
	
clean:
	${MAKE} -C elm clean

.PHONY: elm clean