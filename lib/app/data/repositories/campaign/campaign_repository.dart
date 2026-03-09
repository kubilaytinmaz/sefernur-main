import 'package:fpdart/fpdart.dart';

// Removed unused imports
import '../../../utils/utils.dart';
import '../../models/campaign/campaign_model.dart';
import '../../providers/providers.dart';

class CampaignRepository {
  final FirebaseApi firebaseApi;
  CampaignRepository(this.firebaseApi);

  TaskEither<ServerFailure, String> createCampaign(CampaignModel model) {
    final data = model.toJson();
    return firebaseApi.createCollectionData(path: FirestorePaths.collection(), data: data);
  }

  TaskEither<ServerFailure, CampaignModel?> readCampaign(String id) {
    return firebaseApi.readData(
      path: FirestorePaths.document(id),
      builder: (data, docId) {
        if (data == null) return null;
        final map = Map<String, dynamic>.from(data);
        map['id'] = docId;
        return CampaignModel.fromJson(map);
      },
    );
  }

  TaskEither<ServerFailure, List<CampaignModel>> readCampaigns({bool onlyActive = true}) {
    return firebaseApi.readCollectionData(
      path: FirestorePaths.collection(),
      queryBuilder: (q) => onlyActive ? q.where('isActive', isEqualTo: true) : q,
      builder: (docs) {
        if (docs == null) return [];
        return docs.map((d) {
          final map = d.data();
          map['id'] = d.id;
          return CampaignModel.fromJson(map);
        }).toList();
      },
    );
  }

  TaskEither<ServerFailure, bool> updateCampaign(CampaignModel model) {
    if (model.id == null) {
      return TaskEither.left(const ServerFailure(message: 'Missing id', statusCode: 400));
    }
    return firebaseApi.updateData(
      path: FirestorePaths.document(model.id!),
      data: model.toJson(),
      builder: (_) => true,
    );
  }

  TaskEither<ServerFailure, bool> toggleSave({required CampaignModel model, required String userId}) {
    final list = List<String>.from(model.savedByUserIds);
    if (list.contains(userId)) {
      list.remove(userId);
    } else {
      list.add(userId);
    }
    final updated = model.copyWith(updatedAt: DateTime.now(), savedByUserIds: list);
    return updateCampaign(updated);
  }
}
