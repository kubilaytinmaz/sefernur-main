enum PlaceCity { mekke, medine }

extension PlaceCityX on PlaceCity {
  String get label => this == PlaceCity.mekke ? 'Mekke' : 'Medine';
}
