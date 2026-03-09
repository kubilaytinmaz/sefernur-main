import 'package:get/get.dart';
import 'package:flutter/material.dart';

import '../services.dart';

class LanguageEntity {
  final String name;
  final Locale locale;
  const LanguageEntity({
    required this.name, 
    required this.locale
  });
}

class LanguageService extends GetxService{
  StorageService? stroge;

  final languages = [
    const LanguageEntity(
      name: 'english',
      locale: Locale('en', 'US'),
    ),
    const LanguageEntity(
      name: 'turkish',
      locale: Locale('tr', 'TR'),
    ),
  ];

  var langCode = "en".obs;

  final isDropDownMenuShow = false.obs;
  var searchItems = RxList<LanguageEntity>([]);

  Future<LanguageService> init() async {
    stroge = Get.find<StorageService>();
    searchItems.addAll(languages);
    return this;
  }

  Locale getLocale() {
    Locale locale;

    if (stroge!.langugeCode() != null && stroge!.countryCode() != null) {
      locale = Locale(stroge!.langugeCode(), stroge!.countryCode());
    } else {
      if (Get.deviceLocale!.languageCode == 'tr') {
        locale = const Locale('tr', 'TR');
      } else {
        locale = const Locale('en', 'US');
      }
      stroge!.changeLanguge(locale.languageCode, locale.countryCode!);
    }
    
    langCode.value = locale.languageCode;
    return locale;
  }

  LanguageEntity getLanguageEntity() {
    LanguageEntity languageEntity = languages[0];
    var localLanguageCode = stroge!.langugeCode();

    for (var i = 0; i < languages.length; i++) {
      if (localLanguageCode == languages[i].locale.languageCode) {
        languageEntity = languages[i];
        break;
      }
    }

    return languageEntity;
  }

  Future<List<LanguageEntity>> searchLanguage(String query) async {
    List<LanguageEntity> dummySearchList = [];
    dummySearchList.addAll(languages);
    if (query.isNotEmpty) {
      List<LanguageEntity> dummyListData = [];
      for (var item in dummySearchList) {
        if (item.name.toLowerCase().contains(query)) {
          dummyListData.add(item);
        }
      }
      searchItems.value = [];
      searchItems.addAll(dummyListData);
      return searchItems;
    } else {
      searchItems.value = [];
      searchItems.addAll(languages);
      return searchItems;
    }
  }

  void changeLanguage(Locale locale) async {
    langCode.value = locale.languageCode;
    Get.updateLocale(locale);
    stroge!.changeLanguge(locale.languageCode, locale.countryCode!);
    Get.offAllNamed('/');
  }
  
  void changeMenuState(bool value) {
    isDropDownMenuShow.value = value;
  }
}