function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Лист1");
  sheet.appendRow([
    e.parameter.fullname,
    e.parameter.score,
    e.parameter.q11,
    e.parameter.q12,
    e.parameter.q13,
    e.parameter.q14,
    e.parameter.q15,
    new Date()
  ]);
  return ContentService.createTextOutput("OK");
}