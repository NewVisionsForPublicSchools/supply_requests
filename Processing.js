function getRequestsByRole(){
  var test, user, userQuery, roles, keys, requests;
  
//  user = 'approver1@newvisions.org';
  user = Session.getActiveUser().getEmail();
  userQuery = 'SELECT * FROM users WHERE username = "' + user + '"'; 
  roles = NVGAS.getSqlRecords(dbString, userQuery).map(function(e){
    return e.roles;
  });
  
  requests = roles.map(function(e){
    var query = 'SELECT * FROM Requests r INNER JOIN Tracking t on r.request_id = t.request_id WHERE t.queue = "'
      + e + '"';
    return NVGAS.getSqlRecords(dbString, query);
  }).reduce(function(e){
    return e;
  });
  
  return requests;
  debugger;
}



function getRequestActionItems(){
  var test, queue, nr, tbf, html;
  
  queue = getRequestsByRole();
  nr = queue.filter(function(e){
    return e.status == 'New';
  });
  tbf = queue.filter(function(e){
    return e.status == "Approved";
  });
  
  html = HtmlService.createTemplateFromFile('action_items');
  html.newClass = nr.length > 0 ? 'nvRed' : 'nvGreen';
  html.fulfillClass = tbf.length > 0 ? 'nvRed' : 'nvGreen';
  html.nr = nr.length;
  html.tbf = tbf.length;
  return html.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();
}