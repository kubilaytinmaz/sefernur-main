import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/services/services.dart';

class AppColors {

  static bool get isDarkMode => Get.find<ThemeService>().isDarkMode.value;

  // Primary ve Secondary renk atamaları
  static Color get primary => !isDarkMode ? medinaGreen40 : medinaGreen40;
  static Color get onPrimary => !isDarkMode ? white : white;
  static Color get primaryContainer => !isDarkMode ? medinaGreen90 : medinaGreen30;
  static Color get onPrimaryContainer => !isDarkMode ? medinaGreen10 : medinaGreen90;

  static Color get secondary => !isDarkMode ? medinaGreen40 : medinaGreen40;
  static Color get onSecondary => !isDarkMode ? white : white;
  static Color get secondaryContainer => !isDarkMode ? medinaGreen90 : medinaGreen30;
  static Color get onSecondaryContainer => !isDarkMode ? medinaGreen10 : medinaGreen90;

  // Üçüncül Renkler
  // Üçüncül vurgu öğeleri ve az kullanılan dekoratif öğeler için kullanılır.
  static Color get tertiary => !isDarkMode ? purple40 : purple80;
  // Üçüncül rengin üzerindeki metin veya ikonlar için kullanılır.
  static Color get onTertiary => !isDarkMode ? white : purple20;
  // Üçüncül rengin daha açık veya daha koyu tonu, kapsayıcı arka planlar için kullanılır.
  static Color get tertiaryContainer => !isDarkMode ? purple90 : purple30;
  // Üçüncül kapsayıcı rengin üzerindeki metin veya ikonlar için kullanılır.
  static Color get onTertiaryContainer => !isDarkMode ? purple10 : purple90;

  // Hata Renkleri
  // Hata durumlarını belirtmek için kullanılır.
  static Color get error => !isDarkMode ? red40 : red80;
  // Hata renginin üzerindeki metin veya ikonlar için kullanılır.
  static Color get onError => !isDarkMode ? white : red20;
  // Hata durumlarında kullanılan kapsayıcı arka plan rengi.
  static Color get errorContainer => !isDarkMode ? red90 : red30;
  // Hata kapsayıcı rengin üzerindeki metin veya ikonlar için kullanılır.
  static Color get onErrorContainer => !isDarkMode ? red10 : red90;

  // Yüzey Renkleri
  // Uygulamanın genel arka planı ve kart yüzeyleri için kullanılır.
  static Color get surface => !isDarkMode ? white : black;
  // Yüzey renginin üzerindeki metin veya ikonlar için kullanılır.
  static Color get onSurface => !isDarkMode ? grey10 : grey90;
  // Yüzey renginin üzerindeki alternatif metin veya ikonlar için kullanılır.
  static Color get onSurfaceVariant => !isDarkMode ? grey30 : grey90;
  // Çerçeve ve sınır çizgileri için kullanılır.
  static Color get outline => !isDarkMode ? grey94 : grey12;
  // Çerçeve ve sınır çizgilerinin alternatif bir versiyonu.
  static Color get outlineVariant => !isDarkMode ? grey98 : grey6;

  // Diğer Renkler
  // Gölgeler için kullanılır.
  static Color get shadow => !isDarkMode ? black : black;
  // Opaklık ve ekran elemanlarının arka plan rengi.
  static Color get scrim => !isDarkMode ? black : black;
  // Ters yüzey rengi, genellikle koyu temada açık yüzeyler için kullanılır.
  static Color get inverseSurface => !isDarkMode ? grey20 : grey90;
  // Ters yüzey renginin üzerindeki metin veya ikonlar için kullanılır.
  static Color get inverseOnSurface => !isDarkMode ? grey95 : grey20;
  // Birincil rengin ters versiyonu.
  static Color get inversePrimary => !isDarkMode ? pink80 : pink40;

  // Yüzey Katman Renkleri
  // Yüzey renginin daha koyu bir tonu, arka planın daha karanlık kısımları için kullanılır.
  static Color get surfaceDim => !isDarkMode ? grey87 : grey6;
  // Yüzey renginin daha parlak bir tonu.
  static Color get surfaceBright => !isDarkMode ? white : grey24;
  // En düşük yüzey kapsayıcı rengi, daha düşük katmanlardaki yüzeyler için kullanılır.
  static Color get surfaceContainerLowest => !isDarkMode ? grey98 : grey6;
  // Düşük yüzey kapsayıcı rengi.
  static Color get surfaceContainerLow => !isDarkMode ? grey96 : grey10;
  // Yüzey kapsayıcı rengi.
  static Color get surfaceContainer => !isDarkMode ? grey94 : grey12;
  // Yüksek yüzey kapsayıcı rengi.
  static Color get surfaceContainerHigh => !isDarkMode ? grey92 : grey17;
  // En yüksek yüzey kapsayıcı rengi.
  static Color get surfaceContainerHighest => !isDarkMode ? grey90 : grey24;

  //Card Renkleri
  static Color get card => !isDarkMode ? grey99 : grey10;

  //bottomSheet Renkleri
  static Color get bottomSheet => !isDarkMode ? white : grey6;

  //dialog Renkleri
  static Color get dialog => !isDarkMode ? white : grey6;

  static const white = Color(0xFFFFFFFF);
  static const black = Color(0xFF000000);
  static const transparent = Color(0x00000000);

  // Medina Green Renkleri (#1D6B3C ana ton)
  static const medinaGreen5  = Color(0xFF08150D);
  static const medinaGreen10 = Color(0xFF0F2A19);
  static const medinaGreen15 = Color(0xFF164025);
  static const medinaGreen20 = Color(0xFF1D5531);
  static const medinaGreen25 = Color(0xFF246B3C);
  static const medinaGreen30 = Color(0xFF2E8149);
  static const medinaGreen35 = Color(0xFF379755);
  static const medinaGreen40 = Color(0xFF1D6B3C); // Ana ton
  static const medinaGreen50 = Color(0xFF4FAE74);
  static const medinaGreen60 = Color(0xFF73C38E);
  static const medinaGreen70 = Color(0xFF97D8A9);
  static const medinaGreen80 = Color(0xFFBCEEC5);
  static const medinaGreen90 = Color(0xFFDDF7E3);
  static const medinaGreen95 = Color(0xFFEAFBF0);
  static const medinaGreen98 = Color(0xFFF6FDF9);
  static const medinaGreen99 = Color(0xFFFBFEFC);

  // Teal Blue Renkleri 40C9CF
  static const tealBlue5 = Color(0xFF0A1C1D);
  static const tealBlue10 = Color(0xFF143233);
  static const tealBlue15 = Color(0xFF1E484A);
  static const tealBlue20 = Color(0xFF285E60);
  static const tealBlue25 = Color(0xFF327477);
  static const tealBlue30 = Color(0xFF3C8A8D);
  static const tealBlue35 = Color(0xFF469FA3);
  static const tealBlue40 = Color(0xFF40C9CF);
  static const tealBlue50 = Color(0xFF66D4D9);
  static const tealBlue60 = Color(0xFF8CDFE3);
  static const tealBlue70 = Color(0xFFB2EAED);
  static const tealBlue80 = Color(0xFFD9F5F7);
  static const tealBlue90 = Color(0xFFECFAFB);
  static const tealBlue95 = Color(0xFFF5FCFD);
  static const tealBlue98 = Color(0xFFFAFEFE);
  static const tealBlue99 = Color(0xFFFCFEFF);

  //Pink Renkleri FF1744
  static const pink5 = Color(0xFF40000D);
  static const pink10 = Color(0xFF660011);
  static const pink15 = Color(0xFF800015);
  static const pink20 = Color(0xFF990019);
  static const pink25 = Color(0xFFB2001E);
  static const pink30 = Color(0xFFCC0022);
  static const pink35 = Color(0xFFE50026);
  static const pink40 = Color(0xFFFF1744);
  static const pink50 = Color(0xFFFF4969);
  static const pink60 = Color(0xFFFF718D);
  static const pink70 = Color(0xFFFF9AB0);
  static const pink80 = Color(0xFFFFC2D4);
  static const pink90 = Color(0xFFFFE9F7);
  static const pink95 = Color(0xFFFFF3FA);
  static const pink98 = Color(0xFFFFF7FC);
  static const pink99 = Color(0xFFFFFBFD);


  // Orange Renkleri FA6400
  static const orange5 = Color(0xFF0D0500);
  static const orange10 = Color(0xFF1F0A00);
  static const orange15 = Color(0xFF3F1400);
  static const orange20 = Color(0xFF5F1E00);
  static const orange25 = Color(0xFF7F2800);
  static const orange30 = Color(0xFF9F3200);
  static const orange35 = Color(0xFFBF3C00);
  static const orange40 = Color(0xFFFA6400);
  static const orange50 = Color(0xFFFF6F00);
  static const orange60 = Color(0xFFFF8C32);
  static const orange70 = Color(0xFFFFA966);
  static const orange80 = Color(0xFFFFC699);
  static const orange90 = Color(0xFFFFE3CC);
  static const orange95 = Color(0xFFFFF1E5);
  static const orange98 = Color(0xFFFFF9F2);
  static const orange99 = Color(0xFFFFFCF9);


  // Grey Renkleri 666666
  static const grey4 =  Color(0xFF0a0a0a);
  static const grey5 =  Color(0xFF0d0d0d);
  static const grey6 =  Color(0xFF0f0f0f);
  static const grey7 =  Color(0xFF121212);
  static const grey8 =  Color(0xFF141414);
  static const grey9 =  Color(0xFF171717);
  static const grey10 =  Color(0xFF1a1a1a);
  static const grey11 =  Color(0xFF1c1c1c);
  static const grey12 =  Color(0xFF1f1f1f);
  static const grey17 =  Color(0xFF2b2b2b);
  static const grey20 =  Color(0xFF333333);
  static const grey24 =  Color(0xFF3d3d3d);
  static const grey25 =  Color(0xFF404040);
  static const grey30 =  Color(0xFF4d4d4d);
  static const grey35 =  Color(0xFF595959);
  static const grey40 =  Color(0xFF666666);
  static const grey50 =  Color(0xFF808080);
  static const grey60 =  Color(0xFF999999);
  static const grey70 =  Color(0xFFb3b3b3);
  static const grey80 =  Color(0xFFcccccc);
  static const grey85 =  Color(0xFFd9d9d9);
  static const grey87 =  Color(0xFFdedede);
  static const grey90 =  Color(0xFFe5e5e5);
  static const grey92 =  Color(0xFFebebeb);
  static const grey94 =  Color(0xFFf0f0f0);
  static const grey95 =  Color(0xFFf2f2f2);
  static const grey96 =  Color(0xFFf5f5f5);
  static const grey97 =  Color(0xFFf7f7f7);
  static const grey98 =  Color(0xFFfafafa);
  static const grey99 =  Color(0xFFfcfcfc);

  //Purple Renkleri 8833FF
  static const purple0 = Color(0xFF000000);
  static const purple5 = Color(0xFF0A0220);
  static const purple10 = Color(0xFF140440);
  static const purple15 = Color(0xFF1E0660);
  static const purple20 = Color(0xFF280880);
  static const purple25 = Color(0xFF3210A0);
  static const purple30 = Color(0xFF3C18C0);
  static const purple35 = Color(0xFF461FE0);
  static const purple40 = Color(0xFF8833FF);
  static const purple50 = Color(0xFF9B66FF);
  static const purple60 = Color(0xFFAE99FF);
  static const purple70 = Color(0xFFC1CCFF);
  static const purple80 = Color(0xFFD4E0FF);
  static const purple90 = Color(0xFFE8F3FF);
  static const purple95 = Color(0xFFF3F9FF);
  static const purple98 = Color(0xFFFAFDFF);
  static const purple99 = Color(0xFFFCFEFF);
  static const purple100 = Color(0xFFFFFFFF);

  //Red Renkleri E62E2E
  static const red0 = Color(0xFF000000);
  static const red5 = Color(0xFF240303);
  static const red10 = Color(0xFF440606);
  static const red15 = Color(0xFF641111);
  static const red20 = Color(0xFF841B1B);
  static const red25 = Color(0xFFA42424);
  static const red30 = Color(0xFFC42D2D);
  static const red35 = Color(0xFFE43535);
  static const red40 = Color(0xFFE62E2E);
  static const red50 = Color(0xFFEC5151);
  static const red60 = Color(0xFFF27474);
  static const red70 = Color(0xFFF79898);
  static const red80 = Color(0xFFFDBBBB);
  static const red90 = Color(0xFFFFDDDD);
  static const red95 = Color(0xFFFFEEEE);
  static const red98 = Color(0xFFFFF8F8);
  static const red99 = Color(0xFFFFFCFC);
  static const red100 = Color(0xFFFFFFFF);

  //Green Renkleri 85D8B4
  static const green0 = Color(0xFF000000);
  static const green5 = Color(0xFF0A1A15);
  static const green10 = Color(0xFF14332A);
  static const green15 = Color(0xFF1E4D3F);
  static const green20 = Color(0xFF286654);
  static const green25 = Color(0xFF328069);
  static const green30 = Color(0xFF3C997E);
  static const green35 = Color(0xFF46B393);
  static const green40 = Color(0xFF85D8B4);
  static const green50 = Color(0xFF9BE0C3);
  static const green60 = Color(0xFFB1E8D2);
  static const green70 = Color(0xFFC7F0E1);
  static const green80 = Color(0xFFDDF8F0);
  static const green90 = Color(0xFFEEFBF8);
  static const green95 = Color(0xFFF6FDFC);
  static const green98 = Color(0xFFFBFEFD);
  static const green99 = Color(0xFFFDFFFE);
  static const green100 = Color(0xFFFFFFFF);

  //Yellow Renkleri FFDE3F
  static const yellow0 = Color(0xFF000000);
  static const yellow5 = Color(0xFF1A1600);
  static const yellow10 = Color(0xFF332D00);
  static const yellow15 = Color(0xFF4D4300);
  static const yellow20 = Color(0xFF665A00);
  static const yellow25 = Color(0xFF807000);
  static const yellow30 = Color(0xFF998700);
  static const yellow35 = Color(0xFFB29D00);
  static const yellow40 = Color(0xFFFFDE3F);
  static const yellow50 = Color(0xFFFFE066);
  static const yellow60 = Color(0xFFFFE68D);
  static const yellow70 = Color(0xFFFFEAB4);
  static const yellow80 = Color(0xFFFFEECC);
  static const yellow90 = Color(0xFFFFF3E6);
  static const yellow95 = Color(0xFFFFF9F2);
  static const yellow98 = Color(0xFFFFFDFB);
  static const yellow99 = Color(0xFFFFFEFD);
  static const yellow100 = Color(0xFFFFFFFF);

  //Blue Renkleri 3361FF
  static const blue5 = Color(0xFF0A0B1A);
  static const blue10 = Color(0xFF101A3A);
  static const blue15 = Color(0xFF15234D);
  static const blue20 = Color(0xFF1A2D60);
  static const blue25 = Color(0xFF1F3673);
  static const blue30 = Color(0xFF243F86);
  static const blue35 = Color(0xFF2A48A0);
  static const blue40 = Color(0xFF3361FF);
  static const blue50 = Color(0xFF4F7FFF);
  static const blue60 = Color(0xFF6B9BFF);
  static const blue70 = Color(0xFF87B7FF);
  static const blue80 = Color(0xFFA3D3FF);
  static const blue90 = Color(0xFFBFEFFF);
  static const blue95 = Color(0xFFD7F5FF);
  static const blue98 = Color(0xFFECFAFF);
  static const blue99 = Color(0xFFF5FCFF);
}
