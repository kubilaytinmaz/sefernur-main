import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../data/models/payment/paytr_models.dart';
import '../../../data/services/payment/paytr_service.dart';

/// PayTR iFrame Ödeme Sayfası
/// 
/// WebView içinde PayTR ödeme formunu gösterir.
/// Ödeme sonucu deep link ile yakalanır.
class PayTrPaymentPage extends StatefulWidget {
  /// iFrame URL'i - Doğrudan parametre veya Get.arguments üzerinden geçilebilir
  final String? iframeUrl;
  final String? orderId;
  final double? amount;
  final String? currency;
  final VoidCallback? onSuccess;
  final VoidCallback? onFailed;
  
  const PayTrPaymentPage({
    super.key,
    this.iframeUrl,
    this.orderId,
    this.amount,
    this.currency,
    this.onSuccess,
    this.onFailed,
  });

  @override
  State<PayTrPaymentPage> createState() => _PayTrPaymentPageState();
}

class _PayTrPaymentPageState extends State<PayTrPaymentPage> {
  late WebViewController _controller;
  late PayTrService _payTrService;
  
  bool _isLoading = true;
  String? _errorMessage;
  
  // Argümanlar
  late String _iframeUrl;
  late String _orderId;
  late double _amount;
  late String _currency;
  VoidCallback? _onSuccess;
  VoidCallback? _onFailed;

  @override
  void initState() {
    super.initState();
    _payTrService = Get.find<PayTrService>();
    _initArguments();
    _initWebView();
  }

  void _initArguments() {
    // Widget parametreleri öncelikli, yoksa Get.arguments kullan
    if (widget.iframeUrl != null) {
      _iframeUrl = widget.iframeUrl!;
      _orderId = widget.orderId ?? '';
      _amount = widget.amount ?? 0.0;
      _currency = widget.currency ?? 'TRY';
      _onSuccess = widget.onSuccess;
      _onFailed = widget.onFailed;
    } else {
      final args = Get.arguments as Map<String, dynamic>;
      _iframeUrl = args['iframeUrl'] as String;
      _orderId = args['orderId'] as String;
      _amount = args['amount'] as double;
      _currency = args['currency'] as String? ?? 'TRY';
      _onSuccess = args['onSuccess'] as VoidCallback?;
      _onFailed = args['onFailed'] as VoidCallback?;
    }
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            print('[PayTR WebView] Page started: $url');
            setState(() => _isLoading = true);
          },
          onPageFinished: (url) {
            print('[PayTR WebView] Page finished: $url');
            setState(() => _isLoading = false);
          },
          onWebResourceError: (error) {
            print('[PayTR WebView] Error: ${error.description}');
            setState(() {
              _isLoading = false;
              _errorMessage = 'Sayfa yüklenemedi: ${error.description}';
            });
          },
          onNavigationRequest: (request) {
            final url = request.url;
            print('[PayTR WebView] Navigation request: $url');
            
            // Deep link kontrolü
            if (url.startsWith('sefernur://payment/success')) {
              _handlePaymentSuccess();
              return NavigationDecision.prevent;
            } else if (url.startsWith('sefernur://payment/fail')) {
              _handlePaymentFailed();
              return NavigationDecision.prevent;
            }
            
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(_iframeUrl));
  }

  void _handlePaymentSuccess() {
    print('[PayTR] Payment success!');
    _payTrService.updatePaymentStatus(PayTrPaymentStatus.success);
    
    Get.back(result: PayTrPaymentResult(
      status: PayTrPaymentStatus.success,
      transactionId: _orderId,
      amount: _amount,
    ));
    
    _onSuccess?.call();
  }

  void _handlePaymentFailed() {
    print('[PayTR] Payment failed!');
    _payTrService.updatePaymentStatus(PayTrPaymentStatus.failed);
    
    Get.back(result: PayTrPaymentResult(
      status: PayTrPaymentStatus.failed,
      transactionId: _orderId,
      errorMessage: 'Ödeme başarısız',
    ));
    
    _onFailed?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Ödeme - ${_amount.toStringAsFixed(2)} $_currency', style: TextStyle(fontSize: 16.sp)),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            _showCancelDialog();
          },
        ),
        actions: [
          if (_isLoading)
            Padding(
              padding: EdgeInsets.only(right: 16.w),
              child: Center(
                child: SizedBox(
                  width: 20.w,
                  height: 20.w,
                  child: const CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
        ],
      ),
      body: _errorMessage != null
          ? _buildErrorView()
          : Stack(
              children: [
                WebViewWidget(controller: _controller),
                if (_isLoading)
                  Container(
                    color: Colors.white,
                    child: const Center(
                      child: CircularProgressIndicator(),
                    ),
                  ),
              ],
            ),
      bottomNavigationBar: _buildSecurityBanner(),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64.sp, color: Colors.red[300]),
            SizedBox(height: 16.h),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14.sp, color: Colors.grey[600]),
            ),
            SizedBox(height: 24.h),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _errorMessage = null;
                  _isLoading = true;
                });
                _controller.loadRequest(Uri.parse(_iframeUrl));
              },
              child: const Text('Tekrar Dene'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSecurityBanner() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        border: Border(top: BorderSide(color: Colors.grey[300]!)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock, size: 16.sp, color: Colors.green[700]),
            SizedBox(width: 8.w),
            Text(
              '256-bit SSL ile güvenli ödeme',
              style: TextStyle(
                fontSize: 12.sp,
                color: Colors.grey[700],
              ),
            ),
            SizedBox(width: 16.w),
            Image.network(
              'https://www.paytr.com/img/paytr-logo.svg',
              height: 20.h,
              errorBuilder: (_, __, ___) => Text(
                'PayTR',
                style: TextStyle(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue[800],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCancelDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Ödemeyi İptal Et'),
        content: const Text(
          'Ödeme işlemini iptal etmek istediğinizden emin misiniz?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Devam Et'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _payTrService.cancelPayment();
              Get.back(result: PayTrPaymentResult(
                status: PayTrPaymentStatus.cancelled,
                transactionId: _orderId,
              ));
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('İptal Et'),
          ),
        ],
      ),
    );
  }
}
