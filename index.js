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
      // Retrieve the course department
      helper.getDepartment(body, abbrev, function(err, departments) {
        callback(null, departments);
      });
    };
  });
};

exports.getCourseDepartments = function (callback) {

  request(rootURL + winterCoursesURL + listingsURL, function(error, response, body) {
    if(!error && response.statusCode === 200) {
      // Retrieve the course departments
      helper.getDepartment(body, null, function(err, departments) {
        callback(null, departments);
      });
    };
  });
};

exports.getProgramCourses = function (course, callback) {

  /* Find the program by the specified course abbreviation */
  helper.getProgramURL(course, function(err, programURL) {

    /* Retrieve the course list for the specified program */
    request(rootURL + winterCoursesURL + '/' + programURL, function(error, response, body) {

      if (!error && response.statusCode === 200) {

        /* Load the new markup from this request. */
        var $                 = cheerio.load(body);
        var courseCodeRegex   = new RegExp(/[A-Za-z]{3}[0-9]{3}[A-Za-z]{1}[0-9]{1}/)
        , courseTutorialRegex = new RegExp(/[^L][0-9]{4}/)
        , courseSectionRegex  = new RegExp(/[L][0-9]{4}/)
        , courseTermRegex     = new RegExp(/[F|S|Y]/)
        , courseWaitListRegex = new RegExp(/[Y|N]/)
        , coursesJSON         = [];

        /* Get the course code from the page markup */
        $('tr').each(function(foundCourse) {
          var currentRow = $(this)
          , section = currentRow.children().last()
          , cellCount = 0;

          /* Find the course code starting from the end of the table */
          while(!courseSectionRegex.test(section.text().toString()) && cellCount < 9) {
            section = section.prev();
            cellCount++;
          };

          /* Once the lecture section is found, the other important course
          data is relative to its position. */
          courseWait = section.next();
          courseName = section.prev();
          courseTerm = section.prev().prev();
          courseCode = section.prev().prev().prev();
          courseProfessor = section.next().next().next().next();

          /* Make sure we have valid course data */
          if(courseSectionRegex.test(section.text().toString()) &&
            courseTermRegex.test(courseTerm.text().toString())  &&
            courseCodeRegex.test(courseCode.text().toString())) {

            var courseProfessors = [];

            /* There may be multiple profs for one course
            section, if so, parse and append them */
            (courseProfessor.text().toString().indexOf('/') > -1)
            ? courseProfessors = courseProfessor.text().toString().split('/')
            : courseProfessors.push(courseProfessor.text().toString());

            coursesJSON.push({
              courseName: courseName.text().toString(),
              courseCode: courseCode.text().toString(),
              courseTerm: courseTerm.text().toString(),
              courseWait: courseWait.text().toString(),
              courseProf: courseProfessors
            });
          };
        });
      };
      callback(null, coursesJSON);
    });
  });
};
