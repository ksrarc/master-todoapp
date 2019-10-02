ELM_SRC=src/*.elm
ELM_OUT=todoapp-elm.js

${ELM_OUT}:  ${ELM_SRC} 
	elm make ${ELM_SRC} --output ${ELM_OUT}

clean:
	rm -rfv ${ELM_OUT}

.PHONY: clean