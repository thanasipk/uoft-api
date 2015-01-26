// var main = require('../index.js');

exports.testGetAllCourseDepartments = {
  testGetsAllDepartments : function(test){
    test.done();
  }
};

exports.testGetCourseDepartment = {
  testGetsSingleAssociatedDepartment : function(test) {
    test.done();
  },
  testGetsManyAssociatedDepartment : function(test) {
    test.done();
  },
  testFailsOnBadCourseCode : function(test) {
    test.done();
  }
};

exports.testGetProgramCourses = {
  testIncludesCancelledCourses : function(test){
    test.done();
  },
  testDoesNotIncludeCancelledCourses : function(test){
    test.done();
  }
};
