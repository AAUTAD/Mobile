class Partner {
  final String id;
  final String name;
  final String nameUrl;
  final String description;
  final String discount;
  final double latitude;
  final double longitude;
  final String facebook;
  final String instagram;
  final String website;
  final List<String> tags;

  Partner({
    required this.id,
    required this.name,
    required this.nameUrl,
    required this.description,
    required this.discount,
    required this.latitude,
    required this.longitude,
    required this.facebook,
    required this.instagram,
    required this.website,
    required this.tags,
  });

  factory Partner.fromJson(Map<String, dynamic> json) {
    return Partner(
      id: json['id'],
      name: json['name'],
      nameUrl: json['nameUrl'],
      description: json['description'],
      discount: json['discount'],
      latitude: double.parse(json['latitude']),
      longitude: double.parse(json['longitude']),
      facebook: json['facebook'] ?? '',
      instagram: json['instagram'] ?? '',
      website: json['website'] ?? '',
      tags: List<String>.from(json['tags'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'nameUrl': nameUrl,
      'description': description,
      'discount': discount,
      'latitude': latitude.toString(),
      'longitude': longitude.toString(),
      'facebook': facebook,
      'instagram': instagram,
      'website': website,
      'tags': tags,
    };
  }
}
