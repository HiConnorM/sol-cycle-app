class IFCDate {
  final int year;
  final int month;
  final int day;
  final bool isYearDay;
  final bool isLeapDay;
  final String monthName;

  const IFCDate({
    required this.year,
    required this.month,
    required this.day,
    this.isYearDay = false,
    this.isLeapDay = false,
    required this.monthName,
  });
}

const List<String> _ifcMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'Sol', 'July', 'August', 'September', 'October', 'November', 'December',
];

bool _isLeapYear(int year) {
  return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

IFCDate gregorianToIFC(DateTime gregorian) {
  final year = gregorian.year;
  final dayOfYear = gregorian.difference(DateTime(year, 1, 1)).inDays + 1;

  if (_isLeapYear(year) && dayOfYear == 169) {
    return IFCDate(year: year, month: 6, day: 29, isLeapDay: true, monthName: 'June');
  }

  int adjustedDay = dayOfYear;
  if (_isLeapYear(year) && dayOfYear > 169) {
    adjustedDay = dayOfYear - 1;
  }

  if (adjustedDay == 365) {
    return IFCDate(year: year, month: 13, day: 29, isYearDay: true, monthName: 'December');
  }

  final month = ((adjustedDay - 1) ~/ 28) + 1;
  final day = ((adjustedDay - 1) % 28) + 1;

  final clampedMonth = month.clamp(1, 13);
  return IFCDate(
    year: year,
    month: clampedMonth,
    day: day,
    monthName: _ifcMonthNames[clampedMonth - 1],
  );
}

String formatIFCDate(IFCDate date) {
  if (date.isYearDay) return 'Year Day ${date.year}';
  if (date.isLeapDay) return 'Leap Day ${date.year}';
  return '${date.monthName} ${date.day}, ${date.year}';
}

String getGreeting() {
  final hour = DateTime.now().hour;
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
