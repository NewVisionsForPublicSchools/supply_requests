function addRequest(formObj){
  var request = formObj;
  request.date = new Date();
  request.username = Session.getActiveUser().getEmail();
  
  NVGAS.insertSqlRecord(dbString, queryArray);
  Logger.log(request);
}