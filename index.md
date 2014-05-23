---
layout: master
permalink: /
title: Home
weight: 1
---

The software demo, based on the HTML 5 storefront, backed by Cortex.

Set up
======

Get the code

	git clone git@github.elasticpath.net:cortex/Software-Demo.git
	cd Software-Demo
	git submodule init
	git submodule update

Install the required node libraries

	cd ui-storefront
	npm install 

	cd ..
	npm install grunt-contrib-uglify grunt-contrib-watch grunt-contrib-less grunt-contrib-requirejs
	

Generate your CSS

	grunt less

Edit your cortex config (if necessary) and 

	vi ext/ep.config.json
	...
	"cortexApi":{
	  "path":"cortex",
	  "scope":"software"
	}	

Run your Storefront

	cd ui-storefront
	node app
