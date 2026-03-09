import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class FavoriteButton extends StatefulWidget {
  final bool initial; final ValueChanged<bool>? onChanged; final EdgeInsets padding;
  const FavoriteButton({super.key, this.initial=false, this.onChanged, this.padding = const EdgeInsets.all(6)});
  @override State<FavoriteButton> createState()=> _FavoriteButtonState(); }

class _FavoriteButtonState extends State<FavoriteButton> with SingleTickerProviderStateMixin {
  late bool _fav; late AnimationController _ctrl;
  @override void initState(){ super.initState(); _fav = widget.initial; _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds:280), lowerBound: .85, upperBound:1.15); }
  @override void dispose(){ _ctrl.dispose(); super.dispose(); }
  @override void didUpdateWidget(covariant FavoriteButton old){ if (old.initial != widget.initial) _fav = widget.initial; super.didUpdateWidget(old);} 
  @override Widget build(BuildContext context)=> ScaleTransition(scale: Tween<double>(begin:1,end:1).animate(_ctrl), child: InkWell(onTap: _toggle, borderRadius: BorderRadius.circular(40.r), child: Padding(padding: widget.padding, child: Icon(_fav? Icons.favorite: Icons.favorite_border, color: _fav? Colors.redAccent: Colors.blueGrey[500], size:24.sp))));
  void _toggle(){ setState(()=> _fav=!_fav); _ctrl.forward(from:.85); widget.onChanged?.call(_fav); }
}
