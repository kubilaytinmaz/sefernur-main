import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../data/models/payment/kuveytturk_models.dart';
import '../../../data/providers/payment/kuveytturk_config.dart';
import '../../../data/services/payment/kuveytturk_service.dart';

/// KuveytTürk 3D Secure Ödeme Sayfası
/// 
/// WebView içinde 3D doğrulama formunu gösterir.
/// Başarılı doğrulama sonrası ödemeyi otomatik tamamlar.
class KuveytTurkPaymentPage extends StatefulWidget {
  /// 3D ödeme HTML formu
  final String? htmlContent;
  final String? orderId;
  final double? amount;
  final String? currency;
  final VoidCallback? onSuccess;
  final VoidCallback? onFailed;
  final Function(KuveytTurkPaymentResult)? onResult;
  
  const KuveytTurkPaymentPage({
    super.key,
    this.htmlContent,
    this.orderId,
    this.amount,
    this.currency,
    this.onSuccess,
    this.onFailed,
    this.onResult,
  });

  @override
  State<KuveytTurkPaymentPage> createState() => _KuveytTurkPaymentPageState();
}

class _KuveytTurkPaymentPageState extends State<KuveytTurkPaymentPage> {
  late WebViewController _controller;
  late KuveytTurkService _kuveytTurkService;
  
  bool _isLoading = true;
  String? _errorMessage;
  bool _isProcessingAuth = false;
  
  // Argümanlar
  late String _htmlContent;
  String? _orderId; // Opsiyonel, loglama için kullanılır
  late double _amount;
  late String _currency;
  VoidCallback? _onSuccess;
  VoidCallback? _onFailed;
  Function(KuveytTurkPaymentResult)? _onResult;

  @override
  void initState() {
    super.initState();
    _kuveytTurkService = Get.find<KuveytTurkService>();
    _initArguments();
    _initWebView();
  }

  void _initArguments() {
    // Widget parametreleri öncelikli, yoksa Get.arguments kullan
    if (widget.htmlContent != null) {
      _htmlContent = widget.htmlContent!;
      _orderId = widget.orderId ?? '';
      _amount = widget.amount ?? 0.0;
      _currency = widget.currency ?? 'TRY';
      _onSuccess = widget.onSuccess;
      _onFailed = widget.onFailed;
      _onResult = widget.onResult;
    } else {
      final args = Get.arguments as Map<String, dynamic>;
      _htmlContent = args['htmlContent'] as String;
      _orderId = args['orderId'] as String? ?? '';
      _amount = args['amount'] as double? ?? 0.0;
      _currency = args['currency'] as String? ?? 'TRY';
      _onSuccess = args['onSuccess'] as VoidCallback?;
      _onFailed = args['onFailed'] as VoidCallback?;
      _onResult = args['onResult'] as Function(KuveytTurkPaymentResult)?;
    }
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            print('[KuveytTurk WebView] Page started: $url');
            if (mounted) setState(() => _isLoading = true);
          },
          onPageFinished: (url) {
            print('[KuveytTurk WebView] Page finished: $url');
            if (mounted) setState(() => _isLoading = false);
            
            // AuthenticationResponse SADECE OkUrl/FailUrl'de aranmalı
            // Ara sayfalarda (BKM 3D Secure, ACS) aranmamalı
            if (url.contains(KuveytTurkConfig.okUrl) ||
                url.contains('payment/kuveytturk/callback') ||
                url.contains(KuveytTurkConfig.failUrl) ||
                url.contains('payment/kuveytturk/fail')) {
              _checkForAuthResponse();
            }
          },
          onWebResourceError: (error) {
            print('[KuveytTurk WebView] Error: ${error.description}');
            if (mounted) {
              setState(() {
                _isLoading = false;
                _errorMessage = 'Sayfa yüklenemedi: ${error.description}';
              });
            }
          },
          onNavigationRequest: (request) {
            final url = request.url;
            print('[KuveytTurk WebView] Navigation request: $url');
            
            // OkUrl veya FailUrl kontrolü
            if (url.contains(KuveytTurkConfig.okUrl) || 
                url.contains('payment/kuveytturk/callback')) {
              // Başarılı yönlendirme - AuthenticationResponse'u yakala
              _extractAndProcessAuthResponse();
              return NavigationDecision.prevent;
            } else if (url.contains(KuveytTurkConfig.failUrl) || 
                       url.contains('payment/kuveytturk/fail')) {
              _handlePaymentFailed('3D doğrulama başarısız');
              return NavigationDecision.prevent;
            }
            
            // Deep link kontrolü
            if (url.startsWith('sefernur://payment/success')) {
              _extractAndProcessAuthResponse();
              return NavigationDecision.prevent;
            } else if (url.startsWith('sefernur://payment/fail')) {
              _handlePaymentFailed('Ödeme başarısız');
              return NavigationDecision.prevent;
            }
            
            return NavigationDecision.navigate;
          },
        ),
      );
    
    // HTML içeriği yükle
    _loadHtmlContent();
  }

  void _loadHtmlContent() {
    // HTML içeriğini base64 olarak yükle veya loadHtmlString kullan
    final htmlWithBase = '''
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; }
    iframe { width: 100%; height: 100vh; border: none; }
  </style>
</head>
<body>
$_htmlContent
</body>
</html>
''';
    
    _controller.loadHtmlString(htmlWithBase);
  }

  /// AuthenticationResponse'u kontrol et
  Future<void> _checkForAuthResponse() async {
    if (_isProcessingAuth) return;
    
    try {
      // JavaScript ile form'dan AuthenticationResponse'u al
      final result = await _controller.runJavaScriptReturningResult('''
        (function() {
          var authInput = document.querySelector('input[name="AuthenticationResponse"]');
          if (authInput && authInput.value) return authInput.value;
          
          // Form data'dan al
          var forms = document.forms;
          for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            var authField = form.elements['AuthenticationResponse'];
            if (authField && authField.value) return authField.value;
          }
          return '';
        })();
      ''');
      
      final resultStr = _cleanJsResult(result.toString());
      if (resultStr.isNotEmpty) {
        _processAuthResponse(resultStr);
      }
    } catch (e) {
      print('[KuveytTurk] Check auth response error: $e');
    }
  }

  /// AuthenticationResponse'u çıkar ve işle
  Future<void> _extractAndProcessAuthResponse() async {
    if (_isProcessingAuth) return;
    
    try {
      // JavaScript ile AuthenticationResponse'u al
      final result = await _controller.runJavaScriptReturningResult('''
        (function() {
          // POST data'dan al
          var authInput = document.querySelector('input[name="AuthenticationResponse"]');
          if (authInput && authInput.value) return authInput.value;
          
          // Body içeriğinden al
          var bodyText = document.body.innerText || document.body.textContent;
          if (bodyText && bodyText.indexOf('ResponseCode') !== -1) return bodyText;
          
          return '';
        })();
      ''');
      
      final resultStr = _cleanJsResult(result.toString());
      if (resultStr.isNotEmpty) {
        _processAuthResponse(resultStr);
      } else {
        // Son çare - sayfanın tüm içeriğini al
        final pageContent = await _controller.runJavaScriptReturningResult(
          'document.documentElement.outerHTML'
        );
        final pageContentStr = _cleanJsResult(pageContent.toString());
        if (pageContentStr.isNotEmpty) {
          _tryParseFromPageContent(pageContentStr);
        }
      }
    } catch (e) {
      print('[KuveytTurk] Extract auth response error: $e');
      _handlePaymentFailed('Doğrulama yanıtı alınamadı');
    }
  }

  /// Sayfa içeriğinden AuthenticationResponse parse et
  void _tryParseFromPageContent(String content) {
    // ResponseCode ve MD değerlerini bul
    final mdMatch = RegExp(r'<MD>([^<]+)</MD>').firstMatch(content);
    final responseCodeMatch = RegExp(r'<ResponseCode>([^<]+)</ResponseCode>').firstMatch(content);
    
    if (mdMatch != null && responseCodeMatch != null) {
      final md = mdMatch.group(1);
      final responseCode = responseCodeMatch.group(1);
      
      if (responseCode == '00' && md != null && md.isNotEmpty) {
        _completePaymentWithMD(md);
      } else {
        final messageMatch = RegExp(r'<ResponseMessage>([^<]+)</ResponseMessage>').firstMatch(content);
        final message = messageMatch?.group(1) ?? 'Doğrulama başarısız';
        _handlePaymentFailed(message);
      }
    } else {
      _handlePaymentFailed('Doğrulama yanıtı parse edilemedi');
    }
  }

  /// WebView JavaScript sonucunu temizle
  /// WebView'dan gelen değerler bazen tırnak içinde veya "null" olarak gelir
  String _cleanJsResult(String value) {
    var cleaned = value.trim();
    // Boş/null kontrolleri
    if (cleaned.isEmpty || 
        cleaned == 'null' || 
        cleaned == '"null"' ||
        cleaned == "'null'" ||
        cleaned == '""' ||
        cleaned == "''") {
      return '';
    }
    // Dış tırnakları kaldır (WebView bazen string değerleri tırnakla sarar)
    if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    // Tekrar null kontrolü
    if (cleaned == 'null' || cleaned.isEmpty) return '';
    return cleaned;
  }

  /// AuthenticationResponse'u işle
  void _processAuthResponse(String authResponse) {
    if (_isProcessingAuth) return;
    setState(() => _isProcessingAuth = true);
    
    print('[KuveytTurk] Processing AuthResponse for order: $_orderId');
    
    try {
      final response = _kuveytTurkService.parseAuthResponse(authResponse);
      
      if (response.isCardVerified && response.md != null) {
        // Kart doğrulandı, ödemeyi tamamla
        _completePaymentWithMD(response.md!);
      } else {
        _handlePaymentFailed(response.responseMessage);
      }
    } catch (e) {
      print('[KuveytTurk] AuthResponse parse error: $e');
      // Parse hatası durumunda sayfayı kapatma, kullanıcı devam edebilsin
      setState(() => _isProcessingAuth = false);
    }
  }

  /// MD ile ödemeyi tamamla
  Future<void> _completePaymentWithMD(String md) async {
    print('[KuveytTurk] Completing payment with MD: $md');
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _kuveytTurkService.completePayment(md: md);

    if (result.isSuccess) {
      _handlePaymentSuccess(result);
    } else {
      _handlePaymentFailed(result.errorMessage ?? 'Ödeme tamamlanamadı');
    }
  }

  void _handlePaymentSuccess(KuveytTurkPaymentResult result) {
    print('[KuveytTurk] Payment success!');
    _kuveytTurkService.updatePaymentStatus(KuveytTurkPaymentStatus.success);
    
    _onResult?.call(result);
    _onSuccess?.call();

    if (mounted && Navigator.of(context).canPop()) {
      Navigator.of(context).pop(result);
    }
  }

  void _handlePaymentFailed(String? errorMessage) {
    print('[KuveytTurk] Payment failed: $errorMessage');
    _kuveytTurkService.updatePaymentStatus(KuveytTurkPaymentStatus.failed);
    
    final result = KuveytTurkPaymentResult.failed(
      errorMessage: errorMessage,
    );
    
    _onResult?.call(result);
    _onFailed?.call();

    if (mounted && Navigator.of(context).canPop()) {
      Navigator.of(context).pop(result);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Ödeme - ${_amount.toStringAsFixed(2)} $_currency', 
          style: TextStyle(fontSize: 16.sp),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: _showCancelDialog,
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
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const CircularProgressIndicator(),
                          SizedBox(height: 16.h),
                          Text(
                            _isProcessingAuth 
                                ? 'Ödeme tamamlanıyor...' 
                                : 'Yükleniyor...',
                            style: TextStyle(fontSize: 14.sp),
                          ),
                        ],
                      ),
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
              style: TextStyle(fontSize: 16.sp, color: Colors.grey[600]),
            ),
            SizedBox(height: 24.h),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _errorMessage = null;
                  _isLoading = true;
                  _isProcessingAuth = false;
                });
                _loadHtmlContent();
              },
              child: const Text('Tekrar Dene'),
            ),
            SizedBox(height: 12.h),
            TextButton(
              onPressed: () {
                if (Navigator.of(context).canPop()) Navigator.of(context).pop();
              },
              child: const Text('Geri Dön'),
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
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.lock, size: 16.sp, color: Colors.green[700]),
            SizedBox(width: 8.w),
            Text(
              'KuveytTürk 3D Secure ile güvenli ödeme',
              style: TextStyle(
                fontSize: 12.sp,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showCancelDialog() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Ödemeyi İptal Et'),
        content: const Text('Ödeme işlemini iptal etmek istediğinizden emin misiniz?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Hayır'),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Evet, İptal Et'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      _kuveytTurkService.updatePaymentStatus(KuveytTurkPaymentStatus.cancelled);
      Navigator.of(context).pop(KuveytTurkPaymentResult.cancelled());
    }
  }
}
