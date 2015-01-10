const
    request          = require('request')
  , cheerio          = require('cheerio')
  , helper           = require('./helper.js')
  , rootURL          = 'http://www.artsandscience.utoronto.ca'
  , winterCoursesURL = '/ofr/timetable/winter'
  , listingsURL      = '/sponsors.htm';

/*
----------------------------------------
Function: getCourseDepartment
----------------------------------------

Returns a json object, containing the department
names associated with the given course code abbreviation.

----------------------------------------
Example Usage Calls
----------------------------------------

getCourseDepartment('csc', function(err, departments) {
  console.log(departments);
});

[ 'Computer Science' ]

getCourseDepartment('env', function(err, programTitles) {
  console.log(programTitles);
});

[ 'Earth Sciences',
  'Ecology & Evolutionary Biology',
  'Environment, School of',
  'Physics' ]

----------------------------------------
Number of Successful Requests Per Call
----------------------------------------
Min: 1 (parses the listings page)
Max: 1 (parses the listings page)

*/

exports.getCourseDepartment = function (abbrev, callback) {

  // Invalid course code
  if(abbrev.length != 3) {
    callback('Usage: A three-letter course-code must be used (example):\n'
      + '   getCourseDepartment(\'csc\', function(depts) {...}', null);
  };

  request(rootURL + winterCoursesURL + listingsURL, function(error, response, body) {

    // Retrieve the course department
    if(!error && response.statusCode === 200) {
      var $            = cheerio.load(body);
      var departments  = [];
      var webPageRegex = new RegExp('[A-Za-z]\.html');

      $('li a', '#content').each(function(foundLink) {
        var linkText = $(this).text().toString();
        var linkAttr = $(this).attr('href').toString();

        // If abbrev has a course in that department
        if (webPageRegex.test(linkAttr) && linkText.indexOf('[' + abbrev.toUpperCase() + ' courses') > -1) {
          // Push just the program name, not the extra info
          departments.push({
            department: linkText.slice(0, linkText.indexOf('[')).trim()
          });
        };
      });
    };
    callback(null, departments);
  });
};

/*
Returns an array of JSON objects, where each object contains
a single course's title, coursecode, semester and professor.
*/

/*
Retrieves all the courses in a program's
URL and stores the results in a file.
*/

exports.getProgramCourses = function (course, callback) {

  /* Find the program by the specified course abbreviation */
  helper.getProgramURL(course, function(err, programURL) {

    /* Retrieve the course list for the specified program */
    request(rootURL + winterCoursesURL + '/' + programURL, function(error, response, body) {

      if (!error && response.statusCode == 200) {

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

this.getProgramCourses('csc', function(err, courses) {
    console.log(courses);
});
