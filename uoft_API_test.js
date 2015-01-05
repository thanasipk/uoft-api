const
   uoftAPI = require('./uoft_API.js')
 , helper  = require('./helper.js');

/*************************************
        API FUNCTION TESTS
/*************************************
*************************************
--Core Functions--
getCourseCodes          --
getCourseInfo           --
getCourseDepartment     -- IN-PROGRESS; MUST ASSERT
getProgramCourses       --

--Helper Functions--
getProgramURL           -- IN-PROGRESS; MUST ASSERT
getProgramURLs          -- IN-PROGRESS; MUST ASSERT
*************************************/

/*************************************
  Tests: getCourseDepartment
*************************************/
// Case: Course code has all courses in one department
// Returns: Array of a single department name string
uoftAPI.getCourseDepartment('csc', function(err, departments) {
  console.log(departments);
});

// Case: Course code has courses in multiple departments
// Returns: Array of each department names as a string
uoftAPI.getCourseDepartment('env', function(err, departments) {
  console.log(departments);
});

// Case: Get all departments (no course code)
// Returns: Array of all department names as strings
uoftAPI.getCourseDepartment('', function(err, departments) {
  console.log(departments);
});

// Case: Invalid course code (not 3-letter)
// Returns: Empty array (fails silently)
uoftAPI.getCourseDepartment('phil', function(err, departments) {
  console.log(departments);
});

/*************************************
  Tests: getProgramCourses
*************************************/
/*************************************
  Tests: getCourseInfo
*************************************/
/*************************************
  Tests: getCourseCodes
*************************************/
/*************************************
Tests: getProgramURL
*************************************/
// Case: Valid course code with all courses in one department.
// Returns: A string of the link specific to the department only.
helper.getProgramURL('csc', function(err, linkJSON) {
  console.log(linkJSON.link);
});

// Case: Valid course code with courses in multiple departments.
// Returns: A string of the link specific to the department only.
helper.getProgramURL('env', function(err, linkJSON) {
  console.log(linkJSON.link);
});

// Case: Invalid course code.
// Returns: An JSON object with an empty link attribute (fails silently).
uoftAPI.getProgramURL('csca', function(err, linkJSON) {
  console.log(linkJSON.link);
});

/*************************************
Tests: getProgramURL
*************************************/
// Case: Regular function call.
// Returns: An array of strings containing the course list links.
helper.getProgramURL(function(err, linkJSON) {
  console.log(linkJSON.link);
});
