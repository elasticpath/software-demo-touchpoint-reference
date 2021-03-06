/**
 * Copyright © 2014 Elastic Path Software Inc. All rights reserved.
 *
 */
module.exports = function(grunt){

  grunt.initConfig({

    pkg: grunt.file.readJSON('ui-storefront/package.json'),
    requirejs: {
      compile: {
        options: {
//          appDir:"ui-storefront",
          baseUrl: "",
         // dir:"build",
          mainConfigFile: "public/main.js",
          name:"main",
          out: "public/build/app-optimized.js",
//          modules:[
//            {
//              name:"main",
//              include: ["app"]
//            }
//
//          ],
          findNestedDependencies: true
        }
      }
    },
    less: {
      development: {
//        options: {
//          paths: ["stylesrc"]
//        },
        files: {
          "ui-storefront/public/style/style.css": "stylesrc/style.less"
        }
      }
    },
    watch: {
      scripts:{
        files: ['stylesrc/theme-core/*.less'],
        tasks: ['less']
      }
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.registerTask('default', ['watch']);
};
