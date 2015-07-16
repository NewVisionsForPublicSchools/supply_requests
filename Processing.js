var dbString = PropertiesService.getScriptProperties().getProperty('DBSTRING');



function getRequestsByRole(){
  var test, user, userQuery, roles, keys, requests;
  
//  user = 'approver1@newvisions.org';
  user = Session.getActiveUser().getEmail();
  userQuery = 'SELECT roles FROM users WHERE username = "' + user + '"'; 
  roles = NVGAS.getSqlRecords(dbString, userQuery).map(function(e){
    return e.roles;
  });
 
  requests = JSON.stringify(roles.map(function(e){
    var query = 'SELECT * FROM Requests r INNER JOIN Tracking t on r.request_id = t.request_id WHERE t.queue = "'
      + e + '"';
    return NVGAS.getSqlRecords(dbString, query);
  }).reduce(function(e){
    return e;
  }));

  CacheService.getUserCache().put('roleRequests', requests);
  return requests;
}



function getRequestActionItems(){
  var test, queue, nr, tbf, html;
  
  queue = JSON.parse(getRequestsByRole());
  nr = queue.filter(function(e){
    return (e.status == 'New') || (e.status == 'Under Review');
  });
  debugger;
  tbf = queue.filter(function(e){
    return e.status == "Approved";
  });
  debugger;
  html = HtmlService.createTemplateFromFile('action_items');
  html.newClass = nr.length > 0 ? 'nvRed' : 'nvGreen';
  html.fulfillClass = tbf.length > 0 ? 'nvRed' : 'nvGreen';
  html.nr = nr.length;
  html.tbf = tbf.length;
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();
}



function loadNewRequests(){
  var test, queue, data, html;
  
  queue = JSON.parse(CacheService.getUserCache().get('roleRequests')) || getRequestsByRole();
  data = queue.filter(function(e){
    return (e.status == 'New') || (e.status == 'Under Review');
  });
  
  html = HtmlService.createTemplateFromFile('new_requests_table');
  html.data = data;
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();  
}



function loadToBeFulfilled(){
  var test, queue, data, html;
  
  queue = JSON.parse(CacheService.getUserCache().get('roleRequests'))
  data = queue.filter(function(e){
    return e.status == 'Approved';
  });
  
  html = HtmlService.createTemplateFromFile('to_be_fulfilled_table');
  html.data = data;
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();  
}



function loadNewReqForm(request_id){
  var test, html;
  Logger.log(request_id)
  html = HtmlService.createTemplateFromFile('new_request_form');
  html.request = getRequest(request_id);
  html.approver = Session.getActiveUser().getEmail();
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();
}



function processNewRequest(formObj){
  var test, queryArray, rQuery, aQuery, html, approverAlert, newQueue;
  
  queryArray = [];
  rQuery = 'UPDATE Requests r, Tracking t SET r.cost = "' + formObj.cost + '", t.status = "' + formObj.status
           + '", t.resolution = "' + formObj.resolution + '", t.approver = "' + formObj.approver
           + '" WHERE r.request_id = "' + formObj.request_id + '" AND t.request_id = r.request_id';
  queryArray.push(rQuery);
  
  switch(formObj.status){
    case 'Approved':
      aQuery = 'UPDATE Tracking SET approval = "' + new Date() + '" WHERE request_id = "' + formObj.request_id + '"';
      queryArray.push(aQuery);
      break;
      
    case 'Denied':
      aQuery = 'UPDATE Tracking SET denial = "' + new Date() + '", queue = "" WHERE request_id = "' + formObj.request_id + '"';
      queryArray.push(aQuery);
      break;
      
    case 'Under Review':
      approverAlert = (formObj.cost >= 1000) && (formObj.cost < 10000) ? "dso_alert" : (formObj.cost >= 10000) ? "principal_alert" : "bus_mgr_alert";
      newQueue = (formObj.cost >= 1000) && (formObj.cost < 10000) ? "DSO" : (formObj.cost >= 10000) ? "P" : "BM";
      aQuery = 'UPDATE Tracking SET ' + approverAlert + ' = "' + new Date() + '", queue = "' + newQueue
               + '" WHERE request_id = "' + formObj.request_id + '"';
      queryArray.push(aQuery);
      break;
      
    default:
      break;
  }
 
  NVGAS.insertSqlRecord(dbString, queryArray);
  checkApprovalStatus(formObj);
  
  html = HtmlService.createTemplateFromFile('process_new_request_confirmation');
  html.request = formObj.request_id;
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();
}



function checkApprovalStatus(approvalObj){
  var test, status, request;
  
  status = approvalObj.status;
  request = approvalObj.request_id;
  
  switch (status){
    case 'Approved':
      sendApprovalEmail(request);
      break;
      
    case 'Denied':
      sendDenialEmail(request);
      break;
      
    case 'Under Review':
      sendProcessNotificationEmail(request);
      break;
      
    default:
      break;
  } 
}



function sendApprovalEmail(request_id){
  var test, request, recipient, subject, html, template, copyList;
  
  request = getRequest(request_id);
  recipient = request.username;
  subject = "DO NOT REPLY: Supply Request Approved | " + request.request_id;
  html = HtmlService.createTemplateFromFile('approval_email');
  html.request = request;
  template = html.evaluate().getContent();
  copyList = PropertiesService.getScriptProperties().getProperty('busMgr') + ","
             + PropertiesService.getScriptProperties().getProperty('dso');
  
  GmailApp.sendEmail(recipient, subject,"",{htmlBody: template,
                                            cc: copyList});
}



function sendDenialEmail(request_id){
  var test, request, recipient, subject, html, template, copyList;
  
  request = getRequest(request_id);
  recipient = request.username;
  subject = "DO NOT REPLY: Supply Request Denied | " + request.request_id;
  html = HtmlService.createTemplateFromFile('denial_email');
  html.request = request;
  template = html.evaluate().getContent();
  copyList = PropertiesService.getScriptProperties().getProperty('busMgr') + ","
             + PropertiesService.getScriptProperties().getProperty('dso');
  
  GmailApp.sendEmail(recipient, subject,"",{htmlBody: template,
                                            cc: copyList});
}



function sendProcessNotificationEmail(request_id){
  var test, request, recipientQuery, recipients, subject, html, template, ccQuery, copyList;
  
  request = getRequest(request_id);
  recipientQuery = 'SELECT username FROM users WHERE roles LIKE "%' + request.queue + '%"';
  recipients = NVGAS.getSqlRecords(dbString, recipientQuery).map(function(e){
    return e.username;
  }).join();
  subject = "DO NOT REPLY: Supply Request Approval Needed | " + request.request_id;
  html = HtmlService.createTemplateFromFile('needs_approval_email');
  html.request = request;
  html.url = PropertiesService.getScriptProperties().getProperty('scriptUrl');
  template = html.evaluate().getContent();
  ccQuery = 'SELECT username FROM users WHERE roles LIKE "%BM%"';
  copyList = NVGAS.getSqlRecords(dbString, ccQuery).map(function(e){
    return e.username;
  }).join();
  
  GmailApp.sendEmail(recipients, subject,"",{htmlBody: template,
                                            cc: copyList});
}