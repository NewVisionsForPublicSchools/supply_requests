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
  PropertiesService.getScriptProperties().setProperty('nextReqId', (Number(nextId) + 1).toString());
//  sendConfirmation(request);
}



function sendConfirmation(request){
  var test, recipient, subject, html, template;
  
  recipient = request.username;
  subject = "DO NOT REPLY: Supply Request Confirmation | " + request.id;
  html = HtmlService.createTemplateFromFile('confirmation_email');
  html.data = request;
  template = html.evaluate().getContent();
  
  GmailApp.sendEmail(recipient, subject,"",{htmlBody: template});
  
  debugger;
}