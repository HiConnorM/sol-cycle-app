import 'package:geolocator/geolocator.dart';

class LocationData {
  final double latitude;
  final double longitude;
  const LocationData({required this.latitude, required this.longitude});

  bool get isSouthernHemisphere => latitude < 0;
}

class LocationService {
  static Future<LocationData?> getLocation() async {
    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) return null;

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return null;
      }
      if (permission == LocationPermission.deniedForever) return null;

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.low),
      );
      return LocationData(latitude: position.latitude, longitude: position.longitude);
    } catch (_) {
      return null;
    }
  }
}
