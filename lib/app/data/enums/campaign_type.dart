enum CampaignType { hotel, car, transfer, tour, guide }

extension CampaignTypeX on CampaignType {
  String get label {
    switch (this) {
      case CampaignType.hotel: return 'Hotel';
      case CampaignType.car: return 'Taxi';
      case CampaignType.transfer: return 'Transfer';
      case CampaignType.tour: return 'Tour';
      case CampaignType.guide: return 'Guide';
    }
  }

  static CampaignType? fromString(String? value) {
    if (value == null) return null;
    return CampaignType.values.firstWhere(
      (e) => e.name.toLowerCase() == value.toLowerCase(),
      orElse: () => CampaignType.hotel,
    );
  }
}
