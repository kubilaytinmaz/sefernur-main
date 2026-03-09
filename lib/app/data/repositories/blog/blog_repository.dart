import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:fpdart/fpdart.dart';

import '../../enums/blog_category.dart';
import '../../models/blog/blog_model.dart';
import '../../providers/firebase/firebase_api.dart';
import '../../providers/firebase/firebase_paths.dart';

class BlogRepository {
  final FirebaseApi api;
  BlogRepository(this.api);

  TaskEither<Object,String> create(BlogModel model){
    return TaskEither.tryCatch(() async {
  final data = model.toJson();
  final doc = await api.firebaseFirestore.collection(FirestorePaths.blogsCollection()).add(data);
      await doc.update({'id': doc.id});
      return doc.id;
    }, (e,_)=> e);
  }

  TaskEither<Object,bool> update(BlogModel model){
    return TaskEither.tryCatch(() async {
  await api.firebaseFirestore.doc(FirestorePaths.blogDocument(model.id!)).update(model.toJson());
      return true;
    }, (e,_)=> e);
  }

  TaskEither<Object,List<BlogModel>> readBlogs({BlogCategory? category, bool onlyActive = true}){
    return TaskEither.tryCatch(() async {
  Query q = api.firebaseFirestore.collection(FirestorePaths.blogsCollection());
      if (onlyActive) q = q.where('isActive', isEqualTo: true);
      if (category != null) q = q.where('categories', arrayContains: category.storageKey);
      final snap = await q.get();
  return snap.docs.map((d){ final data = d.data() as Map<String,dynamic>; data['id']= d.id; return BlogModel.fromJson(data); }).toList();
    }, (e,_)=> e);
  }
}
