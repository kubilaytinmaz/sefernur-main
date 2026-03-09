import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../data/enums/enums.dart';
import 'iconed_button.dart';

class ProgressButton extends StatefulWidget {
  final Map<ButtonType, Widget> stateWidgets;
  final Map<ButtonType, Color> stateColors;
  final Function? onPressed;
  final Function? onAnimationEnd;
  final ButtonType? state;
  final double minWidth;
  final double maxWidth;
  final double radius;
  final double height;
  final ProgressIndicator? progressIndicator;
  final double progressIndicatorSize;
  final MainAxisAlignment progressIndicatorAlignment;
  final EdgeInsets padding;
  final List<ButtonType> minWidthStates;
  final Duration animationDuration;

  ProgressButton({
    super.key,
    required this.stateWidgets,
    required this.stateColors,
    this.state = ButtonType.idle,
    this.onPressed,
    this.onAnimationEnd,
    this.minWidth = 200.0,
    this.maxWidth = 400.0,
    this.radius = 16.0,
    this.height = 53.0,
    this.progressIndicatorSize = 35.0,
    this.progressIndicator,
    this.progressIndicatorAlignment = MainAxisAlignment.spaceBetween,
    this.padding = EdgeInsets.zero,
    this.minWidthStates = const <ButtonType>[ButtonType.loading],
    this.animationDuration = const Duration(milliseconds: 500)}
  ) : assert(
      stateWidgets.keys.toSet().containsAll(ButtonType.values.toSet()),
      'Must be non-null widgetds provided in map of stateWidgets. Missing keys => ${ButtonType.values.toSet().difference(stateWidgets.keys.toSet())}',
    ),
    assert(
      stateColors.keys.toSet().containsAll(ButtonType.values.toSet()),
      'Must be non-null widgetds provided in map of stateWidgets. Missing keys => ${ButtonType.values.toSet().difference(stateColors.keys.toSet())}',
    );

  @override
  State<StatefulWidget> createState() {
    return _ProgressButtonType();
  }

  factory ProgressButton.icon({
    required Map<ButtonType, IconedButton> iconedButtons,
    Function? onPressed,
    ButtonType? state = ButtonType.idle,
    Function? animationEnd,
    maxWidth = 170.0,
    minWidth = 58.0,
    height = 53.0,
    radius = 100.0,
    progressIndicatorSize = 35.0,
    double iconPadding = 4.0,
    TextStyle? textStyle,
    CircularProgressIndicator? progressIndicator,
    MainAxisAlignment? progressIndicatorAlignment,
    EdgeInsets padding = EdgeInsets.zero,
    List<ButtonType> minWidthStates = const <ButtonType>[ButtonType.loading],
  }) {
    assert(
      iconedButtons.keys.toSet().containsAll(ButtonType.values.toSet()),
      'Must be non-null widgets provided in map of stateWidgets. Missing keys => ${ButtonType.values.toSet().difference(iconedButtons.keys.toSet())}',
    );

    textStyle ??= const TextStyle(color: Colors.white, fontWeight: FontWeight.w500);

    Map<ButtonType, Widget> stateWidgets = {
      ButtonType.idle: buildChildWithIcon(iconedButtons[ButtonType.idle]!, iconPadding, textStyle),
      ButtonType.loading: buildChildWithIcon(iconedButtons[ButtonType.loading]!, iconPadding, textStyle),
      ButtonType.fail: buildChildWithIcon(iconedButtons[ButtonType.fail]!, iconPadding, textStyle),
      ButtonType.success: buildChildWithIcon(iconedButtons[ButtonType.success]!, iconPadding, textStyle)
    };

    Map<ButtonType, Color> stateColors = {
      ButtonType.idle: iconedButtons[ButtonType.idle]!.color,
      ButtonType.loading: iconedButtons[ButtonType.loading]!.color,
      ButtonType.fail: iconedButtons[ButtonType.fail]!.color,
      ButtonType.success: iconedButtons[ButtonType.success]!.color,
    };

    return ProgressButton(
      stateWidgets: stateWidgets,
      stateColors: stateColors,
      state: state,
      onPressed: onPressed,
      onAnimationEnd: animationEnd,
      maxWidth: maxWidth,
      minWidth: minWidth,
      radius: radius,
      height: height,
      progressIndicatorSize: progressIndicatorSize,
      progressIndicatorAlignment: MainAxisAlignment.center,
      progressIndicator: progressIndicator,
      minWidthStates: minWidthStates,
    );
  }
}

class _ProgressButtonType extends State<ProgressButton> with TickerProviderStateMixin {
  AnimationController? colorAnimationController;
  Animation<Color?>? colorAnimation;
  double? width;
  Widget? progressIndicator;

  void startAnimations(ButtonType? oldState, ButtonType? newState) {
    Color? begin = widget.stateColors[oldState!];
    Color? end = widget.stateColors[newState!];
    if (widget.minWidthStates.contains(newState)) {
      width = widget.minWidth;
    } else {
      width = widget.maxWidth;
    }
    colorAnimation = ColorTween(begin: begin, end: end).animate(CurvedAnimation(
      parent: colorAnimationController!,
      curve: const Interval(
        0,
        1,
        curve: Curves.easeIn,
      ),
    ));
    colorAnimationController!.forward();
  }

  Color? get backgroundColor => colorAnimation == null 
  ? widget.stateColors[widget.state!] 
  : colorAnimation!.value ?? widget.stateColors[widget.state!];

  @override
  void initState() {
    super.initState();

    width = widget.maxWidth;

    colorAnimationController = AnimationController(duration: widget.animationDuration, vsync: this);
    colorAnimationController!.addStatusListener((status) {
      if (widget.onAnimationEnd != null) {
        widget.onAnimationEnd!(status, widget.state);
      }
    });

    progressIndicator = widget.progressIndicator ?? CircularProgressIndicator(
      backgroundColor: widget.stateColors[widget.state!],
      valueColor: const AlwaysStoppedAnimation<Color>(Colors.white)
    );
  }

  @override
  void dispose() {
    colorAnimationController!.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(ProgressButton oldWidget) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.state != widget.state) {
      colorAnimationController?.reset();
      startAnimations(oldWidget.state, widget.state);
    }
  }

  Widget getButtonChild(bool visibility) {
    Widget? buttonChild = widget.stateWidgets[widget.state!];
    if (widget.state == ButtonType.loading) {
      return Row(
        mainAxisAlignment: widget.progressIndicatorAlignment,
        children: <Widget>[
          SizedBox(
            width: widget.progressIndicatorSize,
            height: widget.progressIndicatorSize,
            child: progressIndicator,
          ),
          widget.progressIndicatorAlignment == MainAxisAlignment.center 
          ? SizedBox(width: 16.w) : const SizedBox(),
          buttonChild ?? Container(),
          Container()
        ],
      );
    }
    return AnimatedOpacity(
      opacity: visibility ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 250),
      child: buttonChild
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: colorAnimationController!,
      builder: (context, child) {
        return AnimatedContainer(
          width: width,
          height: widget.height,
          duration: widget.animationDuration,
          child: MaterialButton(
            padding: widget.padding,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(widget.radius),
              side: const BorderSide(color: Colors.transparent, width: 0)
            ),
            color: backgroundColor,
            onPressed: widget.onPressed as void Function()?,
            child: getButtonChild(
              colorAnimation == null ? true : colorAnimation!.isCompleted
            ),
          )
        );
      },
    );
  }
}