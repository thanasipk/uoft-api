const
    request           = require('request') // web requests
  , cheerio           = require('cheerio') // server-side DOM functions
  , helper            = require('./helper.js')
  , baseURL           = 'http://www.artsandscience.utoronto.ca'
  , courseBaseURL     = '/ofr/timetable/winter'
  , courseListingsURL = '/sponsors.htm';

/*
Retrieves all the courses in a program's
URL and stores the results in a file.
*/
function getProgramCourses(course, callback) {

  helper.getProgramURL(course, function(err, courseURL) {

    request(baseURL + courseBaseURL + '/' + courseURL, function(error, response, body) {

      if (!error && response.statusCode == 200) {

        // Load the new markup from this request.
        var $                   = cheerio.load(body);
        var courseCodeRegex     = new RegExp(/([A-Za-z]{3})([0-9]{3})([A-Za-z]{1})([0-9]{1})/);
          , courseTutorialRegex = new RegExp(/(T|P)[0-9]{4}/);
          , courseSectionRegex  = new RegExp(/(L)([0-9]{4})/);
          , courseTermRegex     = new RegExp(/(F|S|Y)/);
          , courseWaitListRegex = new RegExp(/Y|N/);
          , coursesJSON         = [];

        // Get the course code from the page markup
        $('tr').each(function(foundCourse) {
          // Lock iteration legnth for development and testing purposes
          if(foundCourse < 1000) {
            var currentRow = $(this);
              , section = currentRow.children().last();
              , courseSect = [];
              , count = 0;

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
              var courseSections   = [];
              var courseProfessors = [];

              courseSections.push(section.text().toString());

              /* There may be multiple profs for one course
                 section, if so, parse and append them */
              (courseProfessor.text().toString().indexOf('/') > -1)
                ? courseProfessors = courseProfessor.text().toString().split('/')
                : courseProfessors.push(courseProfessor.text().toString());

              course = {
                courseName: courseName.text().toString(),
                courseCode: courseCode.text().toString(),
                courseTerm: courseTerm.text().toString(),
                courseWait: courseWait.text().toString(),
                courseSect: courseSections,
                courseProf: courseProfessors
              };

              coursesJSON.push(course);
              console.log(JSON.stringify(course));
          };
        });
      };
      callback(null, coursesJSON);
    });
  });
};

getProgramCourses('env', function(err, courses) {
  console.log(courses);
});
