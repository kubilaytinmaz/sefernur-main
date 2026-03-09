class FirestorePaths {
  /// Users
  static String userCollection() => 'users';

  /// User
  static String userDocument(String docId) => 'users/$docId';

  /// User Profile Image
  static String profilesImagesPath(String userId) => 'users/$userId/$userId';

  static String collection() => 'campaigns';
  static String document(String id) => 'campaigns/$id';

  /// Places (Gezilecek Yerler)
  static String placesCollection() => 'places';
  static String placeDocument(String id) => 'places/$id';

  /// Blogs (Hazırlık Rehberleri ve gelecekteki blog kategorileri)
  static String blogsCollection() => 'blogs';
  static String blogDocument(String id) => 'blogs/$id';

  /// Visa Applications
  static String visaApplicationsCollection() => 'visaApplications';
  static String visaApplicationDocument(String id) => 'visaApplications/$id';
}
