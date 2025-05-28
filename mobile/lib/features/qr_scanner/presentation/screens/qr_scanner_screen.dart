import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:sura/core/theme/app_theme.dart';

class QrScannerScreen extends StatefulWidget {
  const QrScannerScreen({super.key});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController();
  bool _isProcessing = false;
  bool _isFlashOn = false;
  bool _isFrontCamera = false;
  String? _errorMessage;
  
  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }
  
  void _handleQrCode(BarcodeCapture capture) {
    if (_isProcessing) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    
    // Process only the first barcode
    if (barcodes.isNotEmpty && barcodes[0].rawValue != null) {
      setState(() {
        _isProcessing = true;
        _errorMessage = null;
      });
      
      _processQrCode(barcodes[0].rawValue!);
    }
  }
  
  void _processQrCode(String rawValue) {
    try {
      // Try to parse the QR code data as JSON
      final Map<String, dynamic> data = jsonDecode(rawValue);
      
      // Check if the QR code contains the expected data structure
      if (data.containsKey('type') && data.containsKey('id')) {
        final String type = data['type'];
        final String id = data['id'];
        
        // Navigate based on the QR code type
        switch (type) {
          case 'item':
            context.go('/malkhana/$id');
            break;
          case 'shelf':
            context.go('/shelves/$id');
            break;
          default:
            _showError('Unknown QR code type: $type');
        }
      } else {
        _showError('Invalid QR code format');
      }
    } catch (e) {
      _showError('Could not process QR code: ${e.toString()}');
    }
  }
  
  void _showError(String message) {
    setState(() {
      _errorMessage = message;
      _isProcessing = false;
    });
    
    // Clear error message after a delay
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _errorMessage = null;
        });
      }
    });
  }
  
  void _toggleFlash() {
    _scannerController.toggleTorch();
    setState(() {
      _isFlashOn = !_isFlashOn;
    });
  }

  void _toggleCamera() {
    _scannerController.switchCamera();
    setState(() {
      _isFrontCamera = !_isFrontCamera;
    });
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
          ),
          IconButton(
            icon: Icon(_isFrontCamera ? Icons.camera_front : Icons.camera_rear),
            onPressed: _toggleCamera,
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _scannerController,
            onDetect: _handleQrCode,
          ),
          
          // Scanner overlay
          CustomPaint(
            size: Size.infinite,
            painter: ScannerOverlayPainter(),
          ),
          
          // Error message
          if (_errorMessage != null)
            Positioned(
              bottom: 100,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: AppTheme.errorColor.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _errorMessage!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
            
          // Processing indicator
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(
                  color: Colors.white,
                ),
              ),
            ),
            
          // Scan instructions
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.6),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Align QR code within the frame to scan',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ScannerOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double scanAreaSize = size.width * 0.7;
    final double left = (size.width - scanAreaSize) / 2;
    final double top = (size.height - scanAreaSize) / 2;
    final double right = left + scanAreaSize;
    final double bottom = top + scanAreaSize;
    
    final Rect scanRect = Rect.fromLTRB(left, top, right, bottom);
    final Rect fullRect = Rect.fromLTWH(0, 0, size.width, size.height);
    
    // Draw semi-transparent overlay outside scan area
    final Paint overlayPaint = Paint()
      ..color = Colors.black.withOpacity(0.5)
      ..style = PaintingStyle.fill
      ..blendMode = BlendMode.srcOver;
    
    // Create a path that covers the entire canvas except for the scan area
    final Path overlayPath = Path()
      ..addRect(fullRect)
      ..addRect(scanRect)
      ..fillType = PathFillType.evenOdd;
    
    canvas.drawPath(overlayPath, overlayPaint);
    
    // Draw scan area border
    final Paint borderPaint = Paint()
      ..color = AppTheme.primaryColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0;
    
    canvas.drawRect(scanRect, borderPaint);
    
    // Draw corner markers
    final double cornerSize = 20.0;
    final Paint cornerPaint = Paint()
      ..color = AppTheme.primaryColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 5.0;
    
    // Top-left corner
    canvas.drawLine(Offset(left, top + cornerSize), Offset(left, top), cornerPaint);
    canvas.drawLine(Offset(left, top), Offset(left + cornerSize, top), cornerPaint);
    
    // Top-right corner
    canvas.drawLine(Offset(right - cornerSize, top), Offset(right, top), cornerPaint);
    canvas.drawLine(Offset(right, top), Offset(right, top + cornerSize), cornerPaint);
    
    // Bottom-left corner
    canvas.drawLine(Offset(left, bottom - cornerSize), Offset(left, bottom), cornerPaint);
    canvas.drawLine(Offset(left, bottom), Offset(left + cornerSize, bottom), cornerPaint);
    
    // Bottom-right corner
    canvas.drawLine(Offset(right - cornerSize, bottom), Offset(right, bottom), cornerPaint);
    canvas.drawLine(Offset(right, bottom), Offset(right, bottom - cornerSize), cornerPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return false;
  }
} 