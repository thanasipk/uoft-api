const
    request          = require('request')
  , cheerio          = require('cheerio')
  , helper           = require('./helper.js')
  , rootURL          = 'http://www.artsandscience.utoronto.ca'
  , winterCoursesURL = '/ofr/timetable/winter'
  , listingsURL      = '/sponsors.htm';

exports.getCourseDepartment = function (abbrev, callback) {

  request(rootURL + winterCoursesURL + listingsURL, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      /* Retrieve the course department */
      helper.getDepartment(body, abbrev, function(err, department) {
        callback(null, department);
      });
    };
  });

};

exports.getAllCourseDepartments = function (callback) {

  request(rootURL + winterCoursesURL + listingsURL, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      /* Retrieve the course departments */
      helper.getDepartment(body, null, function(err, departments) {
        callback(null, departments);
      });
    };
  });

};

exports.getProgramCourses = function (course, getCancelledCourses, callback) {

  /* Find the program page by the specified course abbreviation */
  helper.getProgramURL(course, function(err, programURL) {

    /* Retrieve the course list for the specified program */
    request(rootURL + winterCoursesURL + '/' + programURL, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        helper.getCourseData(body, getCancelledCourses, function(coursesJSON) {
          callback(null, coursesJSON);
        });
      };
    });

  });
};
