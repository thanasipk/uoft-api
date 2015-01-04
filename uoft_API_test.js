var uoftAPI = require('./uoft_API.js');

/*************************************
        API FUNCTION TESTS
/*************************************
*************************************
getCourseCodes          --
getCourseInfo           --
getCourseDepartment     -- IN-PROGRESS; MUST ASSERT
getProgramCourses       --
getProgramURL           -- IN-PROGRESS; MUST ASSERT
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
// Returns: A JSON object with a link specific to the department only.
uoftAPI.getProgramURL('csc', function(err, linkJSON) {
  console.log(linkJSON.link);
});

// Case: Valid course code with courses in multiple departments.
// Returns: A JSON object with a link specific to the department only.
uoftAPI.getProgramURL('env', function(err, linkJSON) {
  console.log(linkJSON.link);
});

// Case: Invalid course code.
// Returns: An JSON object with an empty link attribute (fails silently).
uoftAPI.getProgramURL('env', function(err, linkJSON) {
  console.log(linkJSON.link);
});
