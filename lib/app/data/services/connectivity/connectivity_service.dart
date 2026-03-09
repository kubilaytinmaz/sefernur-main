import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';

import '../../../dev_utils/dev_utils.dart';
import '../../../view/widgets/widget.dart';

class ConnectivityService extends GetxService {
  RxBool isConnected = true.obs;
  bool _isAppReady = false;

  Future<ConnectivityService> init() async {
    initConnectivityStream();
    // App hazır olduğunda snackbar gösterebilmek için gecikme ekle
    _waitForAppReady();
    return this;
  }

  /// MaterialApp'in hazır olmasını bekler
  void _waitForAppReady() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(milliseconds: 500), () {
        _isAppReady = true;
      });
    });
  }

  void initConnectivityStream() {
    Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      for (var result in results) {
        cprint("Connection status changed: $result");
        if (result == ConnectivityResult.none) {
          _showSnackbarSafe(() => FailureSnackBar.show("noNetworkConnection".tr));
        } else {
          InternetConnection().hasInternetAccess.then((hasInternet) {
            if (!hasInternet) {
              _showSnackbarSafe(() => FailureSnackBar.show("internetConnectionNotFound".tr));
            }
          });
        }
      }
    });
  }

  /// Snackbar'ı sadece app hazır olduğunda gösterir
  void _showSnackbarSafe(VoidCallback showSnackbar) {
    if (_isAppReady && Get.overlayContext != null) {
      showSnackbar();
    }
  }

  Future<bool> checkIfConnectedByConnectivity() async {
    var connectivityResult = await Connectivity().checkConnectivity();
    isConnected.value = connectivityResult.contains(ConnectivityResult.mobile) ||
        connectivityResult.contains(ConnectivityResult.wifi);
    if (isConnected.value) {
       var hasInternet =await InternetConnection().hasInternetAccess;
      isConnected.value = hasInternet;
    }
    return isConnected.value;
  }
}
