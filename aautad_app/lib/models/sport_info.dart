import 'dart:convert';

class Person {
  final String id;
  final String name;
  // Add other relevant person fields if needed, e.g., email
  // final String? email;

  Person({
    required this.id,
    required this.name,
    // this.email,
  });

  factory Person.fromJson(Map<String, dynamic> json) {
    return Person(
      id: json['id'] as String,
      name: json['name'] as String,
      // email: json['email'] as String?,
    );
  }
}

class SportInfo {
  final String id;
  final String name;
  final String? location;
  final String? details;
  final String? link;
  final String? imageUrl;
  final List<Person>? persons; // List of associated persons
  final DateTime createdAt;
  final DateTime updatedAt;

  SportInfo({
    required this.id,
    required this.name,
    this.location,
    this.details,
    this.link,
    this.imageUrl,
    this.persons,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SportInfo.fromJson(Map<String, dynamic> json) {
    var personsList = json['persons'] as List?;
    List<Person>? parsedPersons = personsList
        ?.map((i) => Person.fromJson(i as Map<String, dynamic>))
        .toList();

    return SportInfo(
      id: json['id'] as String,
      name: json['name'] as String,
      location: json['location'] as String?,
      details: json['details'] as String?,
      link: json['link'] as String?,
      imageUrl: json['imageUrl'] as String?,
      persons: parsedPersons,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  // Helper getter for display purposes
  String get responsiblePersonName {
    if (persons != null && persons!.isNotEmpty) {
      return persons!.map((p) => p.name).join(', ');
    }
    return 'N/A'; // Or 'Por definir', etc.
  }

  // Placeholder for schedule display - adapt if you have schedule data
  String get scheduleDisplay {
    // Example: if details contain schedule info or you add specific fields
    // return details ?? 'Horário por definir'; 
    return 'Horário por definir';
  }
}

List<SportInfo> sportInfoFromJson(String str) => 
    List<SportInfo>.from(json.decode(str).map((x) => SportInfo.fromJson(x as Map<String, dynamic>)));
