class CyclePhase {
  static const String menstrual = 'menstrual';
  static const String follicular = 'follicular';
  static const String ovulatory = 'ovulatory';
  static const String luteal = 'luteal';
}

class FlowLevel {
  static const String none = 'none';
  static const String spotting = 'spotting';
  static const String light = 'light';
  static const String medium = 'medium';
  static const String heavy = 'heavy';
}

class CalendarSystem {
  static const String gregorian = 'gregorian';
  static const String ifc = 'international-fixed';
}

const List<String> ifcMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'Sol', 'July', 'August', 'September', 'October', 'November', 'December',
];

const List<String> gregorianMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const List<String> physicalSymptoms = [
  'Cramps', 'Bloating', 'Headache', 'Breast tenderness',
  'Back pain', 'Fatigue', 'Nausea', 'Acne',
  'Hot flashes', 'Insomnia', 'Constipation', 'Diarrhea',
  'Pelvic pain', 'Bowel pain', 'Bladder pain', 'Heavy bleeding',
  'Clots', 'Pain with sex',
];

const List<String> emotionalSymptoms = [
  'Anxiety', 'Depression', 'Mood swings', 'Irritability',
  'Brain fog', 'Low motivation', 'Overwhelmed', 'Crying spells',
  'Rage', 'Hopelessness', 'Social withdrawal', 'Panic',
  'Intrusive thoughts', 'Sensitivity',
];

const List<String> pmddSymptoms = [
  'Severe mood swings', 'Extreme irritability', 'Deep depression',
  'Panic attacks', 'Feeling out of control', 'Physical tension',
  'Food cravings', 'Social withdrawal',
];

const List<String> moods = [
  'Happy', 'Calm', 'Energetic', 'Focused', 'Creative',
  'Social', 'Neutral', 'Tired', 'Anxious', 'Sad',
  'Angry', 'Stressed', 'Tender', 'Hopeful',
];

const List<String> painLocations = [
  'Lower abdomen', 'Lower back', 'Pelvis', 'Upper back',
  'Legs', 'Head', 'Bladder', 'Bowel',
];

const List<String> painTypes = [
  'Cramping', 'Stabbing', 'Dull ache', 'Throbbing',
  'Pressure', 'Burning', 'Sharp',
];

const List<String> medications = [
  'Ibuprofen', 'Naproxen', 'Acetaminophen', 'Birth control pill',
  'IUD', 'Hormonal patch', 'Antidepressant', 'Anti-anxiety',
  'Progesterone', 'Estrogen', 'Magnesium',
];

const List<String> supplements = [
  'Magnesium', 'Vitamin D', 'Iron', 'B6', 'B12',
  'Omega-3', 'Evening primrose', 'Vitex', 'Ashwagandha',
  'Zinc', 'Folate', 'Calcium',
];
