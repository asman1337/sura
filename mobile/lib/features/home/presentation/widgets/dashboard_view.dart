import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:sura/core/theme/app_theme.dart';

class DashboardView extends StatelessWidget {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome message
          _buildWelcomeSection(context),
          const SizedBox(height: 24),
          
          // Summary cards
          _buildSummaryCards(context),
          const SizedBox(height: 24),
          
          // Recent activity
          _buildRecentActivity(context),
        ],
      ),
    );
  }
  
  Widget _buildWelcomeSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Welcome back,',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
              ),
        ),
        const SizedBox(height: 4),
        Text(
          'Officer John Doe',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSurface,
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'Here\'s what\'s happening with your evidence inventory',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
              ),
        ),
      ],
    )
        .animate()
        .fadeIn(duration: const Duration(milliseconds: 500))
        .slideY(begin: 0.1, end: 0, duration: const Duration(milliseconds: 500));
  }
  
  Widget _buildSummaryCards(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Summary',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 16,
          crossAxisSpacing: 16,
          childAspectRatio: 1.5,
          children: [
            _buildSummaryCard(
              context,
              title: 'Total Items',
              value: '124',
              icon: Icons.inventory_2,
              color: Theme.of(context).colorScheme.primary,
              delay: 0,
            ),
            _buildSummaryCard(
              context,
              title: 'Shelves',
              value: '12',
              icon: Icons.shelves,
              color: Theme.of(context).colorScheme.tertiary,
              delay: 100,
            ),
            _buildSummaryCard(
              context,
              title: 'New Today',
              value: '5',
              icon: Icons.new_releases,
              color: Theme.of(context).colorScheme.secondary,
              delay: 200,
            ),
            _buildSummaryCard(
              context,
              title: 'Pending',
              value: '8',
              icon: Icons.pending_actions,
              color: Colors.orange,
              delay: 300,
            ),
          ],
        ),
      ],
    );
  }
  
  Widget _buildSummaryCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required int delay,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.borderRadius),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(
              icon,
              color: color,
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
                  ),
            ),
          ],
        ),
      ),
    )
        .animate()
        .fadeIn(
          duration: const Duration(milliseconds: 500),
          delay: Duration(milliseconds: delay),
        )
        .scale(
          begin: const Offset(0.9, 0.9),
          end: const Offset(1, 1),
          duration: const Duration(milliseconds: 500),
          delay: Duration(milliseconds: delay),
          curve: Curves.easeOutBack,
        );
  }
  
  Widget _buildRecentActivity(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Activity',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            TextButton(
              onPressed: () {
                // TODO: Navigate to activity log
              },
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: 5,
          itemBuilder: (context, index) {
            return _buildActivityItem(
              context,
              title: 'Item #${1000 + index} added',
              description: 'Firearm - Glock 19',
              time: '${index + 1}h ago',
              icon: Icons.add_circle,
              color: index % 3 == 0
                  ? Colors.green
                  : index % 3 == 1
                      ? Colors.blue
                      : Colors.orange,
              delay: index * 100,
            );
          },
        ),
      ],
    );
  }
  
  Widget _buildActivityItem(
    BuildContext context, {
    required String title,
    required String description,
    required String time,
    required IconData icon,
    required Color color,
    required int delay,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.borderRadius),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.2),
          child: Icon(
            icon,
            color: color,
            size: 20,
          ),
        ),
        title: Text(
          title,
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        subtitle: Text(
          description,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
              ),
        ),
        trailing: Text(
          time,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.5),
              ),
        ),
        onTap: () {
          // TODO: Navigate to item details
        },
      ),
    )
        .animate()
        .fadeIn(
          duration: const Duration(milliseconds: 400),
          delay: Duration(milliseconds: delay),
        )
        .slideX(
          begin: 0.1,
          end: 0,
          duration: const Duration(milliseconds: 400),
          delay: Duration(milliseconds: delay),
          curve: Curves.easeOutCubic,
        );
  }
} 