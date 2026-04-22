import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cycle_log.dart';
import '../models/cycle_settings.dart';

class StorageService {
  static const String _logsKey = 'cycle_logs';
  static const String _settingsKey = 'cycle_settings';
  static const String _onboardedKey = 'onboarded';

  static Future<Map<String, CycleLog>> loadLogs() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_logsKey);
    if (raw == null) return {};
    final Map<String, dynamic> decoded = jsonDecode(raw);
    return decoded.map((k, v) => MapEntry(k, CycleLog.fromJson(v as Map<String, dynamic>)));
  }

  static Future<void> saveLogs(Map<String, CycleLog> logs) async {
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(logs.map((k, v) => MapEntry(k, v.toJson())));
    await prefs.setString(_logsKey, encoded);
  }

  static Future<CycleLog?> getLog(String date) async {
    final logs = await loadLogs();
    return logs[date];
  }

  static Future<void> saveLog(CycleLog log) async {
    final logs = await loadLogs();
    logs[log.date] = log;
    await saveLogs(logs);
  }

  static Future<CycleSettings> loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_settingsKey);
    if (raw == null) return const CycleSettings();
    return CycleSettings.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  static Future<void> saveSettings(CycleSettings settings) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_settingsKey, jsonEncode(settings.toJson()));
  }

  static Future<bool> isOnboarded() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_onboardedKey) ?? false;
  }

  static Future<void> setOnboarded() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_onboardedKey, true);
  }

  static Future<void> clearAll() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
