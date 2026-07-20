const fs = require('fs');
let code = fs.readFileSync('google-apps-script.js', 'utf8');

// 1. Add opsDistributions to handleGet
const target1 = `  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    config: { operators: operators },
    distributions: distributions
  })).setMimeType(ContentService.MimeType.JSON);`;

const replacement1 = `  var opsDistributions = [];
  var sheetOps = ss.getSheetByName("DATA_OPS");
  if (sheetOps) {
    var opsData = sheetOps.getDataRange().getValues();
    if (opsData.length > 1) {
      for (var k = 1; k < opsData.length; k++) {
        var row = opsData[k];
        opsDistributions.push({
          id: k,
          dist_date: row[0],
          operator_name: row[1],
          nama_sppg: row[2],
          harga_beli: row[3],
          harga_jual: row[4],
          pm: row[5],
          pagu_ops: row[6],
          sisa_pagu_ops: row[7],
          margin_ops: row[8],
          file_ops_url: row[9],
          timestamp: row[10]
        });
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    config: { operators: operators },
    distributions: distributions,
    opsDistributions: opsDistributions
  })).setMimeType(ContentService.MimeType.JSON);`;

code = code.replace(target1, replacement1);

// 2. Add submit_ops and delete_ops to handlePost
const target2 = `  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetDist = ss.getSheetByName("DATA_DISTRIBUSI");`;

const replacement2 = `  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetDist = ss.getSheetByName("DATA_DISTRIBUSI");

  if (action === 'delete_ops') {
    var sheetOps = ss.getSheetByName("DATA_OPS");
    var id = parseInt(params.id, 10);
    if (sheetOps && id > 0) {
      sheetOps.deleteRow(id + 1);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid ID or Sheet' })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'submit_ops') {
    var sheetOps = ss.getSheetByName("DATA_OPS");
    if (!sheetOps) {
      sheetOps = ss.insertSheet("DATA_OPS");
    }
    if (sheetOps.getLastRow() === 0) {
      sheetOps.appendRow([
        "TANGGAL", "OPERATOR", "NAMA SPPG", "HARGA BELI", "HARGA JUAL", "PM", "PAGU OPS", "SISA PAGU OPS", "MARGIN OPS", "FILE OPS", "WAKTU UPLOAD"
      ]);
    }

    var file_ops = params.file_ops;
    var file_ops_url = "";
    if (params.dist_date && params.operator_name && file_ops) {
      try {
        var dateObj = new Date(params.dist_date);
        var year = dateObj.getFullYear().toString();
        var monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        var month = monthNames[dateObj.getMonth()];
        var dateStr = ("0" + dateObj.getDate()).slice(-2);
        
        var targetFolder = getOrCreateFolderPath(year, month, dateStr, "OPS_" + params.operator_name);
        file_ops_url = uploadFile(file_ops, "OPS_" + params.operator_name + "_" + params.dist_date + ".pdf", targetFolder);
      } catch (err) {
        file_ops_url = "ERROR: " + err.toString();
      }
    }

    sheetOps.appendRow([
      params.dist_date || "",
      params.operator_name || "",
      params.nama_sppg || "",
      params.harga_beli || "",
      params.harga_jual || "",
      params.pm || "",
      params.pagu_ops || "",
      params.sisa_pagu_ops || "",
      params.margin_ops || "",
      file_ops_url,
      new Date()
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);
  }`;

code = code.replace(target2, replacement2);

fs.writeFileSync('google-apps-script.js', code);
