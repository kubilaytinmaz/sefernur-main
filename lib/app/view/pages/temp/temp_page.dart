import 'package:flutter/material.dart';

import '../../widgets/widget.dart';

class TempPage extends StatelessWidget{
  const TempPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const PageRegion(
      child: Scaffold(
        resizeToAvoidBottomInset: false,
        body: Center()
      )
    );
  }
}