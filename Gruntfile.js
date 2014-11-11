'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    watch: {
      coffee: {
        tasks : ['coffee', 'umd'],
        files: ['<%= pkg.name %>.coffee']
      }
    },
    coffee: {
      compile: {
        options:{
          bare: true,
          sourceMap : false
        },
        files: [
          {
            src: '<%= pkg.name %>.coffee',
            dest: 'build/<%= pkg.name %>.coffee.js',
            ext: '.js'
          }
        ]
      }
    },
    umd: {
      'default': {
        src: 'build/<%= pkg.name %>.coffee.js',
        dest: 'build/<%= pkg.name %>.js',
        deps: {
        },
        objectToExport: 'gmruler',
        globalAlias: 'gmruler'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-umd');
  grunt.registerTask('dev', ['watch']);
  grunt.registerTask('default', ['coffee', 'umd']);
};
