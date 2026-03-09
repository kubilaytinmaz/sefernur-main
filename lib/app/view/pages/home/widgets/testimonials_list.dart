import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../../controllers/home/home_controller.dart';

class TestimonialsHorizontal extends GetView<HomeController> {
  const TestimonialsHorizontal({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    return Obx(
      () => SizedBox(
        height: 140,
        child: ListView.separated(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          scrollDirection: Axis.horizontal,
          itemBuilder: (_, i) {
            final ts = controller.testimonials[i];
            return Container(
              width: 220,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isDark ? theme.colorScheme.surfaceContainerHigh : theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: isDark ? theme.colorScheme.outline.withOpacity(.3) : Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.person, size: 18, color: theme.colorScheme.onSurfaceVariant),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          ts.user,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.onSurface,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Expanded(
                    child: Text(
                      ts.comment,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 13.5,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: List.generate(
                      5,
                      (index) => Icon(
                        index < ts.rating ? Icons.star_rounded : Icons.star_border_rounded,
                        size: 16,
                        color: Colors.amber.shade600,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
          separatorBuilder: (_, __) => const SizedBox(width: 12),
          itemCount: controller.testimonials.length,
        ),
      ),
    );
  }
}
