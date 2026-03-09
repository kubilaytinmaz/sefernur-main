import 'package:flutter/material.dart';

import '../../widgets/widget.dart';

class UnknownPage extends StatelessWidget{
  const UnknownPage({super.key});

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