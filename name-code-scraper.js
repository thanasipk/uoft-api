var request           = require('request') // web requests
  , cheerio           = require('cheerio') // server-side DOM functions
  , fs                = require('fs') // file-system interaction
  , writeLocation     = 'allCourseCodes.json'
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
        getProgramCourses('csc.html', function(err, courselist) {
          // console.log(courselist);
        // });
        // getProgramCourses(urls, programURL);
          console.log(courselist);
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
        var courseCode        = $(this).text().toString();
        var courseTerm        = $(this).next().text().toString();
        var courseName        = $(this).next().next().text().toString();
        var courseSection     = $(this).next().next().next().text().toString();
        var courseHasWaitList = $(this).next().next().next().next().text().toString();

        /*
          $(this).children().first() // course code
          $(this).children().first().next() // Y|F|S
          $(this).children().first().next().next() // title
          $(this).children().first().next().next().next() // meeting section
        */

        if(foundCourse < 55) {
          var currentRow = $(this);
          var currRow   = currentRow.children().last().prev().text().toString();
          var currEnd_1 = currentRow.children().last().prev().prev().prev().prev().prev().prev().text().toString();
          var currEnd_2 = currentRow.children().last().prev().prev().prev().prev().prev().text().toString();
          var currEnd_3 = currentRow.children().last().prev().prev().prev().prev().text().toString();
          var currEnd_4 = currentRow.children().last().prev().prev().prev().text().toString();
          var currEnd_5 = currentRow.children().last().prev().prev().text().toString();
          var currEnd_6 = currentRow.children().last().prev().text().toString();

          if(!courseSectionRegex.test(currEnd_1)) {
            var currentRow = $(this);
            var currEnd_1 = currentRow.children().last().prev().prev().prev().prev().prev().text().toString();
            var currEnd_2 = currentRow.children().last().prev().prev().prev().prev().text().toString();
            var currEnd_3 = currentRow.children().last().prev().prev().prev().text().toString();
            var currEnd_4 = currentRow.children().last().prev().prev().text().toString();
            var currEnd_5 = currentRow.children().last().prev().text().toString();
            var currEnd_6 = currentRow.children().last().text().toString();
          };

          if(currEnd_6 == "Cancel") {
            currEnd_1 = currEnd_5 + " -> CANCELLED";
            currEnd_2 = currEnd_5 + " -> CANCELLED";
            currEnd_3 = currEnd_5 + " -> CANCELLED";
            currEnd_4 = currEnd_5 + " -> CANCELLED";
          }

          console.log("----------------------------------------");
          console.log("currEnd_1 (SECTION): " + currEnd_1);
          console.log("currEnd_2 (WAITLST): " + currEnd_2);
          console.log("currEnd_3 (TIMEOFR): " + currEnd_3);
          console.log("currEnd_4 (LOCATIN): " + currEnd_4);
          console.log("currEnd_5 (PROFESR): " + currEnd_5);
          console.log("currEnd_6 (IND)    : " + currEnd_6);
          // console.log("----------------------------------------");
        };

        // Confirm that the retrieved text is a valid course and name combo.
        // if (courseCodeRegex.test(courseCode)            &&
        //     courseTermRegex.test(courseTerm)            &&
        //     courseSectionRegex.test(courseSection)      &&
        //     courseWaitListRegex.test(courseHasWaitList) &&
        //     courseName.length > 1) {
        //   coursesJSONArray.push({
        //     courseName: courseName.replace('\r\n', '').trim(),
        //     courseCode: courseCode,
        //     courseTerm: courseTerm,
        //     courseSection : courseSection,
        //     courseHasWaitList : courseHasWaitList
        //   });
        //   console.log(coursesJSONArray);
        // };
      });
    };
    callback(null, coursesJSONArray);
  });
};
