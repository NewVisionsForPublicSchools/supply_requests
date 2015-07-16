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
    return e.status == 'Approved';
  });
  
  html = HtmlService.createTemplateFromFile('to_be_fulfilled_table');
  html.data = data;
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();  
}