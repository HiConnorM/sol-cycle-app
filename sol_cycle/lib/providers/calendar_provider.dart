import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/moon_service.dart';
import '../services/calendar_service.dart';
import '../services/location_service.dart';
import '../core/constants.dart';

class CalendarState {
  final DateTime currentDate;
  final String calendarSystem;
  final MoonPhaseData moonPhase;
  final LocationData? location;

  const CalendarState({
    required this.currentDate,
    this.calendarSystem = CalendarSystem.gregorian,
    required this.moonPhase,
    this.location,
  });

  CalendarState copyWith({
    DateTime? currentDate,
    String? calendarSystem,
    MoonPhaseData? moonPhase,
    LocationData? location,
  }) {
    return CalendarState(
      currentDate: currentDate ?? this.currentDate,
      calendarSystem: calendarSystem ?? this.calendarSystem,
      moonPhase: moonPhase ?? this.moonPhase,
      location: location ?? this.location,
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
        )) {
    _initLocation();
  }

  Future<void> _initLocation() async {
    final loc = await LocationService.getLocation();
    if (loc != null && mounted) {
      state = state.copyWith(
        location: loc,
        moonPhase: MoonService.getPhaseForHemisphere(
          state.currentDate,
          southern: loc.isSouthernHemisphere,
        ),
      );
    }
  }

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
      moonPhase: MoonService.getPhaseForHemisphere(
        date,
        southern: state.location?.isSouthernHemisphere ?? false,
      ),
    );
  }
}

final calendarProvider = StateNotifierProvider<CalendarNotifier, CalendarState>(
  (ref) => CalendarNotifier(),
);
