SRC = $(shell find web/src -name "*.coffee")

web/compiled: $(SRC)
	node web/compile.js
	touch web/compiled