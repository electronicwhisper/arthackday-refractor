SRC = $(shell find web/src -name "*.coffee")

web/compiled: $(SRC)
	node web/compile.js
	rm -r webgltest.ad/AdUnit/*
	cp -r web/* webgltest.ad/AdUnit
	zip -r webgltest.ad.zip webgltest.ad
	touch web/compiled