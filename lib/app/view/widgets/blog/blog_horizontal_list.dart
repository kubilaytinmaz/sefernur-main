import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/enums/blog_category.dart';
import '../../../data/models/blog/blog_model.dart';
import '../../../data/services/blog/blog_service.dart';
import 'blog_detail_sheet.dart';

class BlogHorizontalList extends StatefulWidget {
  final BlogCategory category;
  const BlogHorizontalList({super.key, required this.category});

  @override
  State<BlogHorizontalList> createState() => _BlogHorizontalListState();
}

class _BlogHorizontalListState extends State<BlogHorizontalList> {
  @override
  void initState() {
    super.initState();
    // Widget oluşturulduğunda tüm blogları fetch et
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final service = Get.find<BlogService>();
      if (service.allBlogs.isEmpty) {
        service.fetchAll(category: widget.category);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final service = Get.find<BlogService>();
    return Obx(() {
      // Tüm blogları getir (aktif + pasif)
      final activeList = service.activeByCategory(widget.category);
      final allList = service.allByCategory(widget.category);
      
      // Önce tüm blogları al, eğer allBlogs boşsa fetchAll çağır
      List<BlogModel> displayList = allList.isNotEmpty ? allList : activeList;
      
      if (displayList.isEmpty) {
        return SizedBox(
          height: 160,
          child: Center(child: Text('İçerik yok', style: TextStyle(color: theme.colorScheme.onSurfaceVariant))),
        );
      }
      
      return SizedBox(
        height: 170,
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          scrollDirection: Axis.horizontal,
          clipBehavior: Clip.none,
          itemBuilder: (_, i) {
            final b = displayList[i];
            final thumb = b.images.isNotEmpty ? b.images.first : null;
            final isInactive = !b.isActive;
            
            return InkWell(
              onTap: () => BlogDetailSheet.show(b),
              child: Container(
                width: 180,
                decoration: BoxDecoration(
                  color: isInactive 
                      ? (isDark ? theme.colorScheme.surfaceContainerHigh.withOpacity(0.6) : theme.colorScheme.surface.withOpacity(0.6)) 
                      : (isDark ? theme.colorScheme.surfaceContainerHigh : theme.colorScheme.surface),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isInactive 
                        ? (isDark ? theme.colorScheme.outline.withOpacity(.3) : Colors.grey.shade300)
                        : (isDark ? theme.colorScheme.outline.withOpacity(.2) : Colors.grey.shade200)
                  ),
                ),
                child: Stack(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Stack(
                              children: [
                                thumb == null
                                    ? Container(color: isDark ? Colors.white12 : Colors.black12)
                                    : Image.network(
                                        thumb,
                                        fit: BoxFit.cover,
                                        width: double.infinity,
                                      ),
                                if (isInactive)
                                  Container(
                                    color: Colors.black.withOpacity(0.4),
                                    child: const Center(
                                      child: Icon(
                                        Icons.visibility_off,
                                        color: Colors.white,
                                        size: 24,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 10.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                b.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: isInactive 
                                      ? theme.colorScheme.onSurface.withOpacity(0.6) 
                                      : theme.colorScheme.onSurface,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                b.shortDescription,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: isInactive 
                                      ? theme.colorScheme.onSurfaceVariant.withOpacity(0.6) 
                                      : theme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (isInactive)
                      Positioned(
                        top: 4,
                        right: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.orange.withOpacity(0.9),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Pasif',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 8,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemCount: displayList.length,
        ),
      );
    });
  }
}
