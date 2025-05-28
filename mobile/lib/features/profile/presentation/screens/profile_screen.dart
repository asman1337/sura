import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sura/core/models/auth/user.dart';
import 'package:sura/core/services/auth_service.dart';
import 'package:sura/core/theme/app_theme.dart';
import 'package:sura/core/widgets/custom_text_field.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;
  late TextEditingController _badgeNumberController;
  
  bool _isEditing = false;
  bool _isLoading = false;
  
  @override
  void initState() {
    super.initState();
    _firstNameController = TextEditingController();
    _lastNameController = TextEditingController();
    _emailController = TextEditingController();
    _badgeNumberController = TextEditingController();
    
    // Load user data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadUserData();
    });
  }
  
  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _badgeNumberController.dispose();
    super.dispose();
  }
  
  void _loadUserData() {
    final authService = Provider.of<AuthService>(context, listen: false);
    final user = authService.user;
    
    if (user != null) {
      _firstNameController.text = user.firstName;
      _lastNameController.text = user.lastName;
      _emailController.text = user.email;
      _badgeNumberController.text = user.badgeNumber ?? '';
    }
  }
  
  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    
    setState(() {
      _isLoading = true;
    });
    
    // TODO: Implement profile update
    
    // Simulate API call
    await Future.delayed(const Duration(seconds: 1));
    
    if (mounted) {
      setState(() {
        _isLoading = false;
        _isEditing = false;
      });
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final authService = Provider.of<AuthService>(context);
    final user = authService.user;
    
    if (user == null) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Profile header
          _buildProfileHeader(user),
          const SizedBox(height: 24),
          
          // Profile form
          _buildProfileForm(),
          const SizedBox(height: 24),
          
          // Settings section
          _buildSettingsSection(),
        ],
      ),
    );
  }
  
  Widget _buildProfileHeader(User user) {
    return Column(
      children: [
        // Profile image
        CircleAvatar(
          radius: 50,
          backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
          child: user.profilePhotoUrl != null
              ? ClipOval(
                  child: Image.network(
                    user.profilePhotoUrl!,
                    width: 100,
                    height: 100,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Icon(
                        Icons.person,
                        size: 50,
                        color: Theme.of(context).colorScheme.primary,
                      );
                    },
                  ),
                )
              : Icon(
                  Icons.person,
                  size: 50,
                  color: Theme.of(context).colorScheme.primary,
                ),
        ),
        const SizedBox(height: 16),
        
        // User name
        Text(
          user.fullName,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 4),
        
        // Badge number
        Text(
          'Badge #${user.badgeNumber}',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onBackground.withOpacity(0.7),
              ),
        ),
        const SizedBox(height: 8),
        
        // User type
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Text(
            user.userType ?? 'Officer',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                  fontWeight: FontWeight.w500,
                ),
          ),
        ),
      ],
    );
  }
  
  Widget _buildProfileForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Personal Information',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              TextButton.icon(
                onPressed: () {
                  setState(() {
                    if (_isEditing) {
                      _loadUserData(); // Reset form
                    }
                    _isEditing = !_isEditing;
                  });
                },
                icon: Icon(
                  _isEditing ? Icons.close : Icons.edit,
                  size: 16,
                ),
                label: Text(_isEditing ? 'Cancel' : 'Edit'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // First name
          CustomTextField(
            controller: _firstNameController,
            label: 'First Name',
            hintText: 'Enter your first name',
            readOnly: !_isEditing,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your first name';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Last name
          CustomTextField(
            controller: _lastNameController,
            label: 'Last Name',
            hintText: 'Enter your last name',
            readOnly: !_isEditing,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your last name';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Email
          CustomTextField(
            controller: _emailController,
            label: 'Email',
            hintText: 'Enter your email',
            keyboardType: TextInputType.emailAddress,
            readOnly: !_isEditing,
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your email';
              }
              if (!value.contains('@')) {
                return 'Please enter a valid email';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          
          // Badge number
          CustomTextField(
            controller: _badgeNumberController,
            label: 'Badge Number',
            hintText: 'Enter your badge number',
            readOnly: !_isEditing,
          ),
          const SizedBox(height: 24),
          
          // Save button
          if (_isEditing)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _saveProfile,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  disabledBackgroundColor: AppTheme.primaryColor.withOpacity(0.5),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'Save Changes',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
        ],
      ),
    );
  }
  
  Widget _buildSettingsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Settings',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        
        // Settings options
        _buildSettingItem(
          icon: Icons.lock_outline,
          title: 'Change Password',
          onTap: () {
            // TODO: Navigate to change password screen
          },
        ),
        _buildSettingItem(
          icon: Icons.notifications_outlined,
          title: 'Notifications',
          onTap: () {
            // TODO: Navigate to notifications settings
          },
        ),
        _buildSettingItem(
          icon: Icons.dark_mode_outlined,
          title: 'Dark Mode',
          trailing: Switch(
            value: Theme.of(context).brightness == Brightness.dark,
            onChanged: (value) {
              // TODO: Toggle theme
            },
          ),
          onTap: null,
        ),
        _buildSettingItem(
          icon: Icons.help_outline,
          title: 'Help & Support',
          onTap: () {
            // TODO: Navigate to help screen
          },
        ),
        _buildSettingItem(
          icon: Icons.info_outline,
          title: 'About',
          onTap: () {
            // TODO: Navigate to about screen
          },
        ),
      ],
    );
  }
  
  Widget _buildSettingItem({
    required IconData icon,
    required String title,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.borderRadius),
        side: BorderSide(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        leading: Icon(
          icon,
          color: Theme.of(context).colorScheme.primary,
        ),
        title: Text(
          title,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        trailing: trailing ??
            Icon(
              Icons.chevron_right,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
            ),
        onTap: onTap,
      ),
    );
  }
} 