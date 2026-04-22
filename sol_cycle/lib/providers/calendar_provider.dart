import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/moon_service.dart';
import '../services/calendar_service.dart';
import '../core/constants.dart';

class CalendarState {
  final DateTime currentDate;
  final String calendarSystem;
  final MoonPhaseData moonPhase;

  const CalendarState({
    required this.currentDate,
    this.calendarSystem = CalendarSystem.gregorian,
    required this.moonPhase,
  });

  CalendarState copyWith({
    DateTime? currentDate,
    String? calendarSystem,
    MoonPhaseData? moonPhase,
  }) {
    return CalendarState(
      currentDate: currentDate ?? this.currentDate,
      calendarSystem: calendarSystem ?? this.calendarSystem,
      moonPhase: moonPhase ?? this.moonPhase,
    );
  }

  String get displayMonth {
    if (calendarSystem == CalendarSystem.ifc) {
      final ifcDate = gregorianToIFC(currentDate);
      return ifcDate.monthName;
    }
    return gregorianMonthNames[currentDate.month - 1];
  }

  int get displayDay {
    if (calendarSystem == CalendarSystem.ifc) {
      return gregorianToIFC(currentDate).day;
    }
    return currentDate.day;
  }

  int get displayYear => currentDate.year;
  int get currentMonth {
    if (calendarSystem == CalendarSystem.ifc) {
      return gregorianToIFC(currentDate).month - 1;
    }
    return currentDate.month - 1;
  }
}

class CalendarNotifier extends StateNotifier<CalendarState> {
  CalendarNotifier()
      : super(CalendarState(
          currentDate: DateTime.now(),
          moonPhase: MoonService.getPhase(DateTime.now()),
        ));

  void toggleCalendarSystem() {
    state = state.copyWith(
      calendarSystem: state.calendarSystem == CalendarSystem.gregorian
          ? CalendarSystem.ifc
          : CalendarSystem.gregorian,
    );
  }

  void setDate(DateTime date) {
    state = state.copyWith(
      currentDate: date,
      moonPhase: MoonService.getPhase(date),
    );
  }
}

final calendarProvider = StateNotifierProvider<CalendarNotifier, CalendarState>(
  (ref) => CalendarNotifier(),
);
