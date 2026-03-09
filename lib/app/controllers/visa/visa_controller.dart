import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../data/models/visa/visa_application_model.dart';
import '../../data/repositories/visa/visa_repository.dart';
import '../../data/services/auth/auth_service.dart';
import '../../view/widgets/visa/visa_application_sheet.dart';

class VisaController extends GetxController {
  final VisaRepository _repo = VisaRepository();
  // role / admin flag (test purpose)
  var isAdmin = false.obs; // toggle via UI test FAB
  var allApplications = <VisaApplicationModel>[].obs; // admin stream
  var isLoading = false.obs;
  var currentStep = 0.obs;
  // Başvuru formunu göster/gizle
  var showApplicationForm = false.obs;
  // status filter ("all", "received", "processing", "completed", "rejected")
  final statusFilter = 'all'.obs;
  
  // Form controllers
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final passportNumberController = TextEditingController();
  final phoneController = TextEditingController();
  final emailController = TextEditingController();
  final addressController = TextEditingController();
  
  // Selected values
  var selectedCountry = ''.obs;
  var selectedCity = ''.obs;
  var selectedPurpose = ''.obs;
  var selectedDepartureDate = Rx<DateTime?>(null);
  var selectedReturnDate = Rx<DateTime?>(null);
  // Yeni: Medeni durum
  final selectedMaritalStatus = ''.obs; // Bekar | Evli | Dul | Boşanmış
  
  // File uploads
  var passportFile = Rx<File?>(null);
  var photoFile = Rx<File?>(null);
  var idFile = Rx<File?>(null);
  var additionalFiles = <File>[].obs;
  var paymentReceiptFile = Rx<File?>(null);
  
  // Application data
  var applications = <VisaApplicationModel>[].obs; // user apps streamed
  var selectedApplication = Rx<VisaApplicationModel?>(null);
  // Auth placeholder - will be replaced by actual auth service integration
  String currentUserId = 'demoUser'; // integrate with FirebaseAuth.instance.currentUser?.uid
  void setUser(String uid){
    if(uid.isNotEmpty && uid != currentUserId){
      final previous = currentUserId;
      currentUserId = uid;
      // migrate legacy docs BEFORE re-binding stream so they appear under new uid
      _migratePlaceholderApps(previous, uid).then((_) { loadApplications(); });
      // if migration fails still bind after slight delay
      Future.delayed(const Duration(milliseconds: 400), (){ if(applications.isEmpty) loadApplications(); });
    }
  }

  Future<void> _migratePlaceholderApps(String oldUid, String newUid) async {
    if(oldUid != 'demoUser') return; // only migrate from placeholder
    try{
      final legacy = await _repo.getUserApplications(oldUid);
      for(final app in legacy){
        final migrated = app.copyWith(userId: newUid, updatedAt: DateTime.now());
        await _repo.update(app.id!, migrated);
      }
    }catch(e){
      // ignore migration errors silently
    }
  }

  void syncAuthUser(){
    if(Get.isRegistered<AuthService>()){
      final auth = Get.find<AuthService>();
      final uid = auth.user.value.id;
      if(uid != null && uid.isNotEmpty && uid != currentUserId){
        setUser(uid);
      }
    }
  }
  
  // Constants
  final countries = [
    'Suudi Arabistan',
    'İran',
    'Irak',
    'Suriye',
    'Ürdün',
    'Mısır',
    'Fas',
    'Tunus',
    'Cezayir',
  ];
  
  final cities = {
    'Suudi Arabistan': ['Mekke', 'Medine', 'Cidde', 'Riyad'],
    'İran': ['Meşhed', 'Kum', 'Isfahan', 'Tahran'],
    'Irak': ['Necef', 'Kerbela', 'Bağdat'],
    'Suriye': ['Şam', 'Halep'],
    'Ürdün': ['Amman', 'Akabe'],
    'Mısır': ['Kahire', 'İskenderiye'],
    'Fas': ['Kazablanka', 'Rabat'],
    'Tunus': ['Tunus', 'Süs'],
    'Cezayir': ['Cezayir', 'Oran'],
  };
  
  final purposes = [
    'Umre',
    'Hac',
    'Ziyaret',
    'Turizm',
    'İş',
    'Eğitim',
    'Tedavi',
  ];
  
  final visaFees = {
    'Suudi Arabistan': 150.0,
    'İran': 80.0,
    'Irak': 100.0,
    'Suriye': 70.0,
    'Ürdün': 60.0,
    'Mısır': 50.0,
    'Fas': 65.0,
    'Tunus': 55.0,
    'Cezayir': 75.0,
  };
  
  var faqItems = <FAQItem>[
    FAQItem(
      question: 'Vize başvurusu ne kadar sürer?',
      answer: 'Vize başvuru süreci genellikle 5-15 iş günü arasında tamamlanır. Ülkeye ve vize türüne göre süre değişebilir.',
    ),
    FAQItem(
      question: 'Hangi belgeler gerekli?',
      answer: 'Genel olarak pasaport, fotoğraf, kimlik belgesi ve seyahat amacına uygun ek belgeler gereklidir.',
    ),
    FAQItem(
      question: 'Başvuru ücreti iade edilir mi?',
      answer: 'Vize başvuru ücreti, başvuru sonucu olumsuz olsa bile iade edilmez.',
    ),
    FAQItem(
      question: 'Acil vize başvurusu yapabilir miyim?',
      answer: 'Bazı ülkeler için acil vize hizmeti mevcuttur. Ek ücret karşılığında 1-3 iş günü içinde sonuç alabilirsiniz.',
    ),
    FAQItem(
      question: 'Pasaportumun geçerlilik süresi ne kadar olmalı?',
      answer: 'Pasaportunuzun seyahat dönüş tarihinden en az 6 ay geçerli olması gerekmektedir.',
    ),
  ].obs;

  @override
  void onInit() {
    super.onInit();
    // Attempt to adopt authenticated user id if AuthService is present
    if(Get.isRegistered<AuthService>()){
      final auth = Get.find<AuthService>();
      final uid = auth.user.value.id;
      if(uid != null && uid.isNotEmpty){
        currentUserId = uid;
      }
      // react to future auth changes
      ever(auth.user, (dynamic u){
        final newId = u.id as String?;
        if(newId != null && newId.isNotEmpty && newId != currentUserId){
          setUser(newId);
        }
      });
    }
    loadApplications();
  }

  @override
  void onClose() {
    firstNameController.dispose();
    lastNameController.dispose();
    passportNumberController.dispose();
    phoneController.dispose();
    emailController.dispose();
    addressController.dispose();
    super.onClose();
  }

  void loadApplications() {
  applications.bindStream(
    _repo.streamUserApplications(currentUserId).asyncMap((list) async {
      // merge legacy demoUser items (read-only) until all migrated
      if(currentUserId != 'demoUser'){
        try{
          final legacy = await _repo.getUserApplications('demoUser');
          for(final app in legacy){
            if(!list.any((a)=> a.id == app.id)){
              list.add(app);
            }
          }
          list.sort((a,b)=> b.createdAt.compareTo(a.createdAt));
        }catch(_){/* ignore */}
      }
      return list;
    })
  );
  allApplications.bindStream(_repo.streamAll());
  }

  // Exposed filtered list (computed) for UI
  List<VisaApplicationModel> get visibleApplications {
    final base = isAdmin.value ? allApplications : applications;
    final f = statusFilter.value;
    if(f == 'all') return base;
    return base.where((a)=> canonicalStatus(a.status) == f).toList();
  }

  void toggleAdmin(){
    isAdmin.toggle();
  }

  void setStatusFilter(String f){
    statusFilter.value = f;
  }

  void nextStep() {
    if (currentStep.value < 3) {
      currentStep.value++;
    }
  }

  void previousStep() {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  }

  void updateCountry(String country) {
    selectedCountry.value = country;
    selectedCity.value = ''; // Reset city when country changes
  }

  void updateCity(String city) {
    selectedCity.value = city;
  }

  void updatePurpose(String purpose) {
    selectedPurpose.value = purpose;
  }

  List<String> getCitiesForCountry(String country) {
    return cities[country] ?? [];
  }

  double getVisaFee(String country) {
    return visaFees[country] ?? 0.0;
  }

  Future<void> pickPassportFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    );

    if (result != null && result.files.single.path != null) {
      passportFile.value = File(result.files.single.path!);
      Get.snackbar(
        'Başarılı',
        'Pasaport dosyası seçildi',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    }
  }

  Future<void> pickPhotoFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.image,
    );

    if (result != null && result.files.single.path != null) {
      photoFile.value = File(result.files.single.path!);
      Get.snackbar(
        'Başarılı',
        'Fotoğraf dosyası seçildi',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    }
  }

  Future<void> pickIdFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    );

    if (result != null && result.files.single.path != null) {
      idFile.value = File(result.files.single.path!);
      Get.snackbar(
        'Başarılı',
        'Kimlik dosyası seçildi',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    }
  }

  Future<void> pickAdditionalFiles() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
    );

    if (result != null) {
      List<File> files = result.paths
          .where((path) => path != null)
          .map((path) => File(path!))
          .toList();
      
      additionalFiles.addAll(files);
      
      Get.snackbar(
        'Başarılı',
        '${files.length} dosya eklendi',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    }
  }

  Future<void> pickPaymentReceipt() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf','jpg','jpeg','png'],
    );
    if(result != null && result.files.single.path != null){
      paymentReceiptFile.value = File(result.files.single.path!);
      Get.snackbar('Başarılı','Dekont seçildi', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.green, colorText: Colors.white);
    }
  }

  void removeAdditionalFile(int index) {
    additionalFiles.removeAt(index);
  }

  Future<void> selectDepartureDate() async {
    DateTime? picked = await showDatePicker(
      context: Get.context!,
      initialDate: DateTime.now().add(const Duration(days: 30)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    
    if (picked != null) {
      selectedDepartureDate.value = picked;
    }
  }

  Future<void> selectReturnDate() async {
    DateTime? picked = await showDatePicker(
      context: Get.context!,
      initialDate: selectedDepartureDate.value?.add(const Duration(days: 7)) ?? 
                   DateTime.now().add(const Duration(days: 37)),
      firstDate: selectedDepartureDate.value ?? DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    
    if (picked != null) {
      selectedReturnDate.value = picked;
    }
  }

  bool validateCurrentStep() {
    switch (currentStep.value) {
      case 0: // Personal Information
        return firstNameController.text.isNotEmpty &&
               lastNameController.text.isNotEmpty &&
               passportNumberController.text.isNotEmpty &&
               phoneController.text.isNotEmpty &&
               emailController.text.isNotEmpty &&
               selectedMaritalStatus.value.isNotEmpty;
      case 1: // Travel Information
        return selectedCountry.value.isNotEmpty &&
               selectedCity.value.isNotEmpty &&
               selectedPurpose.value.isNotEmpty &&
               selectedDepartureDate.value != null &&
               selectedReturnDate.value != null;
      case 2: // Documents
        return passportFile.value != null &&
               photoFile.value != null &&
               idFile.value != null;
      case 3: // Payment
        return true;
      default:
        return false;
    }
  }

  Future<void> submitApplication() async {
  syncAuthUser();
    if (!validateCurrentStep()) {
      Get.snackbar('Hata', 'Lütfen tüm gerekli alanları doldurun', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.red, colorText: Colors.white);
      return;
    }
    isLoading.value = true;
    try {
      // upload required docs
      final passportUrl = await _repo.uploadFile(currentUserId, passportFile.value!, type: 'passport');
      final photoUrl = await _repo.uploadFile(currentUserId, photoFile.value!, type: 'photo');
      final idUrl = await _repo.uploadFile(currentUserId, idFile.value!, type: 'id');
      // additional
      final additionalUrls = <String>[];
      for (final f in additionalFiles) {
        additionalUrls.add(await _repo.uploadFile(currentUserId, f, type: 'additional'));
      }
  final model = VisaApplicationModel(
        userId: currentUserId,
        firstName: firstNameController.text.trim(),
        lastName: lastNameController.text.trim(),
        passportNumber: passportNumberController.text.trim(),
        phone: phoneController.text.trim(),
        email: emailController.text.trim(),
        address: addressController.text.trim().isEmpty ? null : addressController.text.trim(),
  maritalStatus: selectedMaritalStatus.value.isEmpty ? null : selectedMaritalStatus.value,
        country: selectedCountry.value,
        city: selectedCity.value,
        purpose: selectedPurpose.value,
        departureDate: selectedDepartureDate.value!,
        returnDate: selectedReturnDate.value!,
        fee: getVisaFee(selectedCountry.value),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        requiredFileUrls: [passportUrl, photoUrl, idUrl],
        additionalFileUrls: additionalUrls,
        userNote: null,
      );
      final id = await _repo.create(model);
      // upload receipt if provided after doc creation (not mandatory)
      // Optimistic local insert so user sees it instantly (stream will reconcile)
      var localModel = model.copyWith(id: id);
      applications.insert(0, localModel);
      if(paymentReceiptFile.value != null){
        final receiptUrl = await _repo.uploadFile(currentUserId, paymentReceiptFile.value!, type: 'receipt');
        await _repo.attachPayment(id, receiptUrl: receiptUrl);
        // update locally
        applications[applications.indexWhere((a)=> a.id == id)] = localModel.copyWith(paymentReceiptUrl: receiptUrl);
      }
      Get.snackbar('Başarılı', 'Vize başvurunuz alındı. Başvuru numaranız: $id', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.green, colorText: Colors.white, duration: const Duration(seconds: 4));
      _resetForm();
      currentStep.value = 0;
    } catch (e) {
      Get.snackbar('Hata', 'Başvuru gönderilemedi: $e', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.red, colorText: Colors.white);
    } finally {
      isLoading.value = false;
    }
  }

  void _resetForm() {
    firstNameController.clear();
    lastNameController.clear();
    passportNumberController.clear();
    phoneController.clear();
    emailController.clear();
    addressController.clear();
    
    selectedCountry.value = '';
    selectedCity.value = '';
    selectedPurpose.value = '';
  selectedMaritalStatus.value = '';
    selectedDepartureDate.value = null;
    selectedReturnDate.value = null;
    
    passportFile.value = null;
    photoFile.value = null;
    idFile.value = null;
    additionalFiles.clear();
    paymentReceiptFile.value = null;
  }

  // Canonical status codes: received, processing, completed, rejected
  String canonicalStatus(String status){
    switch(status){
      case 'Başvuru Alındı': return 'received';
      case 'İşlemde': return 'processing';
      case 'Tamamlandı': return 'completed';
      case 'Reddedildi': return 'rejected';
      default: return status; // assume already canonical or unexpected
    }
  }
  String getStatusText(String status){
    switch(canonicalStatus(status)){
      case 'received': return 'Başvuru Alındı';
      case 'processing': return 'İşlemde';
      case 'completed': return 'Tamamlandı';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  }
  Color getStatusColor(String status){
    switch(canonicalStatus(status)){
      case 'received': return Colors.blue;
      case 'processing': return Colors.orange;
      case 'completed': return Colors.green;
      case 'rejected': return Colors.red;
      default: return Colors.grey;
    }
  }
  double statusProgress(String status){
    switch(canonicalStatus(status)){
      case 'received': return 0.25;
      case 'processing': return 0.6;
      case 'completed': return 1.0;
      case 'rejected': return 1.0;
      default: return 0.1;
    }
  }

  void viewApplicationDetails(VisaApplicationModel application) {
    selectedApplication.value = application;
    Get.bottomSheet(
      VisaApplicationSheet(app: application, isAdmin: isAdmin.value, repo: _repo),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  Future<void> updateNotes(VisaApplicationModel app, {String? adminNote, String? userNote}) async {
    try{
      isLoading.value = true;
      final updated = app.copyWith(
        adminNote: adminNote ?? app.adminNote,
        userNote: userNote ?? app.userNote,
      );
      await _repo.update(app.id!, updated);
      Get.snackbar('Kaydedildi','Notlar güncellendi', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.green, colorText: Colors.white);
    }catch(e){
      Get.snackbar('Hata','Not kaydedilemedi: $e', snackPosition: SnackPosition.BOTTOM, backgroundColor: Colors.red, colorText: Colors.white);
    }finally{ isLoading.value = false; }
  }

  // Helper methods removed (moved to bottom sheet component)
}

// Old inline VisaApplication replaced by Firestore backed VisaApplicationModel

class FAQItem {
  final String question;
  final String answer;
  bool isExpanded;

  FAQItem({
    required this.question,
    required this.answer,
    this.isExpanded = false,
  });
}
