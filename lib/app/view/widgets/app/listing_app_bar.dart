import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

/// A consistent AppBar for listing pages.
/// Keeps back button + title + optional actions.
class ListingAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final VoidCallback? onBack;
  const ListingAppBar({super.key, required this.title, this.actions, this.backgroundColor, this.onBack});

  @override
  Widget build(BuildContext context) {
    final bg = backgroundColor ?? Theme.of(context).primaryColor;
    return AppBar(
      backgroundColor: bg,
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: onBack ?? () => Navigator.of(context).maybePop(),
      ),
      title: Text(
        title,
        style: TextStyle(
          color: Colors.white,
          fontSize: 18.sp,
          fontWeight: FontWeight.w600,
        ),
      ),
      actions: actions,
      iconTheme: const IconThemeData(color: Colors.white),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
