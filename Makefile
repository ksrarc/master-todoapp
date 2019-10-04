.DEFAULT_GOAL=all

submodule:
	if [[ ! -e publish ]]; then\
		git submodule add --force https://caac.dev/maestria/todoapp-publish.git publish;\
	fi
	git -C publish pull

dist: submodule elm
	mkdir -pv publish/todoapp
	cp -v index.html *.js publish/todoapp
	if [[ ! -z "`git -C publish status --porcelain`" ]]; then\
		git -C publish add .;\
		git -C publish commit -a -m "Publicacion por Makefile";\
		git -C publish push;\
	fi

all: elm

elm:
	${MAKE} -C elm
	
clean:
	${MAKE} -C elm clean

.PHONY: elm clean