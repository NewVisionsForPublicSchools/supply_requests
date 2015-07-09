var dbString = '//ga-sql-bootcamp:demodb0615/Supply_Requests';
var userColumns = 'username,roles';



function validateUser(){
  var test, currentUser, query, validUser, result;
  
  currentUser = 'approver1@newvisions.org'
//  currentUser = Session.getActiveUser().getEmail();
  query = 'SELECT * FROM users';
  
  validUser = NVGAS.getSqlRecords(dbString, query).map(function(e){
    return e.username;
  }).filter(function(e){
    return e == currentUser;
  })[0];
 
  return validUser ? 1 : 0;
}