enum BlogCategory { hazirlik }

extension BlogCategoryX on BlogCategory {
  String get label {
    switch (this) {
  case BlogCategory.hazirlik: return 'Hazırlık Rehberi';
    }
  }
  String get storageKey => name; // Firestore kaydı için
  static BlogCategory from(String? v) {
  if (v == null) return BlogCategory.hazirlik;
    return BlogCategory.values.firstWhere(
      (e) => e.name == v,
  orElse: () => BlogCategory.hazirlik,
    );
  }
}
