ELM_SRC=src/*.elm
ELM_AST=index.html style.css
ELM_OUT=../todoapp-elm.js

${ELM_OUT}:  ${ELM_SRC} 
	elm make ${ELM_SRC} --output ${ELM_OUT}
	cp ${ELM_AST} ../

clean:
	rm -rfv ${ELM_OUT}

.PHONY: clean