var PAGETITLE = PropertiesService.getScriptProperties().getProperty('pageTitle');



function doGet() {
  return HtmlService
      .createTemplateFromFile('home')
      .evaluate()
      .setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle(PAGETITLE);
}



function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .getContent();
}
