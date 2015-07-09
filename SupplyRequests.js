var dbString = '//ga-sql-bootcamp:demodb0615/Supply_Requests';
var requestColumns = 'request_id,full_name,item,qty,priority,description,date,username';
var trackingColumns = 'request_id,status,confirmation,bus_mgr_alert,dso_alert,principal_alert,cmo_alert,approval,denial';



function addRequest(formObj){
  var nextId = PropertiesService.getScriptProperties().getProperty('nextReqId')
  var request = formObj;
  request.date = new Date();
  request.username = Session.getActiveUser().getEmail();
  request.id = "AMS4SR" + nextId.toString();
  request.status = "New";
  
  var reqQuery = 'INSERT INTO Requests(' + requestColumns + ') values("' 
            + request.id + '", "'
            + request.fullName + '","'
            + request.item + '", "'
            + request.qty + '", "'
            + request.priority + '", "'
            + request.description + '", "'
            + request.date + '", "'
            + request.username + '")';
  
  var trackQuery = 'INSERT INTO Tracking(request_id,status) values("' 
            + request.id + '", "'
            + request.status + '")';
  
  NVGAS.insertSqlRecord(dbString, [reqQuery, trackQuery]);
  PropertiesService.getScriptProperties().setProperty('nextReqId', (Number(nextId) + 1).toString());
  sendConfirmation(request);
  sendBusMgrAlert(request);
}



function sendConfirmation(request){
  var test, recipient, subject, html, template;
  
  recipient = request.username;
  subject = "DO NOT REPLY: Supply Request Confirmation | " + request.id;
  html = HtmlService.createTemplateFromFile('confirmation_email');
  html.request = request;
  template = html.evaluate().getContent();
  
  GmailApp.sendEmail(recipient, subject,"",{htmlBody: template});
  
  debugger;
}



function sendBusMgrAlert(request){
  var test, recipient, subject, html, template;
  
  recipient = PropertiesService.getScriptProperties().getProperty('busMgr');
  subject = request.qty + " " + request.item + " | Request Submitted | " + request.id
  html = HtmlService.createTemplateFromFile('busMgr_alert_email');
  html.request = request;
  html.url = PropertiesService.getScriptProperties().getProperty('scriptUrl');
  template = html.evaluate().getContent();
  
  GmailApp.sendEmail(recipient, subject,"",{htmlBody: template});
}