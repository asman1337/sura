import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sura/core/theme/app_theme.dart';
import 'package:sura/core/config/app_config.dart';
import 'package:sura/core/services/auth_service.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:sura/features/malkhana/presentation/screens/qr_scanner_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Custom App Bar
            _buildAppBar(),
            
            // Content
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    
                    // Welcome section
                    _buildWelcomeSection(),
                    const SizedBox(height: 30),
                    
                    // Quick actions
                    _buildQuickActions(),
                    const SizedBox(height: 30),
                    
                    // Duty section
                    _buildDutySection(),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => const QRScannerScreen(),
            ),
          );
        },
        icon: const Icon(Icons.qr_code_scanner),
        label: const Text('Scan QR'),
        backgroundColor: AppTheme.primaryColor,
        elevation: 4,
      ),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      floating: true,
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.security,
              color: Colors.white,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          const Text(
            AppConfig.appName,
            style: TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey.withAlpha(10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.notifications_outlined),
          ),
          onPressed: () {
            // Show notifications
          },
        ),
        const SizedBox(width: 8),
        IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.grey.withAlpha(10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.person_outline),
          ),
          onPressed: () {
            // Navigate to profile screen
          },
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildWelcomeSection() {
    final authService = Provider.of<AuthService>(context);
    final user = authService.user;
    
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.primaryColor,
            AppTheme.primaryColor.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryColor.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: CircleAvatar(
                  backgroundColor: Colors.white,
                  radius: 30,
                  child: Text(
                    user?.firstName.substring(0, 1) ?? 'U',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Welcome back,',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: Colors.white.withOpacity(0.9),
                          ),
                    ),
                    Text(
                      user?.fullName ?? 'User',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.access_time,
                  color: Colors.white,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Current Shift',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Morning Duty (8:00 AM - 4:00 PM)',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 400)).slideY(
          begin: 0.2,
          end: 0,
          curve: Curves.easeOut,
          duration: const Duration(milliseconds: 400),
        );
  }

  Widget _buildQuickActions() {
    final actions = [
      _QuickAction(
        title: 'Scan QR',
        icon: Icons.qr_code_scanner,
        color: AppTheme.primaryColor,
        gradient: LinearGradient(
          colors: [AppTheme.primaryColor, AppTheme.primaryColor.withOpacity(0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => const QRScannerScreen(),
            ),
          );
        },
      ),
      _QuickAction(
        title: 'Search Items',
        icon: Icons.search,
        color: AppTheme.warningColor,
        gradient: LinearGradient(
          colors: [AppTheme.warningColor, AppTheme.warningColor.withOpacity(0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        onTap: () {
          // Navigate to search screen
        },
      ),
      _QuickAction(
        title: 'View Shelves',
        icon: Icons.shelves,
        color: AppTheme.successColor,
        gradient: LinearGradient(
          colors: [AppTheme.successColor, AppTheme.successColor.withOpacity(0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        onTap: () {
          // Navigate to shelves screen
        },
      ),
      _QuickAction(
        title: 'Reports',
        icon: Icons.bar_chart,
        color: AppTheme.accentColor,
        gradient: LinearGradient(
          colors: [AppTheme.accentColor, AppTheme.accentColor.withOpacity(0.7)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        onTap: () {
          // Navigate to reports screen
        },
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Quick Actions',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            TextButton.icon(
              onPressed: () {
                // View more actions
              },
              icon: const Icon(Icons.apps),
              label: const Text('More'),
              style: TextButton.styleFrom(
                foregroundColor: AppTheme.primaryColor,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.25,
          ),
          itemCount: actions.length,
          itemBuilder: (context, index) {
            final action = actions[index];
            return _buildActionCardNew(
              title: action.title,
              icon: action.icon,
              color: action.color,
              gradient: action.gradient,
              onTap: action.onTap,
              delay: index * 100,
            );
          },
        ),
      ],
    );
  }

  Widget _buildActionCardNew({
    required String title,
    required IconData icon,
    required Color color,
    required Gradient gradient,
    required VoidCallback onTap,
    int delay = 0,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  size: 28,
                  color: Colors.white,
                ),
              ),
              const Spacer(),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  Text(
                    'Tap to access',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  const Spacer(),
                  const Icon(
                    Icons.arrow_forward,
                    color: Colors.white,
                    size: 14,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ).animate().fadeIn(
          duration: const Duration(milliseconds: 400),
          delay: Duration(milliseconds: 100 + delay),
        ).scale(
          begin: const Offset(0.9, 0.9),
          end: const Offset(1, 1),
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeOut,
          delay: Duration(milliseconds: 100 + delay),
        );
  }

  Widget _buildDutySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Upcoming Duties',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            TextButton.icon(
              onPressed: () {
                // View all duties
              },
              icon: const Icon(Icons.calendar_month),
              label: const Text('Schedule'),
              style: TextButton.styleFrom(
                foregroundColor: AppTheme.primaryColor,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _buildDutyCard(
          date: 'Today',
          time: '8:00 AM - 4:00 PM',
          title: 'Morning Shift',
          location: 'Main Office',
          isActive: true,
          delay: 0,
        ),
        _buildDutyCard(
          date: 'Tomorrow',
          time: '4:00 PM - 12:00 AM',
          title: 'Evening Shift',
          location: 'East Wing',
          isActive: false,
          delay: 100,
        ),
        _buildDutyCard(
          date: '23 Aug, 2023',
          time: '12:00 AM - 8:00 AM',
          title: 'Night Shift',
          location: 'Main Office',
          isActive: false,
          delay: 200,
        ),
      ],
    ).animate().fadeIn(
          duration: const Duration(milliseconds: 400),
          delay: const Duration(milliseconds: 300),
        );
  }

  Widget _buildDutyCard({
    required String date,
    required String time,
    required String title,
    required String location,
    required bool isActive,
    required int delay,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: isActive ? AppTheme.primaryColor.withOpacity(0.1) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive ? AppTheme.primaryColor.withOpacity(0.3) : Colors.grey.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: isActive ? AppTheme.primaryColor : Colors.grey.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isActive ? Icons.access_time_filled : Icons.access_time,
                    color: isActive ? Colors.white : Colors.grey,
                    size: 22,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    date,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isActive ? Colors.white : Colors.grey,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isActive ? AppTheme.primaryColor : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    time,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[700],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 14,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        location,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: isActive ? AppTheme.primaryColor : Colors.grey.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                isActive ? 'Current' : 'Upcoming',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: isActive ? Colors.white : Colors.grey[700],
                ),
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(
          duration: const Duration(milliseconds: 400),
          delay: Duration(milliseconds: 300 + delay),
        ).slideX(
          begin: 0.1,
          end: 0,
          curve: Curves.easeOut,
          duration: const Duration(milliseconds: 400),
          delay: Duration(milliseconds: 300 + delay),
        );
  }
}

class _QuickAction {
  final String title;
  final IconData icon;
  final Color color;
  final Gradient gradient;
  final VoidCallback onTap;

  _QuickAction({
    required this.title,
    required this.icon,
    required this.color,
    required this.gradient,
    required this.onTap,
  });
} 