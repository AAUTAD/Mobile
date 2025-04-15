import 'dart:convert';

String fixEncoding(String text) {
  try {
    return utf8.decode(latin1.encode(text));
  } catch (e) {
    // Handle the error gracefully
    print('Error decoding text: $e');
    return text; // Return the original text if decoding fails
  }
}
