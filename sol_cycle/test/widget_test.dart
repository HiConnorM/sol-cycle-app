import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sol_cycle/app.dart';

void main() {
  testWidgets('App loads', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: SolCycleApp()));
    expect(find.byType(SolCycleApp), findsOneWidget);
  });
}
