import 'en_us/en_us_translation.dart';
import 'tr_tr/tr_tr_translation.dart';

abstract class AppTranslation {
  static Map<String, Map<String, String>> translations = {
    'en_US' : enUS,
    'tr_TR' : trTR
  };
}