// ignore_for_file: depend_on_referenced_packages
/*
import 'dart:convert';

import 'package:flutter_common/core/entities/media.dart';
import 'package:injectable/injectable.dart';
import 'package:http/http.dart';
import 'package:path/path.dart' as path;
import 'package:driver_flutter/config/env.dart';
import 'package:driver_flutter/config/locator/locator.dart';
import 'package:driver_flutter/core/blocs/auth_bloc.dart';

import 'upload_datasource.dart';

@prod
@LazySingleton(as: UploadDatasource)
class UploadDatasourceImpl implements UploadDatasource {
  UploadDatasourceImpl();

  @override
  Future<MediaEntity> uploadProfilePicture(String filePath) async {
    String? token = locator<AuthBloc>().state.jwtToken;
    if (token == null) {
      throw Exception('Token is null');
    }
    final serverUrl = path.join(Env.serverUrl, 'upload_profile');
    return _uploadFile(serverUrl, token, filePath);
  }

  Future<MediaEntity> _uploadFile(String serverUrl, String authorizationToken, String filePath) async {
    var postUri = Uri.parse(serverUrl);
    var request = MultipartRequest("POST", postUri);
    request.headers['Authorization'] = 'Bearer $authorizationToken';
    request.files.add(await MultipartFile.fromPath('file', filePath));
    final stramedResponse = await request.send();
    var response = await Response.fromStream(stramedResponse);
    var json = jsonDecode(response.body);
    final media = MediaEntity.fromJson(json);

    return MediaEntity(
      id: media.id,
      address: path.join(Env.serverUrl, media.address),
    );
  }

  @override
  Future<MediaEntity> uploadDocument(String filePath) {
    String? token = locator<AuthBloc>().state.jwtToken;
    if (token == null) {
      throw Exception('Token is null');
    }
    final serverUrl = path.join(Env.serverUrl, 'upload_document');
    return _uploadFile(serverUrl, token, filePath);
  }
}
*/





// ignore_for_file: depend_on_referenced_packages

import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/foundation.dart'; // Para kIsWeb
import 'package:http/http.dart';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as path;
import 'package:injectable/injectable.dart';
import 'package:flutter_common/core/entities/media.dart';
import 'package:file_picker/file_picker.dart';

import 'package:driver_flutter/config/env.dart';
import 'package:driver_flutter/config/locator/locator.dart';
import 'package:driver_flutter/core/blocs/auth_bloc.dart';

import 'upload_datasource.dart';

@prod
@LazySingleton(as: UploadDatasource)
class UploadDatasourceImpl implements UploadDatasource {
  UploadDatasourceImpl();

  @override
  Future<MediaEntity> uploadProfilePicture(String filePathOrName) async {
    final token = locator<AuthBloc>().state.jwtToken;
    if (token == null) {
      throw Exception('Token is null');
    }

    final serverUrl = path.join(Env.serverUrl, 'upload_profile');
    final uri = Uri.parse(serverUrl);
    final request = http.MultipartRequest('POST', uri);
    request.headers['Authorization'] = 'Bearer $token';

    if (kIsWeb) {
      // Web: usar FilePicker para obtener el archivo y sus bytes
      final result = await FilePicker.platform.pickFiles();
      if (result == null || result.files.single.bytes == null) {
        throw Exception('No file selected');
      }

      final fileBytes = result.files.single.bytes!;
      final fileName = result.files.single.name;

      request.files.add(http.MultipartFile.fromBytes(
        'file',
        fileBytes,
        filename: fileName,
      ));
    } else {
      // Mobile/Desktop: usar ruta local
      request.files.add(await http.MultipartFile.fromPath('file', filePathOrName));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    final json = jsonDecode(response.body);
    final media = MediaEntity.fromJson(json);

    return MediaEntity(
      id: media.id,
      address: path.join(Env.serverUrl, media.address),
    );
  }

  @override
  Future<MediaEntity> uploadDocument(String filePath) async {
    final token = locator<AuthBloc>().state.jwtToken;
    if (token == null) {
      throw Exception('Token is null');
    }

    final serverUrl = path.join(Env.serverUrl, 'upload_document');
    final uri = Uri.parse(serverUrl);
    final request = http.MultipartRequest('POST', uri);
    request.headers['Authorization'] = 'Bearer $token';

    if (kIsWeb) {
      final result = await FilePicker.platform.pickFiles();
      if (result == null || result.files.single.bytes == null) {
        throw Exception('No file selected');
      }

      final fileBytes = result.files.single.bytes!;
      final fileName = result.files.single.name;

      request.files.add(http.MultipartFile.fromBytes(
        'file',
        fileBytes,
        filename: fileName,
      ));
    } else {
      request.files.add(await http.MultipartFile.fromPath('file', filePath));
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    final json = jsonDecode(response.body);
    final media = MediaEntity.fromJson(json);

    return MediaEntity(
      id: media.id,
      address: path.join(Env.serverUrl, media.address),
    );
  }
}
