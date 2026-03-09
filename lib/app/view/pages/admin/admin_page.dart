import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';

import '../../../controllers/controllers.dart';
import '../../themes/theme.dart';
import 'components/car_rental/car_rental_management_tab.dart';
import 'components/currency/currency_management_tab.dart';
import 'components/guide/guide_management_tab.dart';
import 'components/hotel/hotel_management_tab.dart';
import 'components/popular_search/popular_search_management_tab.dart';
import 'components/promotion/promotion_management_tab.dart';
import 'components/reservation/reservation_management_tab.dart';
import 'components/tour/tour_management_tab.dart';
import 'components/transfer/transfer_management_tab.dart';

class AdminPage extends GetView<AdminController> {
  const AdminPage({super.key});

  // Admin panel ana rengi - AppColors.medinaGreen40
  static const Color _headerColor = AppColors.medinaGreen40;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GetBuilder<AdminController>(
      init: AdminController(),
      builder: (controller) => DefaultTabController(
        length: 9,
        child: Scaffold(
          backgroundColor: isDark ? const Color(0xFF121212) : Colors.grey[100],
          appBar: AppBar(
            title: Text(
              'Admin Panel',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
            backgroundColor: _headerColor,
            elevation: 0,
            iconTheme: const IconThemeData(color: Colors.white),
            bottom: TabBar(
              isScrollable: true,
              indicatorColor: Colors.white,
              indicatorWeight: 3,
              labelColor: Colors.white,
              tabAlignment: TabAlignment.start,
              unselectedLabelColor: Colors.white70,
              labelStyle: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
              ),
              unselectedLabelStyle: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w400,
              ),
              onTap: controller.changeTab,
              tabs: const [
                Tab(text: 'Otel Yönetimi'),
                Tab(text: 'Araç Kiralama'),
                Tab(text: 'Transfer'),
                Tab(text: 'Rehberler'),
                Tab(text: 'Turlar'),
                Tab(text: 'Popüler Arama'),
                Tab(text: 'İndirimler'),
                Tab(text: 'Rezervasyonlar'),
                Tab(text: 'Döviz Kuru'),
              ],
            ),
          ),
          body: Obx(
            () => IndexedStack(
              index: controller.selectedTabIndex.value,
              children: const [
                HotelManagementTab(),
                CarRentalManagementTab(),
                TransferManagementTab(),
                GuideManagementTab(),
                TourManagementTab(),
                PopularSearchManagementTab(),
                PromotionManagementTab(),
                ReservationManagementTab(),
                CurrencyManagementTab(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
