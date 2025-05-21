import 'package:dio/dio.dart';
import 'package:sura/core/config/app_config.dart';
import 'package:sura/core/services/auth_service.dart';
import 'package:sura/features/malkhana/data/models/malkhana_item_model.dart';
import 'package:sura/features/malkhana/data/models/shelf_model.dart';

class MalkhanaRepository {
  final Dio _dio;
  
  MalkhanaRepository() : _dio = Dio(BaseOptions(
    baseUrl: AppConfig.apiBaseUrl,
    connectTimeout: AppConfig.connectionTimeout,
    receiveTimeout: AppConfig.receiveTimeout,
    contentType: 'application/json',
  ));
  
  // Initialize with auth token
  Future<void> _initializeHeaders() async {
    final authService = AuthService();
    await authService.init();
    
    if (authService.token != null) {
      _dio.options.headers['Authorization'] = 'Bearer ${authService.token}';
    }
  }
  
  // Get item by ID
  Future<MalkhanaItemModel> getItemById(String id) async {
    await _initializeHeaders();
    
    try {
      final response = await _dio.get('/malkhana/items/$id');
      return MalkhanaItemModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to get item: ${e.toString()}');
    }
  }
  
  // Get black ink items
  Future<List<MalkhanaItemModel>> getBlackInkItems() async {
    await _initializeHeaders();
    
    try {
      final response = await _dio.get('/malkhana/black-ink');
      return (response.data as List)
          .map((item) => MalkhanaItemModel.fromJson(item))
          .toList();
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to get black ink items: ${e.toString()}');
    }
  }
  
  // Get red ink items
  Future<List<MalkhanaItemModel>> getRedInkItems() async {
    await _initializeHeaders();
    
    try {
      final response = await _dio.get('/malkhana/red-ink');
      return (response.data as List)
          .map((item) => MalkhanaItemModel.fromJson(item))
          .toList();
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to get red ink items: ${e.toString()}');
    }
  }
  
  // Get shelves
  Future<List<ShelfModel>> getAllShelves() async {
    await _initializeHeaders();
    
    try {
      final response = await _dio.get('/malkhana/shelves');
      return (response.data as List)
          .map((shelf) => ShelfModel.fromJson(shelf))
          .toList();
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to get shelves: ${e.toString()}');
    }
  }
  
  // Get shelf by ID
  Future<ShelfModel> getShelfById(String id) async {
    await _initializeHeaders();
    
    try {
      final response = await _dio.get('/malkhana/shelves/$id');
      return ShelfModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to get shelf: ${e.toString()}');
    }
  }
  
  // Get items on a shelf
  Future<List<MalkhanaItemModel>> getShelfItems(String shelfId) async {
    await _initializeHeaders();
    
    try {
      final response = await _dio.get('/malkhana/shelves/$shelfId/items');
      return (response.data as List)
          .map((item) => MalkhanaItemModel.fromJson(item))
          .toList();
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to get shelf items: ${e.toString()}');
    }
  }
  
  // Search items
  Future<List<MalkhanaItemModel>> searchItems(String query) async {
    await _initializeHeaders();
    
    try {
      final response = await _dio.get('/malkhana/search?query=${Uri.encodeComponent(query)}');
      return (response.data as List)
          .map((item) => MalkhanaItemModel.fromJson(item))
          .toList();
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw Exception('Failed to search items: ${e.toString()}');
    }
  }
  
  // Helper to handle Dio errors
  Exception _handleDioError(DioException e) {
    if (e.response != null) {
      final statusCode = e.response!.statusCode;
      final data = e.response!.data;
      
      String message = 'Error occurred';
      if (data is Map && data.containsKey('message')) {
        message = data['message'];
      } else if (data is String) {
        message = data;
      }
      
      switch (statusCode) {
        case 401:
          return Exception('Unauthorized: Please log in again');
        case 403:
          return Exception('Forbidden: You do not have permission to access this resource');
        case 404:
          return Exception('Not found: The requested resource does not exist');
        default:
          return Exception('Server error ($statusCode): $message');
      }
    }
    
    if (e.type == DioExceptionType.connectionTimeout) {
      return Exception('Connection timeout: Please check your internet connection');
    } else if (e.type == DioExceptionType.receiveTimeout) {
      return Exception('Receive timeout: Server took too long to respond');
    } else if (e.type == DioExceptionType.sendTimeout) {
      return Exception('Send timeout: Please check your internet connection');
    } else if (e.type == DioExceptionType.connectionError) {
      return Exception('Connection error: Please check your internet connection');
    }
    
    return Exception('Network error: ${e.message}');
  }
} 