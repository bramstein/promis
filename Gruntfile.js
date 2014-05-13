var extend = require('extend');

module.exports = function (grunt) {
  var compilerOptions = {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    warning_level: 'VERBOSE',
    summary_detail_level: 3,
    language_in: 'ECMASCRIPT5_STRICT',
    output_wrapper: '"(function(){%output%}());"',
    use_types_for_optimization: true
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build'],
    mochaTest: {
      test: {
        src: ['test/**/*.js']
      }
    },
    concat: {
      test: {
        src: ['adapters/ns.js', 'src/base.js', 'src/promise.js', 'src/polyfill.js', 'adapters/adapter.js'],
        dest: 'build/promise.test.js'
      },
      test_compiled: {
        src: ['adapters/ns.js', 'build/promise.js', 'adapters/adapter.js'],
        dest: 'build/promise.test.js'
      }
    },
    closurecompiler: {
      compile: {
        files: {
          'build/promise.js': ['src/**/*.js']
        },
        options: extend({}, compilerOptions, {
          define: 'goog.DEBUG=false'
        })
      },
      debug: {
        files: {
          'build/promise.debug.js': ['src/**/*.js']
        },
        options: extend({}, compilerOptions, {
          debug: true,
          formatting: ['PRETTY_PRINT', 'PRINT_INPUT_DELIMITER']
        })
      }
    },
    copy: {
      dist: {
        files: [
          {
            src: ['build/promise.js'],
            dest: 'promise.min.js'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-closurecompiler');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('compile', ['closurecompiler:compile']);
  grunt.registerTask('debug', ['closurecompiler:debug']);
  grunt.registerTask('default', ['compile']);
  grunt.registerTask('test', grunt.option('compiled') ? ['compile', 'concat:test_compiled', 'mochaTest'] : ['concat:test', 'mochaTest']);
  grunt.registerTask('dist', ['compile', 'copy']);
};
