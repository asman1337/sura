import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:intl/intl.dart';
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
    
    return 'MALKHANA_ITEM:${_item!.id}:${_item!.registryNumber}';
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Item Details'),
        actions: [
          if (_item != null)
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: _shareItemDetails,
              tooltip: 'Share Item Details',
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
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
                      Text(
                        _error!,
                        style: Theme.of(context).textTheme.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _loadItemDetails,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _item == null
                  ? const Center(child: Text('Item not found'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // QR Code and Registry Number Header
                          _buildHeader(),
                          const SizedBox(height: 24),
                          
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
                              _buildInfoRow('Status', _item!.status),
                            ],
                          ),
                          const SizedBox(height: 16),
                          
                          // Storage Location
                          if (_item!.shelf != null)
                            _buildSection(
                              title: 'Storage Location',
                              icon: Icons.shelves,
                              children: [
                                _buildInfoRow('Shelf', _item!.shelf!.name),
                                _buildInfoRow('Location', _item!.shelf!.location),
                              ],
                            ),
                          if (_item!.shelf != null) const SizedBox(height: 16),
                          
                          // Disposal Information
                          if (_item!.disposalDate != null)
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
                          if (_item!.disposalDate != null) const SizedBox(height: 16),
                          
                          // Notes
                          if (_item!.notes != null && _item!.notes!.isNotEmpty)
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
                      ).animate().fadeIn(duration: const Duration(milliseconds: 300)),
                    ),
    );
  }

  Widget _buildHeader() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Registry #${_item!.registryNumber}',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _item!.status,
                        style: TextStyle(
                          color: _getStatusColor(_item!.status),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                QrImageView(
                  data: _generateQrData(),
                  version: QrVersions.auto,
                  size: 100.0,
                ),
              ],
            ),
          ],
        ),
      ),
    ).animate().scale(duration: const Duration(milliseconds: 300));
  }

  Widget _buildSection({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: AppTheme.primaryColor),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const Divider(),
            ...children,
          ],
        ),
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 300), delay: const Duration(milliseconds: 100));
  }

  Widget _buildInfoRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value.toString(),
              style: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
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