import 'package:fpdart/fpdart.dart';

import '../../../utils/utils.dart';
import '../../enums/place_city.dart';
import '../../models/place/place_model.dart';
import '../../providers/firebase/firebase_api.dart';
import '../../providers/firebase/firebase_paths.dart';

class PlaceRepository {
  final FirebaseApi firebaseApi;
  PlaceRepository(this.firebaseApi);

  TaskEither<ServerFailure, String> create(PlaceModel model) {
    return firebaseApi.createCollectionData(path: FirestorePaths.placesCollection(), data: model.toJson());
  }

  TaskEither<ServerFailure, List<PlaceModel>> readPlaces({PlaceCity? city, bool onlyActive = true}) {
    return firebaseApi.readCollectionData(
      path: FirestorePaths.placesCollection(),
      queryBuilder: (q) {
        if (city != null) { q = q.where('city', isEqualTo: city.name); }
        if (onlyActive) { q = q.where('isActive', isEqualTo: true); }
        return q;
      },
      builder: (docs) {
        if (docs == null) return [];
        return docs.map((d){
          final map = d.data();
          map['id'] = d.id;
          return PlaceModel.fromJson(map);
        }).toList();
      },
    );
  }

  TaskEither<ServerFailure, bool> update(PlaceModel model) {
    if (model.id == null) return TaskEither.left(const ServerFailure(message: 'Missing id', statusCode: 400));
    return firebaseApi.updateData(path: FirestorePaths.placeDocument(model.id!), data: model.toJson(), builder: (_)=> true);
  }
}
