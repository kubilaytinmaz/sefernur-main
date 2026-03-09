import 'package:url_launcher/url_launcher.dart';

class Helpers {
  // --------------------------------------------> Url Launcher
  static openWebPage(String webPage) async {
    Uri webUrl = Uri.parse(webPage);

    if (!await launchUrl(webUrl)) {
      throw 'Could not launch $webUrl';
    }
  }
}