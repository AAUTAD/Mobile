import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

class UUIDService {
  static const _storage = FlutterSecureStorage();
  static const _key = 'device_uuid';

  // Retrieve or generate UUID
  static Future<String> getOrCreateUUID() async {
    String? uuid = await _storage.read(key: _key);

    if (uuid == null) {
      uuid = Uuid().v4();
      await _storage.write(key: _key, value: uuid);
    }

    return uuid;
  }
}
