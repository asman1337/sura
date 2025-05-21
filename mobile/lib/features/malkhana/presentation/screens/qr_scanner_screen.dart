import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:sura/core/theme/app_theme.dart';
import 'package:sura/features/malkhana/presentation/screens/malkhana_detail_screen.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> with WidgetsBindingObserver {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    formats: [BarcodeFormat.qrCode],
  );
  bool _isFlashOn = false;
  bool _isFrontCamera = false;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _scannerController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _scannerController.start();
    } else if (state == AppLifecycleState.paused) {
      _scannerController.stop();
    }
  }

  void _onDetect(BarcodeCapture capture) {
    if (_isProcessing) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? rawValue = barcodes.first.rawValue;
    if (rawValue == null) return;

    _processQRCode(rawValue);
  }

  void _processQRCode(String rawValue) {
    setState(() => _isProcessing = true);
    
    try {
      // Try to parse the QR code data as JSON
      final Map<String, dynamic> data = jsonDecode(rawValue);
      
      // Check if the QR code contains the expected data structure
      if (data.containsKey('type') && data.containsKey('id')) {
        final String type = data['type'];
        final String id = data['id'];
        
        // Navigate based on the QR code type
        if (type == 'item') {
          _navigateToItemDetails(id);
        } else {
          _showInvalidQRCodeMessage('Unknown QR code type: $type');
        }
      } else {
        _showInvalidQRCodeMessage('Invalid QR code format');
      }
    } catch (e) {
      // Fallback to legacy format (MALKHANA_ITEM:id)
      if (rawValue.startsWith('MALKHANA_ITEM:')) {
        final parts = rawValue.split(':');
        if (parts.length >= 2) {
          final String itemId = parts[1];
          _navigateToItemDetails(itemId);
        } else {
          _showInvalidQRCodeMessage('Invalid QR code format');
        }
      } else {
        _showInvalidQRCodeMessage('Not a valid Malkhana QR code');
      }
    }
  }

  void _navigateToItemDetails(String itemId) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => MalkhanaDetailScreen(itemId: itemId),
      ),
    ).then((_) {
      // Resume scanning when returning from detail screen
      if (mounted) {
        setState(() => _isProcessing = false);
        _scannerController.start();
      }
    });
  }

  void _showInvalidQRCodeMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 2),
      ),
    );
    
    // Allow scanning again after showing the message
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    });
  }

  void _toggleFlash() {
    _scannerController.toggleTorch();
    setState(() => _isFlashOn = !_isFlashOn);
  }

  void _toggleCamera() {
    _scannerController.switchCamera();
    setState(() => _isFrontCamera = !_isFrontCamera);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Code'),
        actions: [
          IconButton(
            icon: Icon(_isFlashOn ? Icons.flash_on : Icons.flash_off),
            onPressed: _toggleFlash,
            tooltip: 'Toggle Flash',
          ),
          IconButton(
            icon: Icon(_isFrontCamera ? Icons.camera_front : Icons.camera_rear),
            onPressed: _toggleCamera,
            tooltip: 'Switch Camera',
          ),
        ],
      ),
      body: Stack(
        children: [
          // Scanner
          MobileScanner(
            controller: _scannerController,
            onDetect: _onDetect,
          ),
          
          // Overlay
          _buildScannerOverlay(),
          
          // Processing indicator
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildScannerOverlay() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              border: Border.all(
                color: AppTheme.primaryColor,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Stack(
              children: [
                // Corner indicators
                Positioned(
                  top: 0,
                  left: 0,
                  child: _buildCornerIndicator(),
                ),
                Positioned(
                  top: 0,
                  right: 0,
                  child: _buildCornerIndicator(isTopLeft: false),
                ),
                Positioned(
                  bottom: 0,
                  left: 0,
                  child: _buildCornerIndicator(isTopLeft: false),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: _buildCornerIndicator(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'Position the QR code within the frame',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCornerIndicator({bool isTopLeft = true}) {
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        border: Border(
          top: isTopLeft ? BorderSide(color: AppTheme.primaryColor, width: 4) : BorderSide.none,
          left: isTopLeft ? BorderSide(color: AppTheme.primaryColor, width: 4) : BorderSide.none,
          bottom: !isTopLeft ? BorderSide(color: AppTheme.primaryColor, width: 4) : BorderSide.none,
          right: !isTopLeft ? BorderSide(color: AppTheme.primaryColor, width: 4) : BorderSide.none,
        ),
      ),
    );
  }
} 