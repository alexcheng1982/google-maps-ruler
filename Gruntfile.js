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
    },
    uglify: {
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': 'build/<%= pkg.name %>.js'
        }
      }
    },
    copy: {
      dist: {
        src: 'build/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-umd');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('dist', ['coffee', 'umd', 'uglify:dist', 'copy:dist']);
};
