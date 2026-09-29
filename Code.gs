/**
 * FEU ALABANG RECEPTION PORTAL
 * Google Apps Script Backend
 *
 * Compatible with the current index-3.html cloud-sync system.
 *
 * Google Sheet structure:
 * Sheet name: PortalData
 * Column A: Key
 * Column B: Value
 * Column C: Updated At
 *
 * Supported actions:
 * GET ?action=read&token=TOKEN&callback=CALLBACK
 * POST action=upsert&token=TOKEN&key=KEY&value=JSON
 * POST action=delete&token=TOKEN&key=KEY
 */

// ============================================================
// CONFIGURATION
// ============================================================

// IMPORTANT:
// Use the SAME token in index-3.html.
//
// Example:
// FEU-ALABANG-RECEPTION-2026-9X7K2M
//
// Change this before deployment.
const SHARED_TOKEN = 'FEU-ALABANG-RECEPTION-2026-9X7K2M';

const SHEET_NAME = 'PortalData';

const ALLOWED_KEYS = new Set([
  'reception_users',
  'reception_activity_logs',
  'reception_time_sheet',
  'reception_standard_tasks',
  'reception_tasks_date',
  'reception_task_history',
  'reception_deliveries',
  'reception_keys',
  'reception_contacts',
  'reception_handover_notes',
  'reception_custom_qa',
  'reception_duty_config',
  'reception_sidebar_notes'
]);


// ============================================================
// MAIN GET REQUEST
// Used by the portal's JSONP googleRead() function.
// ============================================================

function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};

    const action = String(params.action || '').trim();
    const token = String(params.token || '').trim();
    const callback = String(params.callback || '').trim();

    // Security check
    if (!isValidToken(token)) {
      return jsonResponse(
        {
          ok: false,
          error: 'Unauthorized'
        },
        callback
      );
    }

    // READ ALL PORTAL DATA
    if (action === 'read') {
      const rows = readAllData();

      return jsonResponse(
        {
          ok: true,
          rows: rows
        },
        callback
      );
    }

    // Health/test endpoint
    if (action === 'ping') {
      return jsonResponse(
        {
          ok: true,
          message: 'FEU Reception Portal Google Apps Script is connected.',
          timestamp: new Date().toISOString()
        },
        callback
      );
    }

    return jsonResponse(
      {
        ok: false,
        error: 'Unknown action'
      },
      callback
    );

  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error.message || String(error)
      },
      e && e.parameter ? e.parameter.callback : ''
    );
  }
}


// ============================================================
// MAIN POST REQUEST
// Used by googleWrite() in index-3.html.
// ============================================================

function doPost(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};

    const action = String(params.action || '').trim();
    const token = String(params.token || '').trim();
    const key = String(params.key || '').trim();

    // Security check
    if (!isValidToken(token)) {
      return jsonOutput({
        ok: false,
        error: 'Unauthorized'
      });
    }

    // Validate key
    if (!isAllowedKey(key)) {
      return jsonOutput({
        ok: false,
        error: 'Invalid or unsupported storage key.'
      });
    }

    // ========================================================
    // UPSERT
    // ========================================================

    if (action === 'upsert') {
      const rawValue = params.value;

      if (rawValue === undefined || rawValue === null) {
        return jsonOutput({
          ok: false,
          error: 'Missing value.'
        });
      }

      let value;

      try {
        value = JSON.parse(rawValue);
      } catch (parseError) {
        // Calendar memos and other simple values may be plain text.
        value = rawValue;
      }

      upsertData(key, value);

      return jsonOutput({
        ok: true,
        action: 'upsert',
        key: key
      });
    }

    // ========================================================
    // DELETE
    // ========================================================

    if (action === 'delete') {
      deleteData(key);

      return jsonOutput({
        ok: true,
        action: 'delete',
        key: key
      });
    }

    return jsonOutput({
      ok: false,
      error: 'Unknown action.'
    });

  } catch (error) {
    return jsonOutput({
      ok: false,
      error: error.message || String(error)
    });
  }
}


// ============================================================
// TOKEN VALIDATION
// ============================================================

function isValidToken(token) {
  return Boolean(
    token &&
    SHARED_TOKEN &&
    token === SHARED_TOKEN
  );
}


// ============================================================
// KEY VALIDATION
// ============================================================

function isAllowedKey(key) {

  // Normal portal storage keys
  if (ALLOWED_KEYS.has(key)) {
    return true;
  }

  // Calendar memo keys:
  //
  // cal_memo_2026_8_29
  // cal_memo_2026_9_1
  //
  // The current index-3.html uses these dynamically.
  if (key.startsWith('cal_memo_')) {
    return true;
  }

  return false;
}


// ============================================================
// GET / CREATE DATABASE SHEET
// ============================================================

function getDatabaseSheet() {

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error(
      'No active spreadsheet found. Make sure this Apps Script is bound to your FEU Reception Google Sheet.'
    );
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);

    sheet.getRange(1, 1, 1, 3).setValues([
      ['Key', 'Value', 'Updated At']
    ]);

    sheet.getRange(1, 1, 1, 3)
      .setFontWeight('bold');

    sheet.setFrozenRows(1);
  }

  return sheet;
}


// ============================================================
// READ ALL DATA
// ============================================================

function readAllData() {

  const sheet = getDatabaseSheet();

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, 3)
    .getValues();

  const rows = [];

  values.forEach(function(row) {

    const key = String(row[0] || '').trim();

    if (!key) {
      return;
    }

    if (!isAllowedKey(key)) {
      return;
    }

    let value = row[1];

    // Google Sheets may store the JSON as text.
    if (typeof value === 'string') {

      const trimmed = value.trim();

      if (
        trimmed.startsWith('{') ||
        trimmed.startsWith('[') ||
        trimmed === 'null' ||
        trimmed === 'true' ||
        trimmed === 'false'
      ) {
        try {
          value = JSON.parse(trimmed);
        } catch (error) {
          // Keep original string.
        }
      }
    }

    rows.push({
      key: key,
      value: value,
      updatedAt: row[2] instanceof Date
        ? row[2].toISOString()
        : String(row[2] || '')
    });
  });

  return rows;
}


// ============================================================
// UPSERT DATA
// ============================================================

function upsertData(key, value) {

  const lock = LockService.getScriptLock();

  lock.waitLock(15000);

  try {

    const sheet = getDatabaseSheet();

    const lastRow = sheet.getLastRow();

    let existingRow = -1;

    if (lastRow >= 2) {

      const keyValues = sheet
        .getRange(2, 1, lastRow - 1, 1)
        .getValues();

      for (let i = 0; i < keyValues.length; i++) {

        if (String(keyValues[i][0]).trim() === key) {
          existingRow = i + 2;
          break;
        }

      }
    }

    const serializedValue =
      typeof value === 'string'
        ? value
        : JSON.stringify(value);

    const now = new Date();

    if (existingRow !== -1) {

      sheet
        .getRange(existingRow, 1, 1, 3)
        .setValues([
          [key, serializedValue, now]
        ]);

    } else {

      sheet
        .appendRow([
          key,
          serializedValue,
          now
        ]);

    }

  } finally {

    lock.releaseLock();

  }
}


// ============================================================
// DELETE DATA
// ============================================================

function deleteData(key) {

  const lock = LockService.getScriptLock();

  lock.waitLock(15000);

  try {

    const sheet = getDatabaseSheet();

    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return;
    }

    const keyValues = sheet
      .getRange(2, 1, lastRow - 1, 1)
      .getValues();

    // Delete from bottom to top.
    for (let i = keyValues.length - 1; i >= 0; i--) {

      if (String(keyValues[i][0]).trim() === key) {

        sheet.deleteRow(i + 2);

      }

    }

  } finally {

    lock.releaseLock();

  }
}


// ============================================================
// JSON RESPONSE FOR GET / JSONP
// ============================================================

function jsonResponse(payload, callback) {

  const json = JSON.stringify(payload);

  // The current index-3.html uses JSONP.
  if (callback) {

    // Basic callback-name validation.
    // Prevents arbitrary JavaScript from being inserted as callback.
    if (!/^[A-Za-z_$][A-Za-z0-9_$\.]*$/.test(callback)) {

      return ContentService
        .createTextOutput(
          JSON.stringify({
            ok: false,
            error: 'Invalid callback.'
          })
        )
        .setMimeType(ContentService.MimeType.JSON);

    }

    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// JSON RESPONSE FOR POST
// ============================================================

function jsonOutput(payload) {

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);

}


// ============================================================
// OPTIONAL ADMIN TEST
// Run this manually from Apps Script if you want to verify
// that the spreadsheet connection itself works.
// ============================================================

function testDatabaseConnection() {

  const sheet = getDatabaseSheet();

  Logger.log(
    'FEU Reception Portal database is ready: ' +
    sheet.getName()
  );

}


// ============================================================
// OPTIONAL INITIALIZATION
// Run once manually if you want the database sheet created
// before deploying the Web App.
// ============================================================

function initializeDatabase() {

  const sheet = getDatabaseSheet();

  Logger.log(
    'Database initialized successfully: ' +
    sheet.getName()
  );

}
