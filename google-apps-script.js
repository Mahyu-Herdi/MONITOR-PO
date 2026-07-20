function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    if (method === 'GET') {
      return handleGet(e);
    } else {
      return handlePost(e);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString(),
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetConfig = ss.getSheetByName("CONFIG_OPERATOR");
  
  // Buat sheet CONFIG_OPERATOR otomatis jika belum ada
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet("CONFIG_OPERATOR");
    sheetConfig.appendRow(["OPERATOR_NAME", "DAPURS (Pisahkan dengan koma)"]);
  }

  var data = sheetConfig.getDataRange().getValues();
  var operators = [];
  
  for (var i = 1; i < data.length; i++) {
    var name = data[i][0];
    var dapurs = data[i][1];
    if (name) {
      operators.push({
        name: name,
        dapurs: dapurs ? dapurs.split(',').map(function(s) { return s.trim(); }).filter(String) : []
      });
    }
  }
  
  var distributions = [];
  var sheetDist = ss.getSheetByName("DATA_DISTRIBUSI");
  if (sheetDist) {
    var distData = sheetDist.getDataRange().getValues();
    if (distData.length > 1) {
      for (var j = 1; j < distData.length; j++) {
        var row = distData[j];
        distributions.push({
          id: j,
          dist_date: row[0],
          operator_name: row[1],
          dapur_name: row[2],
          pagu: row[3],
          po_sppg: row[4],
          po_koperasi: row[5],
          po_supplier: row[6],
          file_sppg_url: row[7],
          file_koperasi_url: row[8],
          file_supplier_url: row[9],
          pm: row[10],
          timestamp: row[11]
        });
      }
    }
  }
  
  var opsDistributions = [];
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
  })).setMimeType(ContentService.MimeType.JSON);
}

function handlePost(e) {
  var params = e.parameter;
  var action = params.action;

  if (action === 'app_login') {
    if (params.password === 'kantormap2026') {
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Sandi aplikasi salah!' })).setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'login') {
    if (params.password === 'superadmin123') {
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Password admin salah!' })).setMimeType(ContentService.MimeType.JSON);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
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
  }

  if (action === 'delete') {
    var id = parseInt(params.id, 10);
    if (sheetDist && id > 0) {
      sheetDist.deleteRow(id + 1);
      updateDashboard(ss);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid ID or Sheet' })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'update') {
    var id = parseInt(params.id, 10);
    if (sheetDist && id > 0) {
      sheetDist.getRange(id + 1, 4).setValue(params.pagu);
      sheetDist.getRange(id + 1, 5).setValue(params.po_sppg);
      sheetDist.getRange(id + 1, 6).setValue(params.po_koperasi);
      sheetDist.getRange(id + 1, 7).setValue(params.po_supplier);
      sheetDist.getRange(id + 1, 11).setValue(params.pm);
      updateDashboard(ss);
      return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid ID or Sheet' })).setMimeType(ContentService.MimeType.JSON);
  }

  var operator_name = params.operator_name || "";
  var dapur_name = params.dapur_name || "";
  var dist_date = params.dist_date || ""; // Format: YYYY-MM-DD
  var pagu = params.pagu || "";
  var po_sppg = params.po_sppg || "";
  var po_koperasi = params.po_koperasi || "";
  var po_supplier = params.po_supplier || "";
  var pm = params.pm || "";
  
  var file_sppg = params.file_sppg; // Base64
  var file_koperasi = params.file_koperasi; // Base64
  var file_supplier = params.file_supplier; // Base64
  
  var file_sppg_url = "";
  var file_koperasi_url = "";
  var file_supplier_url = "";

  // Parsing tanggal untuk nama folder (Tahun -> Bulan -> Tanggal -> Dapur)
  if (dist_date && dapur_name) {
    try {
      var dateObj = new Date(dist_date);
      var year = dateObj.getFullYear().toString();
      var monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      var month = monthNames[dateObj.getMonth()];
      var dateStr = ("0" + dateObj.getDate()).slice(-2);
      
      // Ambil folder untuk Dapur berdasarkan tanggal
      var targetFolder = getOrCreateFolderPath(year, month, dateStr, dapur_name);
      
      // Upload file jika ada
      if (file_sppg) file_sppg_url = uploadFile(file_sppg, "SPPG_" + dapur_name + "_" + dist_date + ".pdf", targetFolder);
      if (file_koperasi) file_koperasi_url = uploadFile(file_koperasi, "KOPERASI_" + dapur_name + "_" + dist_date + ".pdf", targetFolder);
      if (file_supplier) file_supplier_url = uploadFile(file_supplier, "SUPPLIER_" + dapur_name + "_" + dist_date + ".pdf", targetFolder);
    } catch (err) {
      file_sppg_url = "ERROR: " + err.toString();
      file_koperasi_url = "ERROR: " + err.toString();
      file_supplier_url = "ERROR: " + err.toString();
    }
  }

  // Menulis ke Sheet DATA_DISTRIBUSI
  // Buat sheet DATA_DISTRIBUSI otomatis jika belum ada
  if (!sheetDist) {
    sheetDist = ss.insertSheet("DATA_DISTRIBUSI");
  }
  
  // Buat Header otomatis jika sheet kosong
  if (sheetDist.getLastRow() === 0) {
    sheetDist.appendRow([
      "TANGGAL", "OPERATOR", "DAPUR", "PAGU", "PO SPPG", "PO KOPERASI", "PO SUPPLIER", 
      "FILE SPPG", "FILE KOPERASI", "FILE SUPPLIER", "PM", "WAKTU UPLOAD"
    ]);
  }
  
  sheetDist.appendRow([
    dist_date,
    operator_name,
    dapur_name,
    pagu,
    po_sppg,
    po_koperasi,
    po_supplier,
    file_sppg_url,
    file_koperasi_url,
    file_supplier_url,
    pm,
    new Date()
  ]);
  
  updateDashboard(ss);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success'
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateDashboard(ss) {
  var sheetDist = ss.getSheetByName("DATA_DISTRIBUSI");
  var sheetDash = ss.getSheetByName("DASHBOARD");
  
  // Create DASHBOARD sheet if it doesn't exist
  if (!sheetDash) {
    sheetDash = ss.insertSheet("DASHBOARD");
    sheetDash.appendRow(["DAPUR", "TOTAL PAGU", "TOTAL PO SPP", "TOTAL PO KOP", "TOTAL PO SUP", "TOTAL PM", "MARGIN UTAMA", "MARGIN KOPE", "MARGIN YAYASAN"]);
  }
  
  if (!sheetDist) return;

  var data = sheetDist.getDataRange().getValues();
  if (data.length <= 1) return;

  var headers = data[0];
  var dapurIdx = headers.indexOf("DAPUR");
  var paguIdx = headers.indexOf("PAGU");
  var poSppgIdx = headers.indexOf("PO SPPG");
  var poKoperasiIdx = headers.indexOf("PO KOPERASI");
  var poSupplierIdx = headers.indexOf("PO SUPPLIER");
  var pmIdx = headers.indexOf("PM");

  var summary = {};
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var dapur = row[dapurIdx];
    if (!dapur) continue;

    if (!summary[dapur]) {
      summary[dapur] = { pagu: 0, poSppg: 0, poKoperasi: 0, poSupplier: 0, pm: 0 };
    }
    summary[dapur].pagu += Number(row[paguIdx]) || 0;
    summary[dapur].poSppg += Number(row[poSppgIdx]) || 0;
    summary[dapur].poKoperasi += Number(row[poKoperasiIdx]) || 0;
    summary[dapur].poSupplier += Number(row[poSupplierIdx]) || 0;
    summary[dapur].pm += Number(row[pmIdx]) || 0;
  }

  var dashData = [];
  for (var dapur in summary) {
    var s = summary[dapur];
    // Formula untuk Margin:
    // MARGIN UTAMA = PO SPPG - PO SUPPLIER
    // MARGIN KOPERASI = PO SPPG - PO KOPERASI
    // MARGIN YAYASAN = PO KOPERASI - PO SUPPLIER
    dashData.push([
      dapur,
      s.pagu,
      s.poSppg,
      s.poKoperasi,
      s.poSupplier,
      s.pm,
      s.poSppg - s.poSupplier, // Margin Utama
      s.poSppg - s.poKoperasi, // Margin Koperasi
      s.poKoperasi - s.poSupplier // Margin Yayasan
    ]);
  }

  var lastRow = sheetDash.getLastRow();
  if (lastRow > 1) {
    sheetDash.getRange(2, 1, lastRow - 1, 9).clearContent();
  }

  if (dashData.length > 0) {
    sheetDash.getRange(2, 1, dashData.length, dashData[0].length).setValues(dashData);
  }
}

function authorizeDrive() {
  // Jalankan fungsi ini sekali dari editor Apps Script untuk memancing popup otorisasi Google Drive
  DriveApp.getRootFolder();
}

function uploadFile(base64Data, filename, folder) {
  if (!base64Data) return "";
  try {
    var parts = base64Data.split(',');
    var base64 = parts[1] || parts[0]; 
    var mimeType = "application/pdf";
    if (parts[0] && parts[0].indexOf('data:') === 0) {
      mimeType = parts[0].split(';')[0].substring(5);
    }
    var blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, filename);
    var file = folder.createFile(blob);
    
    // Set file agar bisa dilihat oleh siapa saja yang memiliki link (opsional, agar link bisa dibuka)
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {
      // Abaikan jika gagal set sharing
    }
    
    return file.getUrl();
  } catch (e) {
    return "UPLOAD_FAILED: " + e.toString();
  }
}

function getOrCreateFolderPath(year, month, dateStr, dapur) {
  // Membuat folder Root di sebelah Spreadsheet untuk menghindari Access Denied di beberapa kasus
  var baseFolder = getSpreadsheetFolder();
  var rootFolder = getOrCreateSubFolder(baseFolder, "MONITOR_PO_UPLOADS");
  var yearFolder = getOrCreateSubFolder(rootFolder, year);
  var monthFolder = getOrCreateSubFolder(yearFolder, month);
  var dateFolder = getOrCreateSubFolder(monthFolder, dateStr);
  var dapurFolder = getOrCreateSubFolder(dateFolder, dapur);
  return dapurFolder;
}

function getSpreadsheetFolder() {
  try {
    // Menggunakan ID folder yang disepakati: 1P-H9Fb1TwpkE5pZO6bzL1ToD__1o95nf
    return DriveApp.getFolderById("1P-H9Fb1TwpkE5pZO6bzL1ToD__1o95nf");
  } catch (e) {
    // Fallback jika tidak punya akses baca folder
    return DriveApp.getRootFolder();
  }
}

function getOrCreateSubFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}
