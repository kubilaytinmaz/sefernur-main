import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:fpdart/fpdart.dart';
import 'package:get/get.dart';

import '../../../utils/utils.dart';

class FirebaseApi {
  // ----------------------------> Singleton
  FirebaseApi._privateConstructor();

  static final FirebaseApi _instance = FirebaseApi._privateConstructor();

  factory FirebaseApi() {
    return _instance;
  }

  final FirebaseFirestore firebaseFirestore = FirebaseFirestore.instance;
  final FirebaseStorage firebaseStorage = FirebaseStorage.instance;

  // ----------------------------> Firestore CRUD
  TaskEither<ServerFailure, T> readData<T>({
    required String path,
    required T Function(dynamic data, String? documentId) builder,
  }) {
    return TaskEither.tryCatch(
      () async {
        final reference = firebaseFirestore.doc(path);
        final value = await reference.get();
        return builder(value.data(), value.id);
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  TaskEither<ServerFailure, T> createData<T>({
    required String path,
    required Map<String, dynamic> data,
    required T Function(dynamic data) builder,
    bool merge = false,
  }) {
    return TaskEither.tryCatch(
      () async {
        final reference = firebaseFirestore.doc(path);
        await reference.set(
          data, 
          SetOptions(merge: merge)
        );
        return builder(true);
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  TaskEither<ServerFailure, T> updateData<T>({
    required String path,
    required Map<String, dynamic> data,
    required T Function(dynamic data) builder,
  }) {
    return TaskEither.tryCatch(
      () async {
        final reference = firebaseFirestore.doc(path);
        await reference.update(data);
        return builder(true);
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  TaskEither<ServerFailure, T> readCollectionData<T>({
    required String path,
    required T Function(List<QueryDocumentSnapshot<Map<String, dynamic>>>? data) builder,
    Query<Map<String, dynamic>>? Function(Query<Map<String, dynamic>> query)? queryBuilder,
  }) {
    return TaskEither.tryCatch(
      () async {
        Query<Map<String, dynamic>> query = firebaseFirestore.collection(path);

        // İsteğe bağlı sorgu oluşturucusu varsa uygula
        if (queryBuilder != null) {
          query = queryBuilder(query)!;
        }

        // Sorguyu çalıştır ve sonuçları al
        final value = await query.get();

        // Alınan verilerle builder fonksiyonunu çağır
        // Eğer koleksiyonda doküman yoksa, builder fonksiyonuna null gönder
        return builder(value.size > 0 ? value.docs : null);
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  TaskEither<ServerFailure, String> createCollectionData({
    required String path,
    required Map<String, dynamic> data,
  }) {
    return TaskEither.tryCatch(
      () async {
        final reference = firebaseFirestore.collection(path);
        final docRef = await reference.add(data);
        return docRef.id;
      },
      (e, _) => ServerFailure(
        message: 'somethingWentWrong'.tr,
        statusCode: 500,
      ),
    );
  }

  // ----------------------------> Firestore Streams
  Stream<T> documentStream<T>({
    required String path,
    required T Function(Map<String, dynamic>? data, String documentId) builder,
  }) {
    final DocumentReference<Map<String, dynamic>> reference = firebaseFirestore.doc(path);
    final Stream<DocumentSnapshot<Map<String, dynamic>>> snapshots = reference.snapshots();
    return snapshots.map((snapshot) => builder(snapshot.data(), snapshot.id));
  }

  Stream<List<T>> collectionStream<T>({
    required String path,
    required T Function(Map<String, dynamic>? data, String documentId) builder,
    Query<Map<String, dynamic>>? Function(Query<Map<String, dynamic>> query)? queryBuilder,
    int Function(T lhs, T rhs)? sort,
  }) {
    Query<Map<String, dynamic>> query = firebaseFirestore.collection(path);
    if (queryBuilder != null) {
      query = queryBuilder(query)!;
    }

    final Stream<QuerySnapshot<Map<String, dynamic>>> snapshots = query.snapshots();

    return snapshots.map((snapshot) {
      final result = snapshot.docs.map((snapshot) => 
        builder(snapshot.data(), snapshot.id
      )).where((value) => value != null).toList();

      if (sort != null) {
        result.sort(sort);
      }
      return result;
    });
  }

  // ----------------------------> Firestore Delete 
  Future deleteData({required String path}) async {
    final reference = firebaseFirestore.doc(path);
    await reference.delete();
  }

  Future deleteAllCollectionData<T>({
    required String path,
  }) async {
    final WriteBatch batch = FirebaseFirestore.instance.batch();
    const int batchSize = 100;
    bool lastBatch = false;

    Query<Map<String, dynamic>> query =  firebaseFirestore.collection(path).limit(batchSize);
    await query.get().then((snapshot) {
      if (snapshot.size < batchSize) {
        lastBatch = true;
      }
      for (DocumentSnapshot document in snapshot.docs) {
        batch.delete(document.reference);
      }
    });

    await batch.commit();
    if (!lastBatch) {
      await deleteAllCollectionData(path: path);
    }
    return batch.commit();
  }

  // ----------------------------> Firebase Storage
  TaskEither<ServerFailure, T> uploadFile<T>({
    required String path,
    required File file,
    required T Function(dynamic data) builder,
  }) {
    return TaskEither.tryCatch(
      () async {
        UploadTask uploadTask = firebaseStorage.ref().child(path).putFile(file);
        final downloadURL = await (await uploadTask).ref.getDownloadURL();
        return builder(downloadURL);
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  TaskEither<ServerFailure, T> getFileUrl<T>({
    required String path,
    required T Function(dynamic data) builder,
  }) {
    return TaskEither.tryCatch(
      () async {
        final pathReference = firebaseStorage.ref().child(path);
        String downloadURL = await pathReference.getDownloadURL();
        return builder(downloadURL);
      },
      (e, _) => ServerFailure(
        message: ErrorHandler.handle(e).message,
        statusCode: ErrorHandler.handle(e).statusCode,
      ),
    );
  }

  Future deleteFile({required String path}) async {
    return await firebaseStorage.ref().child(path).delete();
  }

  Future deleteAllFolderFile({required String path}) async {
    return await firebaseStorage.ref().child(path).listAll().then((result) {
      for (final file in result.items) {
        file.delete();
      }
    });
  }
}