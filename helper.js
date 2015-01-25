const
    cheerio          = require('cheerio')
  , request          = require('request')
  , rootURL          = 'http://www.artsandscience.utoronto.ca'
  , winterCoursesURL = '/ofr/timetable/winter'
  , listingsURL      = '/sponsors.htm';

/*
----------------------------------------
Function: getProgramURL
----------------------------------------
  Returns a string of the course listing URL link.
----------------------------------------
Example Usage Calls
----------------------------------------
  getProgramURL('csc, function(err, courseURL) {
    console.log(courseURL);
  });

  'csc.html'

----------------------------------------
Number of Requests
----------------------------------------
  Min/Max: 1 (parses the listings page)
*/

exports.getProgramURL = function(course, callback) {

  request(rootURL + winterCoursesURL + listingsURL, function(error, response, body) {

    /* Scrape the course URLs from the main course listings page */
    if(!error && response.statusCode === 200) {

      var $            = cheerio.load(body)
        , webPageRegex = new RegExp(/[A-Za-z]\.html/);

      /* Grab the course links from the program bullet points */
      $('li a', '#content').each(function(foundLink) {
        var currentLink = $(this);
        /* Every course link has its course code */
        if (
          webPageRegex.test(currentLink.attr('href').toString()) &&
          currentLink.text().toString().indexOf('[' + course.toUpperCase() + ' courses') > -1)
          {
            callback(null, currentLink.attr('href').toString());
            return;
          };
      });
    };
  });
};

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
  Min/Max: 1 (parses the listings page)

*/
exports.getProgramURLs = function(callback) {
  request(rootURL + winterCoursesURL + listingsURL, function(error, response, body) {

    // Scrape the course URLs from the main course listings page
    if(!error && response.statusCode === 200) {

      var $            = cheerio.load(body)
        , urls         = []
        , webPageRegex = new RegExp(/[A-Za-z]\.html/);

      // Grab the course links from the program bullet points
      $('li a', '#content').each(function(foundLink) {
        var currentLink = $(this).attr('href').toString();
        if (webPageRegex.test(currentLink)) {
          urls.push(currentLink);
        };
      });
    };
    callback(null, urls);
  });
};

/*
----------------------------------------
Function: getDepartment
----------------------------------------
  Returns a callback with an array of JSON objects,
  containing the parameter department data.
----------------------------------------
Example Usage Calls
----------------------------------------
  getDepartment('csc', function(err, department) {
    console.log(department);
  });

  { ['Computer Science'] }
----------------------------------------
Number of Requests
----------------------------------------
  Min/Max: 0 (makes no requests)

*/
exports.getDepartment = function(body, abbrev, callback) {
    var $             = cheerio.load(body)
      , departments   = []
      , webPageRegex  = new RegExp(/[A-Za-z]\.html/);

    $('li a', '#content').each(function(foundLink) {
      var linkText = $(this).text().toString()
        , linkAttr = $(this).attr('href').toString();

      /* Decide whether to retrieve all
      departments or just the abbrev department */
      var courseToGet = (abbrev === null)
        ? true
        : linkText.indexOf('[' + abbrev.toUpperCase() + ' courses') > -1;

      // If abbrev has a course in that department
      if (webPageRegex.test(linkAttr) && courseToGet) {
        // Push just the program name, not the extra info
        departments.push({
          "department": linkText.slice(0, linkText.indexOf('[')).trim()
        });
      };
    });
    callback(null, departments);
};

/*
----------------------------------------
Function: getCourseData
----------------------------------------
  Returns a callback with an array of JSON objects,
  containing the specified course data.
----------------------------------------
Example Usage Calls
----------------------------------------
  getDepartment('csc', function(err, courseData) {
    console.log(courseData);
  });
----------------------------------------
Number of Requests
----------------------------------------
  Min/Max: 0 (makes no requests)

*/
exports.getCourseData = function(body, getCancelledCourses, callback) {

  /* Load the new markup from this request. */
  var $                   = cheerio.load(body)
    , courseCodeRegex     = new RegExp(/[A-Za-z]{3}[0-9]{3}[A-Za-z]{1}[0-9]{1}/)
    , courseTutorialRegex = new RegExp(/[^L][0-9]{4}/)
    , courseSectionRegex  = new RegExp(/[L][0-9]{4}/)
    , courseTermRegex     = new RegExp(/[F|S|Y]/)
    , courseWaitListRegex = new RegExp(/[Y|N]/)
    , coursesJSON         = [];

  /* Get the course code from the page markup */
  $('tr').each(function(foundCourse) {

    var section = findCourseSection(courseSectionRegex, $(this));

    /* Once the lecture section is found, the other important course
    data is relative to its position. */
    var courseWait      = section.next()
      , courseName      = section.prev()
      , courseTerm      = section.prev().prev()
      , courseCode      = section.prev().prev().prev()
      , courseProfessor = section.next().next().next().next()

    /* Determine whether or not to include
    cancelled courses in the callback JSON array */
    var acceptCancelledCourses = (getCancelledCourses === true)
      ? true
      : courseWait.text().toString().indexOf('Cancel') === -1;

    /* Make sure we have valid course data */
    if(courseTermRegex.test(courseTerm.text().toString())  &&
       courseCodeRegex.test(courseCode.text().toString())  &&
       acceptCancelledCourses)
    {

      var courseProfessors = parseProfessors(courseProfessor);

      coursesJSON.push({
        "courseName": courseName.text().toString(),
        "courseCode": courseCode.text().toString(),
        "courseTerm": courseTerm.text().toString(),
        "courseWait": courseWait.text().toString(),
        "courseProf": courseProfessors
      });
    };
  });
  callback(coursesJSON);
};

/* Parse professors */
function parseProfessors(courseProfessor) {
  var courseProfessors = [];

  /* There may be multiple profs for one course section */
  (courseProfessor.text().toString().indexOf('/') > -1)
  ? courseProfessors = courseProfessor.text().toString().split('/')
  : courseProfessors.push(courseProfessor.text().toString());

  return courseProfessors;
};

/* Find the course code starting from the end of the table */
function findCourseSection(courseSectionRegex, context) {
  var currentRow = context
  , section      = currentRow.children().last()
  , cellCount    = 0;

  while(!courseSectionRegex.test(section.text().toString()) && cellCount < 9) {
    section = section.prev();
    cellCount++;
  };
  return section;
};
