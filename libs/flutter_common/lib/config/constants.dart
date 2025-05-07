import 'package:flutter_common/core/enums/measurement_system.dart';
import 'package:generic_map/generic_map.dart';

import '../core/entities/place.dart';
import '../features/country_code_dialog/domain/entities/country_code.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Constants {
  static const String serverIp = "driibo.com";
  static const int resendOtpTime = 90;
  static const bool isDemoMode = false;
  static bool showTimeIn24HourFormat = true;
  static final CountryCode defaultCountry = CountryCode.parseByIso('MX');

  static MapBoxProvider get mapBoxProvider => MapBoxProvider(
        secretKey: dotenv.maybeGet('MAPBOX_TOKEN') ?? 'pk.eyJ1IjoiYWxkb2dsZXoyNCIsImEiOiJjbWFiY3g3NDgyOWM3Mmpvb3VyM3pvamFpIn0.m1oozMJ4L_sYYBYtF15bzQ',
        userId: "mapbox",
        tileSetId: "streets-v12",
      );
  static const PlaceEntity defaultLocation = PlaceEntity(
    coordinates: LatLngEntity(lat: 19.42701 , lng: -99.16766),
    address: "Av. P.º de la Reforma 333, Cuauhtémoc, 06500 Ciudad de México, CDMX",
  );
  static const List<double> walletPresets = [10, 20, 50];
  //static const MapProviderEnum defaultMapProvider = MapProviderEnum.openStreetMaps;
  //static const MapProviderEnum defaultMapProvider = MapProviderEnum.googleMaps;
  static const MapProviderEnum defaultMapProvider = MapProviderEnum.mapBox;
  static const MeasurementSystem defaultMeasurementSystem =
      MeasurementSystem.metric;
}
