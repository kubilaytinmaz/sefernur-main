import 'package:get/get.dart';

import '../../enums/blog_category.dart';
import '../../models/blog/blog_model.dart';
import '../../providers/firebase/firebase_api.dart';
import '../../repositories/blog/blog_repository.dart';
import '../auth/auth_service.dart';

class BlogService extends GetxService {
  late BlogRepository repository;
  final activeBlogs = <BlogModel>[].obs; // active only
  final allBlogs = <BlogModel>[].obs; // full (on demand)
  final isLoading = false.obs;
  final isLoadingAll = false.obs;

  Future<BlogService> init() async {
    repository = BlogRepository(FirebaseApi());
    await fetchActive();
    return this;
  }

  Future<void> fetchActive({BlogCategory? category}) async {
    isLoading.value = true;
    final res = await repository.readBlogs(category: category, onlyActive: true).run();
    res.match((l){}, (r){
      if (category == null) {
        activeBlogs.assignAll(r..sort((a,b)=> b.createdAt.compareTo(a.createdAt)));
      } else {
        final others = activeBlogs.where((b)=> !b.categories.contains(category)).toList();
        others.addAll(r);
        others.sort((a,b)=> b.createdAt.compareTo(a.createdAt));
        activeBlogs.assignAll(others);
      }
    });
    isLoading.value = false;
  }

  Future<void> fetchAll({BlogCategory? category}) async {
    isLoadingAll.value = true;
    final res = await repository.readBlogs(category: category, onlyActive: false).run();
    res.match((l){}, (r){
      if (category == null) {
        allBlogs.assignAll(r..sort((a,b)=> b.createdAt.compareTo(a.createdAt)));
      } else {
        final others = allBlogs.where((b)=> !b.categories.contains(category)).toList();
        others.addAll(r);
        others.sort((a,b)=> b.createdAt.compareTo(a.createdAt));
        allBlogs.assignAll(others);
      }
    });
    isLoadingAll.value = false;
  }

  List<BlogModel> activeByCategory(BlogCategory c) => activeBlogs.where((b)=> b.isActive && b.categories.contains(c)).toList();
  List<BlogModel> allByCategory(BlogCategory c) => allBlogs.where((b)=> b.categories.contains(c)).toList();

  Future<bool> addBlog({
    required String title,
    required String shortDescription,
    required String longDescription,
    required List<String> images,
    required List<BlogCategory> categories,
    bool isActive = true,
  }) async {
    final userId = Get.isRegistered<AuthService>() && Get.find<AuthService>().user.value.id != null
        ? Get.find<AuthService>().user.value.id!
        : 'anonymous';
    final model = BlogModel(
      title: title,
      shortDescription: shortDescription,
      longDescription: longDescription,
      images: images,
      categories: categories,
      isActive: isActive,
      createdBy: userId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    final res = await repository.create(model).run();
    return res.match((l)=> false, (id){
      if (model.isActive) activeBlogs.insert(0, model.copyWith(id: id));
      if (allBlogs.isNotEmpty) allBlogs.insert(0, model.copyWith(id: id));
      return true;
    });
  }

  Future<bool> updateBlog(BlogModel model, {
    String? title,
    String? shortDescription,
    String? longDescription,
    List<String>? images,
    List<BlogCategory>? categories,
    bool? isActive,
  }) async {
    if (model.id == null) return false;
    final updated = model.copyWith(
      title: title ?? model.title,
      shortDescription: shortDescription ?? model.shortDescription,
      longDescription: longDescription ?? model.longDescription,
      images: images ?? model.images,
      categories: categories ?? model.categories,
      isActive: isActive ?? model.isActive,
      updatedAt: DateTime.now(),
    );
    final res = await repository.update(updated).run();
    return res.match((l)=> false, (r){
      final idx = activeBlogs.indexWhere((b)=> b.id == updated.id);
      if (updated.isActive) {
        if (idx != -1) { activeBlogs[idx] = updated; activeBlogs.refresh(); } else { activeBlogs.insert(0, updated); }
      } else { if (idx != -1) activeBlogs.removeAt(idx); }
      final aidx = allBlogs.indexWhere((b)=> b.id == updated.id);
      if (aidx != -1) { allBlogs[aidx] = updated; allBlogs.refresh(); }
      return true;
    });
  }
}
