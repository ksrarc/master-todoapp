ELM_SRC=src/*.elm
ELM_AST=index.html style.css todoapp-elm.js

deploy:
	npm install
	npm run build
	cp ${ELM_AST} ../

clean:
	rm -rfv ${ELM_OUT}

.PHONY: clean