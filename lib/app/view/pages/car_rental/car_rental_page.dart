import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../widgets/app/listing_app_bar.dart';
import '../../widgets/search/floating_search_shortcut_button.dart';
import 'car_rental_content.dart';

class CarRentalPage extends StatelessWidget {
  const CarRentalPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Get.theme.scaffoldBackgroundColor,
      appBar: const ListingAppBar(title: 'Taxi'),
      body: const CarRentalContent(),
      floatingActionButton: const FloatingSearchShortcutButton(searchTabIndex: 3),
    );
  }
}
