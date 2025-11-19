/**
 * 🚀 BASE-17 ULTIMATE - ENTRY POINT (Menu + Web App + Wrappers)
 * Version: 3.5 | Date: 19/11/2025
 * ALL BUSINESS LOGIC IN BACKEND MODULES - DO NOT ADD HERE
 */

function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🎯 CONSOLE')
      .addItem('🚀 Console V3', 'ouvrirConsolePilotageV3')
      .addSeparator()
      .addItem('⚙️ Configuration', 'ouvrirConfigurationStructure')
      .addItem('🔓 Déverrouiller _STRUCTURE', 'deverrouillerStructure')
      .addToUi();

    ui.createMenu('⚙️ LEGACY')
      .addItem('📋 Classes Sources', 'legacy_viewSourceClasses')
      .addItem('📊 Pipeline Complet', 'legacy_runFullPipeline')
      .addItem('⚙️ _STRUCTURE', 'legacy_openStructure')
      .addToUi();
  } catch (e) {
    Logger.log('❌ onOpen error: ' + e.toString());
  }
}

function doGet(e) {
  return HtmlService.createTemplateFromFile('InterfaceV2')
    .evaluate()
    .setTitle('Interface Répartition')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function ouvrirConsolePilotageV3() {
  const html = HtmlService.createHtmlOutputFromFile('ConsolePilotageV3').setWidth(1600).setHeight(900);
  SpreadsheetApp.getUi().showModalDialog(html, 'Console de Pilotage V3');
}

function ouvrirConfigurationStructure() {
  const html = HtmlService.createHtmlOutputFromFile('ConfigurationComplete').setWidth(1200).setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, 'Configuration Structure');
}

function legacy_runFullPipeline() {
  if (typeof legacy_runFullPipeline_PRIME === 'function') {
    return legacy_runFullPipeline_PRIME();
  } else {
    SpreadsheetApp.getUi().alert('❌ LEGACY_Pipeline.gs not found');
  }
}

function legacy_viewSourceClasses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets().filter(s => /^\d+°\d+$/.test(s.getName()));
  if (sheets.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ No source sheets (6°1, 5°2, etc)');
    return;
  }
  ss.setActiveSheet(sheets[0]);
  SpreadsheetApp.getUi().alert(`Found: ${sheets.map(s => s.getName()).join(', ')}`);
}

function legacy_openStructure() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_STRUCTURE');
  if (sheet) {
    SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);
    SpreadsheetApp.getUi().alert('✅ _STRUCTURE opened');
  } else {
    SpreadsheetApp.getUi().alert('⚠️ _STRUCTURE not found');
  }
}

function deverrouillerStructure() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_STRUCTURE');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('⚠️ _STRUCTURE not found');
    return;
  }
  try {
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    let count = 0;
    protections.forEach(p => { if (p.canEdit()) { p.remove(); count++; } });
    SpreadsheetApp.getUi().alert(`✅ Unlocked (${count} protections)`);
  } catch (e) {
    SpreadsheetApp.getUi().alert(`❌ ${e.toString()}`);
  }
}
