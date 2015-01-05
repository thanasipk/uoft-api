var request           = require('request') // web requests
  , cheerio           = require('cheerio') // server-side DOM functions
  , baseURL           = 'http://www.artsandscience.utoronto.ca'
  , courseBaseURL     = '/ofr/timetable/winter'
  , courseListingsURL = '/sponsors.htm';

/*
Retrieves the URL for course's program's
listing page and puts them in an array.
*/
function getProgramURL(course, callback) {
  request(baseURL + courseBaseURL + courseListingsURL, function(error, response, body) {

    // Scrape the course URLs from the main course listings page
    if(!error && response.statusCode == 200) {

      // Load the response body into Cheerio for DOM manipulation
      var $            = cheerio.load(body);
      var webPageRegex = new RegExp('[A-Za-z]\.html');

      // Grab the course links from the program bullet points
      $('li a', '#content').each(function(foundLink) {
        var currentLink = $(this);
        // Every course link has its course code
        if (webPageRegex.test(currentLink.attr('href').toString()) &&
            currentLink.text().toString().indexOf('[' + course.toUpperCase() + ' courses') > -1) {
              callback(null, currentLink.attr('href').toString());
              return;
        };
      });
    };
  });
};

function getProgramURLs(callback) {
  request(baseURL + courseBaseURL + courseListingsURL, function(error, response, body) {

    // Scrape the course URLs from the main course listings page
    if(!error && response.statusCode == 200) {

      // Load the response body into Cheerio for DOM manipulation
      var $            = cheerio.load(body);
      var urls         = []; // Store all program listing URLs
      var webPageRegex = new RegExp('[A-Za-z]\.html');

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
Retrieves all the courses in a program's
URL and stores the results in a file.
*/
function getProgramCourses(course, callback) {

  getProgramURL(course, function(err, courseURL) {

    request(baseURL + courseBaseURL + '/' + courseURL, function(error, response, body) {

      // Something went wrong
      if (!error && response.statusCode == 200) {
        // Load the new markup from this request.
        var $                   = cheerio.load(body);
        var courseCodeRegex     = new RegExp(/([A-Za-z]{3})([0-9]{3})([A-Za-z]{1})([0-9]{1})/);
        var courseTutorialRegex = new RegExp(/(T|P)[0-9]{4}/);
        var courseSectionRegex  = new RegExp(/(L)([0-9]{4})/);
        var courseTermRegex     = new RegExp(/(F|S|Y)/);
        var courseWaitListRegex = new RegExp(/Y|N/);
        var coursesJSONArray    = [];

        // Get the course code from the page markup
        $('tr').each(function(foundCourse) {
          // Lock iteration legnth for development and testing purposes
          if(foundCourse < 1000) {
            var courseSect = [];

            var currentRow = $(this);
            var section = currentRow.children().last();
            var count = 0;

            /* At most 10 cells in the row, check until the end to be sure */
            while(!courseSectionRegex.test(section.text().toString()) && count < 9) {
              section = section.prev();
              count++;
            };

            /* Once the lecture section is found, the other data is relative to its position */
            courseWait = section.next();
            courseName = section.prev();
            courseTerm = section.prev().prev();
            courseCode = section.prev().prev().prev();
            courseProfessor = section.next().next().next().next();

            console.log("----------------------------------------");
            // KEEP HERE FOR TESTING PURPOSES
            // console.log('section found as: ' + section.text().toString());
            // console.log('courseName found as: ' + courseName.text().toString());
            // console.log('courseTerm found as: ' + courseTerm.text().toString());
            // console.log('courseCode found as: ' + courseCode.text().toString());
          };

          // Push valid course data (lecture data only) to the course JSON array
          /*
            Reminder: this will only push lecture section data rows because
            the AND forces all fields to be filled in, which is not the case with
            tutorial rows.
          */

          if(courseSectionRegex.test(section.text().toString()) &&
             courseTermRegex.test(courseTerm.text().toString())    &&
             courseCodeRegex.test(courseCode.text().toString())) {

              // Should loop to get the sections repeatedly
              var courseSections = [];
              var courseProfessors = [];

              // May be multiple profs for one course section, append them
              if (courseProfessor.text().toString().indexOf('/') > -1) {
                courseProfessors = courseProfessor.text().toString().split('/');
              } else {
                courseProfessors.push(courseProfessor.text().toString());
              }

              courseSections.push(section.text().toString());

              course = {
                courseName: courseName.text().toString(),
                courseCode: courseCode.text().toString(),
                courseTerm: courseTerm.text().toString(),
                courseWait: courseWait.text().toString(),
                courseSect: courseSections,
                courseProf: courseProfessors
              };

              coursesJSONArray.push(course);
              console.log(JSON.stringify(course));
          };
        });
      };
      callback(null, coursesJSONArray);
    });
  });
};

getProgramCourses('csc', function(err, courses) {
  console.log(courses);
});
