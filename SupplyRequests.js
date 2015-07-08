var dbString = '//ga-sql-bootcamp:demodb0615/Supply_Requests';
var requestColumns = 'request_id,full_name,item,qty,priority,description,date,status,username';



function addRequest(formObj){
  var nextId = PropertiesService.getScriptProperties().getProperty('nextReqId')
  var request = formObj;
  request.date = new Date();
  request.username = Session.getActiveUser().getEmail();
  request.id = "AMS4SR" + nextId.toString();
  request.status = "New";
  
  var query = 'INSERT INTO Requests(' + requestColumns + ') values("' 
            + request.id + '", "'
            + request.fullName + '","'
            + request.item + '", "'
            + request.qty + '", "'
            + request.priority + '", "'
            + request.description + '", "'
            + request.date + '", "'
            + request.status + '", "'
            + request.username + '")';
  
  NVGAS.insertSqlRecord(dbString, [query]);
  PropertiesService.getScriptProperties().setProperty('nextReqId', (Number(nextId) + 1).toString())
  return HtmlService.createTemplateFromFile('request_confirmation').evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();
}