function loadFulfillForm(request_id){
  var test, html;
  Logger.log(request_id)
  html = HtmlService.createTemplateFromFile('fulfill_form');
  html.request = getRequest(request_id);
  html.approver = Session.getActiveUser().getEmail();
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();
}



function loadToBeFulfilled(){
  var test, queue, data, html;
  
  queue = JSON.parse(CacheService.getUserCache().get('roleRequests'))
  data = queue.filter(function(e){
    return (e.status == 'Approved') || (e.status =='Ordered') || (e.status =='Received');
  });
  
  html = HtmlService.createTemplateFromFile('to_be_fulfilled_table');
  html.data = data;
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();  
}



function processTbf(tbfObj){
  var test, status, request, query, queryArray, statusQuery, html;

  queryArray = [];
  status = tbfObj.status;
  request = tbfObj.request_id;
  query = 'UPDATE Tracking SET status = "' + status + '" WHERE request_id = "' + request + '"';
  queryArray.push(query);
  
  switch(status){
    case 'Ordered':
      statusQuery = 'UPDATE Tracking SET ordered = "' + new Date() + '" WHERE request_id = "' + request + '"';
      sendOrderedEmail(request);
      break;
      
    case 'Received':
      statusQuery = 'UPDATE Tracking SET received = "' + new Date() + '" WHERE request_id = "' + request + '"';
      sendReceivedEmail(request);
      break;
      
    case 'Fulfilled':
      statusQuery = 'UPDATE Tracking SET fulfilled = "' + new Date() + '", queue = "" WHERE request_id = "' + request + '"';
      sendFulfilledEmail(request);
      break;
      
    default:
      break;
  }
  
  queryArray.push(statusQuery);
  NVGAS.insertSqlRecord(dbString, queryArray);
  
  html = HtmlService.createTemplateFromFile('to_be_fulfilled_confirmation');
  html.request = request;
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();
}



function sendOrderedEmail(request_id){
  var test;
  
//  request = getRequest(request_id);
//  recipient = request.username;
//  subject = "DO NOT REPLY: Supply Request Ordered | " + request.request_id;
//  html = HtmlService.createTemplateFromFile('ordered_email');
//  html.request = request;
//  template = html.evaluate().getContent();
//  ccQuery = 'SELECT username FROM users WHERE roles LIKE "%DSO%" OR roles LIKE "%BM%"';
//  copyList = NVGAS.getSqlRecords(dbString, ccQuery).map(function(e){
//    return e.username;
//  }).join();
//  
//  GmailApp.sendEmail(recipient, subject,"",{htmlBody: template,
//                                            cc: copyList});
}



function sendReceivedEmail(request_id){
  
}



function sendFulfilledEmail(request_id){
  
}