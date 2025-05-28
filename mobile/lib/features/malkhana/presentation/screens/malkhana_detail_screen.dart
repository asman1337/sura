import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:intl/intl.dart';
import 'dart:convert'; // Add this import for JSON encoding
import 'package:sura/features/malkhana/data/models/malkhana_item_model.dart';
import 'package:sura/features/malkhana/data/repositories/malkhana_repository.dart';
import 'package:sura/core/theme/app_theme.dart';

class MalkhanaDetailScreen extends StatefulWidget {
  final String itemId;

  const MalkhanaDetailScreen({
    super.key,
    required this.itemId,
  });

  @override
  State<MalkhanaDetailScreen> createState() => _MalkhanaDetailScreenState();
}

class _MalkhanaDetailScreenState extends State<MalkhanaDetailScreen> {
  final MalkhanaRepository _repository = MalkhanaRepository();
  MalkhanaItemModel? _item;
  bool _isLoading = true;
  String? _error;
  bool _showQrFullScreen = false;

  @override
  void initState() {
    super.initState();
    _loadItemDetails();
  }

  Future<void> _loadItemDetails() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final item = await _repository.getItemById(widget.itemId);
      setState(() {
        _item = item;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  String _generateQrData() {
    if (_item == null) return '';
    
    // Create a compact JSON structure matching the frontend format
    final Map<String, dynamic> qrData = {
      'type': 'item',
      'id': _item!.id,
      'timestamp': DateTime.now().toIso8601String()
    };
    
    // Return as JSON string
    return jsonEncode(qrData);
  }

  Future<void> _shareItemDetails() async {
    if (_item == null) return;
    
    final String text = '''
Malkhana Item Details:
Registry Number: ${_item!.registryNumber}
Case Number: ${_item!.caseNumber}
Description: ${_item!.description}
Category: ${_item!.category}
Status: ${_item!.status}
Date Received: ${_formatDate(_item!.dateReceived)}
''';

    await Share.share(text, subject: 'Malkhana Item ${_item!.registryNumber}');
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat('dd MMM yyyy').format(date);
  }

  void _toggleQrFullScreen() {
    setState(() {
      _showQrFullScreen = !_showQrFullScreen;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: const Text('Item Details'),
        elevation: 0,
        actions: [
          if (_item != null)
            IconButton(
              icon: const Icon(Icons.qr_code),
              onPressed: _toggleQrFullScreen,
              tooltip: 'Show QR Code',
            ),
          if (_item != null)
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: _shareItemDetails,
              tooltip: 'Share Item Details',
            ),
        ],
      ),
      floatingActionButton: _item != null ? FloatingActionButton.extended(
        onPressed: _shareItemDetails,
        icon: const Icon(Icons.share),
        label: const Text('Share'),
        backgroundColor: AppTheme.primaryColor,
      ) : null,
      body: Stack(
        children: [
          // Main content
          _buildMainContent(),
          
          // Full screen QR overlay
          if (_showQrFullScreen && _item != null)
            _buildFullScreenQr(),
        ],
      ),
    );
  }

  Widget _buildMainContent() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Loading item details...')
          ],
        ),
      );
    }
    
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 60,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Error loading item',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                _error!,
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _loadItemDetails,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      );
    }
    
    if (_item == null) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inventory_2_outlined,
              size: 60,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text('Item not found'),
          ],
        ),
      );
    }
    
    return CustomScrollView(
      slivers: [
        // Header with item basic info
        SliverToBoxAdapter(
          child: _buildHeaderCard(),
        ),
        
        // Content sections
        SliverPadding(
          padding: const EdgeInsets.all(16.0),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              // Registration Information
              _buildSection(
                title: 'Registration Information',
                icon: Icons.assignment,
                children: [
                  _buildInfoRow('Registry Number', _item!.registryNumber),
                  if (_item!.motherNumber.isNotEmpty)
                    _buildInfoRow('Mother Number', _item!.motherNumber),
                  _buildInfoRow('Case Number', _item!.caseNumber),
                  _buildInfoRow('Registry Type', _item!.registryType),
                  _buildInfoRow('Registry Year', _item!.registryYear.toString()),
                  _buildInfoRow('Date Received', _formatDate(_item!.dateReceived)),
                  _buildInfoRow('Received From', _item!.receivedFrom),
                ],
              ),
              const SizedBox(height: 16),
              
              // Item Details
              _buildSection(
                title: 'Item Details',
                icon: Icons.inventory,
                children: [
                  _buildInfoRow('Description', _item!.description),
                  _buildInfoRow('Category', _item!.category),
                  _buildInfoRow('Condition', _item!.condition),
                  _buildStatusRow('Status', _item!.status),
                ],
              ),
              const SizedBox(height: 16),
              
              // Storage Location
              if (_item!.shelf != null) ...[
                _buildSection(
                  title: 'Storage Location',
                  icon: Icons.shelves,
                  children: [
                    _buildInfoRow('Shelf', _item!.shelf!.name),
                    _buildInfoRow('Location', _item!.shelf!.location),
                  ],
                ),
                const SizedBox(height: 16),
              ],
              
              // Disposal Information
              if (_item!.disposalDate != null) ...[
                _buildSection(
                  title: 'Disposal Information',
                  icon: Icons.delete_outline,
                  children: [
                    _buildInfoRow('Disposal Date', _formatDate(_item!.disposalDate)),
                    if (_item!.disposalReason != null)
                      _buildInfoRow('Disposal Reason', _item!.disposalReason!),
                    if (_item!.disposalApprovedBy != null)
                      _buildInfoRow('Approved By', _item!.disposalApprovedBy!),
                  ],
                ),
                const SizedBox(height: 16),
              ],
              
              // Notes
              if (_item!.notes != null && _item!.notes!.isNotEmpty) ...[
                _buildSection(
                  title: 'Notes',
                  icon: Icons.note,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Text(_item!.notes!),
                    ),
                  ],
                ),
              ],
              
              // Bottom padding
              const SizedBox(height: 80),
            ]),
          ),
        ),
      ],
    ).animate().fadeIn(duration: const Duration(milliseconds: 300));
  }

  Widget _buildHeaderCard() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.primaryColor,
            AppTheme.primaryColor.withOpacity(0.7),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Registry #${_item!.registryNumber}',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _item!.description,
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: Colors.white.withOpacity(0.9),
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildStatusChip(_item!.status),
                      ],
                    ),
                  ),
                  Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: InkWell(
                      onTap: _toggleQrFullScreen,
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(
                          children: [
                            QrImageView(
                              data: _generateQrData(),
                              version: QrVersions.auto,
                              size: 100.0,
                              backgroundColor: Colors.white,
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Tap to expand',
                              style: TextStyle(fontSize: 10),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 300));
  }

  Widget _buildFullScreenQr() {
    return GestureDetector(
      onTap: _toggleQrFullScreen,
      child: Container(
        color: Colors.black.withOpacity(0.9),
        width: double.infinity,
        height: double.infinity,
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Item QR Code',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Registry #${_item!.registryNumber} - ${_item!.description}',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: Colors.white70,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: QrImageView(
                  data: _generateQrData(),
                  version: QrVersions.auto,
                  size: 280,
                  backgroundColor: Colors.white,
                ),
              ),
              const SizedBox(height: 32),
              ElevatedButton.icon(
                onPressed: _shareItemDetails,
                icon: const Icon(Icons.share),
                label: const Text('Share Item Details'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
              ),
              const SizedBox(height: 16),
              TextButton.icon(
                onPressed: _toggleQrFullScreen,
                icon: const Icon(Icons.close),
                label: const Text('Close'),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ).animate().fadeIn(duration: const Duration(milliseconds: 200)),
    );
  }

  Widget _buildSection({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: AppTheme.primaryColor),
                ),
                const SizedBox(width: 12),
                Flexible(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12.0),
              child: Divider(),
            ),
            ...children,
          ],
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 300), delay: const Duration(milliseconds: 100));
  }

  Widget _buildInfoRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
          ),
          Expanded(
            child: Text(
              value.toString(),
              style: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
              overflow: TextOverflow.visible,
              softWrap: true,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusRow(String label, String status) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
          ),
          Flexible(
            child: _buildStatusChip(status),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _getStatusColor(status).withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _getStatusColor(status).withOpacity(0.5),
          width: 1,
        ),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: _getStatusColor(status),
          fontWeight: FontWeight.bold,
          fontSize: 14,
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return Colors.green;
      case 'disposed':
        return Colors.red;
      case 'in court':
        return Colors.orange;
      case 'transferred':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
} 