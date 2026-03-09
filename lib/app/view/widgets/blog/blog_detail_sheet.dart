import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/models/blog/blog_model.dart';
import '../../../data/services/auth/auth_service.dart';
import '../../themes/colors/app_colors.dart';
import 'blog_edit_sheet.dart';

class BlogDetailSheet extends StatefulWidget {
  final BlogModel model;
  const BlogDetailSheet({super.key, required this.model});

  static Future<void> show(BlogModel m) async {
    Get.bottomSheet(
      BlogDetailSheet(model: m),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      enableDrag: true,
    );
  }

  @override
  State<BlogDetailSheet> createState() => _BlogDetailSheetState();
}

class _BlogDetailSheetState extends State<BlogDetailSheet> {
  int _page = 0;
  bool get _isAdmin => Get.find<AuthService>().isUserAdmin();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final surfaceColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtitleColor = isDark ? Colors.grey.shade400 : Colors.grey.shade600;

    final m = widget.model;
    const radius = BorderRadius.only(
      topLeft: Radius.circular(26),
      topRight: Radius.circular(26),
    );

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.4,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Material(
          color: surfaceColor,
          borderRadius: radius,
          clipBehavior: Clip.antiAlias,
          elevation: 8,
          child: Column(
            children: [
              _Header(
                title: m.title,
                onClose: () => Navigator.of(context).pop(),
                onEdit: _isAdmin
                    ? () {
                        Navigator.of(context).pop();
                        BlogEditSheet.show(m);
                      }
                    : null,
                isDark: isDark,
                textColor: textColor,
                subtitleColor: subtitleColor,
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(18, 10, 18, 24),
                  children: [
                    if (m.images.isNotEmpty) _slider(m, isDark),
                    const SizedBox(height: 14),
                    Text(
                      m.shortDescription,
                      style: TextStyle(
                        fontSize: 13.5,
                        height: 1.35,
                        fontWeight: FontWeight.w600,
                        color: textColor,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      m.longDescription,
                      style: TextStyle(
                        fontSize: 13.2,
                        height: 1.4,
                        color: subtitleColor,
                      ),
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _slider(BlogModel m, bool isDark) {
    return Column(
      children: [
        SizedBox(
          height: 200,
          child: PageView.builder(
            itemCount: m.images.length,
            onPageChanged: (i) => setState(() => _page = i),
            itemBuilder: (_, i) => ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: Image.network(m.images[i], fit: BoxFit.cover),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            for (int i = 0; i < m.images.length; i++)
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: _page == i ? 18 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: _page == i
                      ? AppColors.medinaGreen40
                      : (isDark
                          ? Colors.grey.shade700
                          : AppColors.medinaGreen40.withOpacity(.25)),
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
          ],
        ),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  final String title;
  final VoidCallback onClose;
  final VoidCallback? onEdit;
  final bool isDark;
  final Color textColor;
  final Color subtitleColor;

  const _Header({
    required this.title,
    required this.onClose,
    this.onEdit,
    required this.isDark,
    required this.textColor,
    required this.subtitleColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Drag handle
        Center(
          child: Container(
            width: 48,
            height: 5,
            margin: const EdgeInsets.only(top: 12, bottom: 8),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey.shade600 : Colors.grey.shade400,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(18, 6, 6, 4),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                ),
              ),
              if (onEdit != null)
                IconButton(
                  onPressed: onEdit,
                  icon: Icon(Icons.edit_note_rounded, color: subtitleColor),
                ),
              IconButton(
                onPressed: onClose,
                icon: Icon(Icons.close_rounded, color: subtitleColor),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
