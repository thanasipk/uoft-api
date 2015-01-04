var request           = require('request') // web requests
  , cheerio           = require('cheerio') // server-side DOM functions
  , baseURL           = 'http://www.artsandscience.utoronto.ca'
  , courseBaseURL     = '/ofr/timetable/winter'
  , courseListingsURL = '/sponsors.htm';

/*
Retrieves the URLs of every program's
listing page and puts them in an array.
*/
(function getProgramURLs() {
  request(baseURL + courseBaseURL + courseListingsURL, function(error, response, body) {

    // Something went wrong
    if(error || response.statusCode != 200) {
      throw error;
    }

    // Scrape the course URLs from the main course listings page
    else {

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

      // Get the course codes in each program
      // for (var i = 0; i < 3; i++) {
      // for (var programURL in urls) {
        getProgramCourses('phy.html', function(err, courselist) {
          // console.log(courselist);
        // });
        // getProgramCourses(urls, programURL);
          // console.log(courselist);
        });

    }; // End course listings request else
  }); // End course listings request
})(); // End getProgramURLs

/*
Retrieves all the courses in a program's
URL and stores the results in a file.
*/
function getProgramCourses(singleURL, callback) {

  request(baseURL + courseBaseURL + '/' + singleURL, function(error, response, body) {

    // Something went wrong
    if (!error && response.statusCode == 200) {
      // Load the new markup from this body into Cheerio for parsing.
      var $                   = cheerio.load(body);
      var courseCodeRegex     = new RegExp('([A-Za-z]{3})([0-9]{3})([A-Za-z]{1})([0-9]{1})');
      var courseTermRegex     = new RegExp('(F|f)|(S|s)|(Y|y)');
      var courseSectionRegex  = new RegExp('([A-Za-z])([0-9]{4})');
      var courseWaitListRegex = new RegExp('Y|N');
      var coursesJSONArray    = [];

      // Get the course code from the page markup
      $('tr').each(function(foundCourse) {
          // Lock iteration legnth for development and testing purposes
        if(foundCourse < 200) {
          var courseJSON = [];
          var courseSect = [];

          var currentRow = $(this);
          var dataCourseSect = currentRow.children().last();
          var count = 0;

          /* At most 10 cells in the row, check until the end to be sure */
          while(!courseSectionRegex.test(dataCourseSect.text().toString()) && count < 9) {
            dataCourseSect = dataCourseSect.prev();
            count++;
          };

          /* Once the lecture section is found, the other data is relative to its position */
          dataCourseWait = dataCourseSect.next();
          dataCourseName = dataCourseSect.prev();
          dataCourseTerm = dataCourseSect.prev().prev();
          dataCourseCode = dataCourseSect.prev().prev().prev();
          dataCourseProf = dataCourseSect.next().next().next().next();

          console.log("----------------------------------------");
          // KEEP HERE FOR TESTING PURPOSES
          // console.log('dataCourseSect found as: ' + dataCourseSect.text().toString());
          // console.log('dataCourseName found as: ' + dataCourseName.text().toString());
          // console.log('dataCourseTerm found as: ' + dataCourseTerm.text().toString());
          // console.log('dataCourseCode found as: ' + dataCourseCode.text().toString());
        };

        // Push valid course data (lecture data only) to the course JSON array
        /*
          Reminder: this will only push lecture section data rows because
          the AND forces all fields to be filled in, which is not the case with
          tutorial rows.
        */

        if(courseSectionRegex.test(dataCourseSect.text().toString()) &&
           courseTermRegex.test(dataCourseTerm.text().toString())    &&
           courseCodeRegex.test(dataCourseCode.text().toString())) {

            // Should loop to get the sections repeatedly
            var courseSections = [];
            var courseProfessr = [];

            // May be multiple profs for one course section, append them
            if(dataCourseProf.text().toString().indexOf('/') > -1) {
              courseProfessr = dataCourseProf.text().toString().split('/');
            } else {
              courseProfessr.push(dataCourseProf.text().toString());
            }

            courseSections.push(dataCourseSect.text().toString());

            course = {
              courseName: dataCourseName.text().toString(),
              courseCode: dataCourseCode.text().toString(),
              CourseTerm: dataCourseTerm.text().toString(),
              CourseSect: courseSections,
              courseWait: dataCourseWait.text().toString(),
              courseProf: courseProfessr
            };

            courseJSON.push(course);
            console.log(JSON.stringify(course));
        };
      });
    };
    callback(null, coursesJSONArray);
  });
};
