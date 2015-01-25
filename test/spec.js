// var main = require('../index.js');

exports.testGetAllCourseDepartments = {
  testGetAllDepartments : function(test){
    test.done();
  }
};

exports.testGetCourseDepartment = {
  testSingleAssociatedDepartment : function(test) {
    test.done();
  },
  testManyAssociatedDepartment : function(test) {
    test.done();
  },
  testBadCourseCode : function(test) {
    test.done();
  }
};

exports.testGetProgramCourses = {
  testIncludeCancelledCourses : function(test){
    test.done();
  },
  testNotIncludeCancelledCourses : function(test){
    test.done();
  }
};
