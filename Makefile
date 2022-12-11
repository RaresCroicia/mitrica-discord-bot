all: init run

init:
	chmod +x startMitrica

run: init
	./startMitrica

.PHONY: all init run
