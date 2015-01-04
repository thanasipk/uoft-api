var request           = require('request') // web requests
  , cheerio           = require('cheerio') // server-side DOM functions
  // , async             = require('async')   // pretty nested-callbacks
  , rootURL           = 'http://www.artsandscience.utoronto.ca'
  , courseRootURL     = '/ofr/timetable/winter'
  , courseListingsURL = '/sponsors.htm';

/*************************************
API FUNCTIONS
*************************************/
/*************************************
getCourseCodes          -- SEMI-DONE
  -> is this needed when course info has the code?
getCourseInfo           -- SEMI-DONE
getProgramCourses       -- DONE
getCourseDepartment     -- DONE
*************************************/

/*
Returns an array with the course codes in program.
If program is null, it will retrieve all course codes
in *every* program.

getCourseCodes('csc', '100') => ['csc108', 'csc148', 'csc104', 'csc165']
getCourseCodes('his', '100') => ['his102', 'his103', 'his109']

*/

/* number of requests: number of uoft programs (76 as of Jan 2015)
  - 1 to sponsors to find the course code links
  - 75, 1 for each course's course code page
 */

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
// How to test the functions within here
exports.ConsoleTest = function(passedArg) {
  console.log('passedArg: ' + passedArg + '\nMODULE IMPORT IN CONSOLE WORKS');
};

this.ConsoleTest('hello world');
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

exports.getCourseCodes = function (program, year, callback) {
  var courses = [];
  // do some work
  callback(courses);
};

/////////////////////////////////////////////////////////
/*
Returns a json object with the course's
  -name
  -course code
  -location
  -professor

Example Calls:
getCourseInfo('csc263') =>
{
    "courseName" : "Algorithms and Analysis",
    "courseCode" : "csc263h1",
    "classLocation" : "LM159",
    "classProfessor" : "F. Pitt",
    "semester" : "F"
}

getCourseInfo('csc309') =>
{
    "courseName" : "Programming on the Web",
    "courseCode" : "csc309h1",
    "classLocation" : "UC87",
    "classProfessor" : "E. DeLara",
    "semester" : "F"
}

*/

/* number of requests: 2
  - 1 to sponsors to find the course code link
  - 1 to that course code links page
 */
exports.getCourseInfo = function (courseCode, callback) {
  // request call

  var courseHash = {
    "courseName" : "",
    "courseCode" : "",
    "classLocation" : "",
    "classProfessor" : "",
    "semester" : ""
  };
  // do some work
  callback(courseHash);
};

/////////////////////////////////////////////////////////
/*
Returns an array of strings, containing every program name at UofT.
*/

/* number of requests: 1
  - 1 to sponsors to find the course code link
 */
exports.getAllProgramTitles = function (callback) {
  var programsList = [];
  // do some work
  callback(programsList);
};

/////////////////////////////////////////////////////////
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
Number of Requests
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

    request(rootURL + courseRootURL + courseListingsURL, function(error, response, body) {

      // Retrieve the course department
      if(!error && response.statusCode === 200) {
        var $            = cheerio.load(body);
        var departments  = [];
        var webPageRegex = new RegExp('[A-Za-z]\.html');

        $('li a', '#content').each(function(foundLink) {
          var linkText = $(this).text().toString();
          var linkAttr = $(this).attr('href').toString();

          // If abbrev has a course in that department
          if(webPageRegex.test(linkAttr) &&
             linkText.indexOf(abbrev.toUpperCase()) > -1) {
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

/////////////////////////////////////////////////////////
/*

----------------------------------------
Function: getProgramURLs
----------------------------------------
Returns a json object, containing all Arts and Science department URLs.

----------------------------------------
Example Usage Calls
----------------------------------------
getProgramURLs(function(urls) {
  console.log(urls);
});

[ { courseURL: 'asabs.html' },
  { courseURL: 'ana.html' },
  ...
  { courseURL: 'wdw.html' },
  { courseURL: 'wgsi.html' } ]

----------------------------------------
Number of Requests
----------------------------------------
Min: 1 (parses the listings page)
Max: 1 (parses the listings page)

*/
exports.getProgramURLs = function (callback) {
  request(rootURL + courserootURL + courseListingsURL, function(error, response, body) {

    // Something went wrong
    if(error || response.statusCode != 200) {
      throw error;
    }

    // Scrape the course URLs from the main course listings page
    else {
      var $            = cheerio.load(body);
      var urls         = []; // Store all program listing URLs
      var webPageRegex = new RegExp('[A-Za-z]\.html');

      // Grab the course links from the program bullet points
      $('li a', '#content').each(function(foundLink) {
        var currentLink = $(this).attr('href').toString();
        if (webPageRegex.test(currentLink)) {
          urls.push({
            courseURL: currentLink
          });
        };
      });
    };
    callback(null, urls);
  });
};

/////////////////////////////////////////////////////////
/*
Returns an array of JSON objects, where each object contains
a single course's title, coursecode, semester and professor.
*/
exports.getProgramCourses = function (programURLs, singleURL) {

  request(rootURL + courserootURL + '/' + programURLs[singleURL], function(error, response, body) {

    // Something went wrong
    if (error || response.statusCode != 200) {
      throw error;
    }

      // Scrape the course names from a program's course listing page.
    else {
      // Load the new markup from this body into Cheerio for parsing.
      var $                = cheerio.load(body);
      var courseRegex      = new RegExp('[A-Za-z]{3}[0-9]{3}[A-Za-z]{1}[0-9]{1}');
      var coursesJSONArray = [];

      // Get the course code from the page markup
      $('tr td', '#content table').each(function(foundCourse) {
        var courseCode      = $(this).text().toString();
        var courseSemester  = $(this).next().text().toString();
        var courseName      = $(this).next().next().text().toString();

        // Confirm that the retrieved text is a valid course and name combo.
        if (courseRegex.test(courseCode) && courseName.length > 0) {
          // Add the pretty JSON to the file
          coursesJSONArray.push({
            courseName: courseName.replace('\r\n', '').trim(),
            courseCode: courseCode,
            courseSemester: courseSemester
          });
        };
      });
    };
    callback(null, coursesJSONArray);
  });
};
