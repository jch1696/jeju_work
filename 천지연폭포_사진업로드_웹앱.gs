var FOLDER_ID = "1k_Hh7g1rlOT_InOJ8wyD52xjVJrecZI8";
var SPREADSHEET_ID = "1RgqJUBwiFrVEq6xk32QHwitM-N738OgoNLXUWDf7dVk";
var PHOTO_SHEET_NAME = "사진업로드기록";
var MAZE_SHEET_NAME = "다이나믹메이즈 기록";

function doPost(e) {
  try {
    var mode = (e.parameter.mode || "photo").trim();

    if (mode === "text") {
      return saveTextRecord_(e);
    }

    if (mode === "maze") {
      return saveMazeRecord_(e);
    }

    return uploadPhoto_(e);
  } catch (error) {
    return jsonOutput({
      success: false,
      message: error.toString()
    });
  }
}

function uploadPhoto_(e) {
  var grade = (e.parameter.grade || "").trim();
  var className = (e.parameter.className || "").trim();
  var studentName = (e.parameter.studentName || "").trim();
  var activity = (e.parameter.activity || "사진업로드").trim();
  var fileName = (e.parameter.fileName || "photo.jpg").trim();
  var mimeType = (e.parameter.mimeType || "image/jpeg").trim();
  var base64Data = e.parameter.base64Data || "";

  if (!grade || !className || !studentName || !base64Data) {
    return jsonOutput({
      success: false,
      message: "필수 값이 비어 있습니다."
    });
  }

  var folder = DriveApp.getFolderById(FOLDER_ID);
  var bytes = Utilities.base64Decode(base64Data);
  var cleanName = activity + "_" + grade + "학년_" + className + "반_" + studentName + "_" + timestampString_() + "_" + fileName;
  var blob = Utilities.newBlob(bytes, mimeType, cleanName);
  var file = folder.createFile(blob);

  appendRow_(
    PHOTO_SHEET_NAME,
    [
      new Date(),
      activity,
      grade,
      className,
      studentName,
      file.getName(),
      file.getId(),
      file.getUrl()
    ],
    ["제출시각", "활동", "학년", "반", "이름", "파일명", "파일ID", "파일URL"]
  );

  return jsonOutput({
    success: true,
    message: "업로드 완료",
    fileId: file.getId(),
    fileName: file.getName()
  });
}

function saveTextRecord_(e) {
  var grade = (e.parameter.grade || "").trim();
  var className = (e.parameter.className || "").trim();
  var studentName = (e.parameter.studentName || "").trim();
  var activity = (e.parameter.activity || "글기록").trim();
  var note = (e.parameter.note || "").trim();

  if (!grade || !className || !studentName || !note) {
    return jsonOutput({
      success: false,
      message: "필수 값이 비어 있습니다."
    });
  }

  var textSheetName = getTextSheetName_(activity);

  appendRow_(
    textSheetName,
    [
      new Date(),
      activity,
      grade,
      className,
      studentName,
      note
    ],
    ["제출시각", "활동", "학년", "반", "이름", "기록"]
  );

  return jsonOutput({
    success: true,
    message: "기록 저장 완료"
  });
}

function getTextSheetName_(activity) {
  var map = {
    "1일차 마무리": "1일차 마무리",
    "서귀포유람선": "서귀포유람선",
    "아트 서커스": "아트 서커스",
    "2일차 마무리": "2일차 마무리",
    "여행 전체 돌아보기": "여행 전체 돌아보기",
    "최종 소감": "최종 소감"
  };

  return map[activity] || "기타 글기록";
}

function saveMazeRecord_(e) {
  var grade = (e.parameter.grade || "").trim();
  var className = (e.parameter.className || "").trim();
  var studentName = (e.parameter.studentName || "").trim();
  var record = (e.parameter.record || "").trim();

  if (!grade || !className || !studentName || !record) {
    return jsonOutput({
      success: false,
      message: "필수 값이 비어 있습니다."
    });
  }

  appendRow_(
    MAZE_SHEET_NAME,
    [
      grade,
      className,
      studentName,
      record,
      new Date()
    ],
    ["학년", "반", "이름", "기록", "제출시각"]
  );

  return jsonOutput({
    success: true,
    message: "다이나믹메이즈 기록 저장 완료"
  });
}

function appendRow_(sheetName, rowValues, headerValues) {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === "여기에_구글시트_ID_입력") {
    throw new Error("SPREADSHEET_ID를 먼저 입력해 주세요.");
  }

  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headerValues);
  }

  sheet.appendRow(rowValues);
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function timestampString_() {
  return Utilities.formatDate(new Date(), "Asia/Seoul", "yyyyMMdd_HHmmss");
}
