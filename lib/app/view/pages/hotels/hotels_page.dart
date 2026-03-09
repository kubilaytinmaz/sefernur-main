import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../widgets/app/listing_app_bar.dart';
import '../../widgets/search/floating_search_shortcut_button.dart';
import 'hotels_content.dart';

class HotelsPage extends StatelessWidget {
  const HotelsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Get.theme.scaffoldBackgroundColor,
      appBar: const ListingAppBar(title: 'Oteller'),
      body: const HotelsContent(),
      floatingActionButton: const FloatingSearchShortcutButton(searchTabIndex: 0),
    );
  }
}
