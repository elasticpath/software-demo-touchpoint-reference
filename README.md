Software-Demo
=============

The software demo, based on the HTML 5 storefront, backed by Cortex.

Set up
======

Get the code

	git clone git@github.elasticpath.net:cortex/Software-Demo.git
	git submodule init
	git submodule update

Install the required node libraries

	cd ui-storefront
	npm install -g --verbose

	cd ..
	npm install grunt-contrib-uglify grunt-contrib-watch grunt-contrib-less grunt-contrib-requirejs
	
Generate your CSS

	grunt less

Run your Storefront

	cd ui-storefront
	node app
