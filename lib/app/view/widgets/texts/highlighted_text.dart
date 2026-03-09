import 'package:flutter/material.dart';

class HighlightedText extends StatelessWidget {
  final String text;
  final String highlightText;
  final TextStyle textStyle;
  final TextStyle highlightStyle;

  const HighlightedText({
    super.key,
    required this.text,
    required this.highlightText,
    required this.textStyle,
    required this.highlightStyle,
  });

  @override
  Widget build(BuildContext context) {
    List<TextSpan> spans = [];
    int start = 0;
    int indexOfHighlight;
    while ((indexOfHighlight = text.indexOf(highlightText, start)) != -1) {
      if (indexOfHighlight > start) {
        spans.add(
          TextSpan(
            text: text.substring(start, indexOfHighlight), 
            style: textStyle
          )
        );
      }
      spans.add(
        TextSpan(
          text: highlightText, 
          style: highlightStyle
        )
      );
      start = indexOfHighlight + highlightText.length;
    }
    if (start < text.length) {
      spans.add(
        TextSpan(
          text: text.substring(start, text.length), 
          style: textStyle
        )
      );
    }

    return RichText(
      textAlign: TextAlign.center,
      text: TextSpan(children: spans),
    );
  }
}