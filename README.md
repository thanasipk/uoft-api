# UofT Course Data API
A Node.js module for interacting with the University of Toronto's course listings.

##### Disclaimer
Please be aware that this module relies on web scrapers to retrieve the data from the University of Toronto course listings. I cannot control how you incorporate this module into your project, and so by using this module you agree that the developer(s) of this module are in no way responsible for any consequences that may (or may not) result because of your use of this module.

#### Getting Started
##### Install:
```sh
$ npm i uoft-api
```
##### Reference:
```js
var uoftAPI = require('uoft-api');
```

### Supported Functions
- `getCourseDepartment`
- `getProgramCourses`

##### `getCourseDepartment`
##### Number of Requests:
- Each call of `getProgramCourses` performs 2 requests to retrieve all course data for a single program.

##### Usage:
```js
uoftAPI.getCourseDepartment(programCode, function(err, department) {
  // do whatever with the course department array
});
```
##### Examples
```js
uoftAPI.getCourseDepartment('csc', function(err, department) {
  console.log(department);
  /* ['Computer Science'] */
});
```
```js
uoftAPI.getCourseDepartment('env', function(err, department) {
  console.log(department);
  // ['Computer Science']
});
```

##### `getProgramCourses`
##### Number of Requests:
- Each call of `getProgramCourses` performs 2 requests to retrieve all course data for a single program.

##### Usage:
```js
uoftAPI.getProgramCourses(programCode, function(err, courseData) {
  // do whatever with the returned courseData json
});
```
##### Examples
```js
uoftAPI.getProgramCourses('csc', function(err, courseData) {
  console.log(courseData);
  /*
  [
    {

    },
    < ... etc ... >
    {

    }
  ]
*/
});
```

### Function Addition Roadmap
- Extending `getProgramCourses` to include the lecture and tutorial sections of each respective class in their own arrays.
- Extending `getProgramCourses` to include when each tutorial and lecture section takes place (day of the week and time).
- Extending the module to support course data from the University of Toronto Mississauga and Scarborough campus time-tables.
- Extending the module to support course data from the St. George campus Faculty of Engineering.
