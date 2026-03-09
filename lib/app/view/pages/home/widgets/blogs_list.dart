import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../data/enums/blog_category.dart';
import '../../../../data/services/blog/blog_service.dart';
import '../../../../view/widgets/blog/blog_detail_sheet.dart';

/// Eski dummy BlogsHorizontal yerine dinamik BlogService kullanan
/// geçici adaptör. Projede kullanımı varsa kırılmayı önler.
class BlogsHorizontal extends StatelessWidget {
  final BlogCategory category;
  const BlogsHorizontal({super.key, this.category = BlogCategory.hazirlik});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final service = Get.find<BlogService>();
    return Obx(() {
      final list = service.activeByCategory(category);
      if (list.isEmpty) {
        return SizedBox(
          height: 170,
          child: Center(
            child: Text(
              'İçerik yok',
              style: TextStyle(color: theme.colorScheme.onSurfaceVariant, fontSize: 12),
            ),
          ),
        );
      }
      return SizedBox(
        height: 170,
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          scrollDirection: Axis.horizontal,
          itemBuilder: (_, i) {
            final b = list[i];
            final thumb = b.images.isNotEmpty ? b.images.first : null;
            return InkWell(
              onTap: () => BlogDetailSheet.show(b),
              child: Container(
                width: 180,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: isDark ? theme.colorScheme.outline.withOpacity(.2) : Colors.grey.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: thumb == null
                            ? Container(color: isDark ? Colors.white12 : Colors.black12)
                            : Image.network(
                                thumb,
                                fit: BoxFit.cover,
                                width: double.infinity,
                              ),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      b.title,
                      maxLines: 1, // tek satır şartı
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 14.5,
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      b.shortDescription,
                      maxLines: 1, // tek satır şartı
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 12.5,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemCount: list.length,
        ),
      );
    });
  }
}
