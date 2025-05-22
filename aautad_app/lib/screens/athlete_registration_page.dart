import 'package:aautad_app/models/sport_info.dart';
import 'package:aautad_app/services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart'; // For date formatting

class AthleteRegistrationPage extends StatefulWidget {
  @override
  _AthleteRegistrationPageState createState() =>
      _AthleteRegistrationPageState();
}

class _AthleteRegistrationPageState extends State<AthleteRegistrationPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _dateController = TextEditingController();

  // Form field values
  String? _fullName;
  DateTime? _birthDate;
  String? _studentNumber;
  String? _course;
  String? _selectedSport;
  bool? _isFederatedPreviously;
  bool? _isCurrentlyFederated;
  int? _federatedYears;
  double? _weight;
  int? _height;
  String? _additionalInfo;

  List<SportInfo> _sportsList = []; // To store fetched sports
  bool _isLoadingSports = true;
  String? _sportsLoadingError;
  final ApiService _apiService = ApiService();

  @override
  void initState() {
    super.initState();
    _fetchSportsData();
  }

  Future<void> _fetchSportsData() async {
    try {
      final sports = await _apiService.fetchSports();
      if (mounted) {
        setState(() {
          _sportsList = sports;
          _isLoadingSports = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _sportsLoadingError = "Erro ao carregar modalidades: $e";
          _isLoadingSports = false;
        });
      }
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _birthDate ?? DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _birthDate) {
      setState(() {
        _birthDate = picked;
        _dateController.text = DateFormat('dd/MM/yyyy').format(picked);
      });
    }
  }

  @override
  void dispose() {
    _dateController.dispose();
    super.dispose();
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      // Process data (e.g., send to API, save locally)
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Inscrição submetida com sucesso!')),
      );
      // You might want to navigate away or clear the form
      // Navigator.pop(context);
      // _formKey.currentState?.reset();
      // _dateController.clear();
      // setState(() {
      //   _birthDate = null;
      //   _selectedSport = null;
      //   _isFederatedPreviously = null;
      //   _isCurrentlyFederated = null;
      // });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Por favor, corrija os erros no formulário.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Inscrição de Atleta'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: SingleChildScrollView(
        // Add this padding to the SingleChildScrollView
        padding: const EdgeInsets.fromLTRB(
            16.0, 16.0, 16.0, 80.0), // Increased bottom padding
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              TextFormField(
                decoration: InputDecoration(labelText: 'Nome completo'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor, insira o nome completo.';
                  }
                  return null;
                },
                onSaved: (value) => _fullName = value,
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _dateController,
                decoration: InputDecoration(
                  labelText: 'Data de Nascimento',
                  suffixIcon: Icon(Icons.calendar_today),
                ),
                readOnly: true,
                onTap: () => _selectDate(context),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor, selecione a data de nascimento.';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(labelText: 'Nº mecanográfico'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor, insira o nº mecanográfico.';
                  }
                  return null;
                },
                onSaved: (value) => _studentNumber = value,
              ),
              SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(labelText: 'Curso'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor, insira o curso.';
                  }
                  return null;
                },
                onSaved: (value) => _course = value,
              ),
              SizedBox(height: 16),
              _isLoadingSports
                  ? Center(child: CircularProgressIndicator())
                  : _sportsLoadingError != null
                      ? Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8.0),
                          child: Text(_sportsLoadingError!,
                              style:
                                  TextStyle(color: Colors.red, fontSize: 16)),
                        )
                      : DropdownButtonFormField<String>(
                          decoration: InputDecoration(labelText: 'Modalidades'),
                          value: _selectedSport,
                          items: _sportsList.map((SportInfo sport) {
                            return DropdownMenuItem<String>(
                              value: sport
                                  .name, // Use sport.id if you need to save the ID
                              child: Text(sport.name),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedSport = value;
                            });
                          },
                          validator: (value) {
                            if (value == null) {
                              return 'Por favor, selecione uma modalidade.';
                            }
                            return null;
                          },
                          onSaved: (value) => _selectedSport = value,
                        ),
              SizedBox(height: 16),
              Text('Já praticaste em âmbito federado?'),
              Row(
                children: <Widget>[
                  Expanded(
                    child: RadioListTile<bool>(
                      title: const Text('Sim'),
                      value: true,
                      groupValue: _isFederatedPreviously,
                      onChanged: (bool? value) {
                        setState(() {
                          _isFederatedPreviously = value;
                        });
                      },
                    ),
                  ),
                  Expanded(
                    child: RadioListTile<bool>(
                      title: const Text('Não'),
                      value: false,
                      groupValue: _isFederatedPreviously,
                      onChanged: (bool? value) {
                        setState(() {
                          _isFederatedPreviously = value;
                        });
                      },
                    ),
                  ),
                ],
              ),
              // This validation message for radio buttons was not correct before,
              // it's fixed now to only show if a choice hasn't been made AND validation fails.
              if (_formKey.currentState?.validate() == false &&
                  _isFederatedPreviously == null)
                Padding(
                  padding:
                      const EdgeInsets.only(left: 12.0, top: 0, bottom: 8.0),
                  child: Text(
                    'Por favor, selecione uma opção.',
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontSize: 12),
                  ),
                ),
              SizedBox(height: 16),
              Text('Ainda és federado no momento?'),
              Row(
                children: <Widget>[
                  Expanded(
                    child: RadioListTile<bool>(
                      title: const Text('Sim'),
                      value: true,
                      groupValue: _isCurrentlyFederated,
                      onChanged: (bool? value) {
                        setState(() {
                          _isCurrentlyFederated = value;
                          if (value == false) {
                            _federatedYears =
                                null; // Clear years if 'Não' is selected
                          }
                        });
                      },
                    ),
                  ),
                  Expanded(
                    child: RadioListTile<bool>(
                      title: const Text('Não'),
                      value: false,
                      groupValue: _isCurrentlyFederated,
                      onChanged: (bool? value) {
                        setState(() {
                          _isCurrentlyFederated = value;
                          if (value == false) {
                            _federatedYears =
                                null; // Clear years if 'Não' is selected
                          }
                        });
                      },
                    ),
                  ),
                ],
              ),
              if (_formKey.currentState?.validate() == false &&
                  _isCurrentlyFederated == null)
                Padding(
                  padding:
                      const EdgeInsets.only(left: 12.0, top: 0, bottom: 8.0),
                  child: Text(
                    'Por favor, selecione uma opção.',
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontSize: 12),
                  ),
                ),
              SizedBox(height: 16),
              if (_isCurrentlyFederated ==
                  true) // Show this field only if 'Sim' is selected
                TextFormField(
                  decoration:
                      InputDecoration(labelText: 'Se sim, quantos anos?'),
                  keyboardType: TextInputType.number,
                  validator: (value) {
                    if (_isCurrentlyFederated == true &&
                        (value == null || value.isEmpty)) {
                      return 'Por favor, insira o número de anos.';
                    }
                    if (value != null &&
                        value.isNotEmpty &&
                        int.tryParse(value) == null) {
                      return 'Por favor, insira um número válido.';
                    }
                    return null;
                  },
                  onSaved: (value) => _federatedYears =
                      value != null && value.isNotEmpty
                          ? int.tryParse(value)
                          : null,
                ),
              if (_isCurrentlyFederated == true)
                SizedBox(height: 16), // Add space if field is visible
              TextFormField(
                decoration: InputDecoration(labelText: 'Peso (kg)'),
                keyboardType: TextInputType.numberWithOptions(decimal: true),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor, insira o peso.';
                  }
                  if (double.tryParse(value) == null) {
                    return 'Por favor, insira um número válido.';
                  }
                  return null;
                },
                onSaved: (value) => _weight = value != null && value.isNotEmpty
                    ? double.tryParse(value)
                    : null,
              ),
              SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(labelText: 'Altura (cm)'),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Por favor, insira a altura.';
                  }
                  if (int.tryParse(value) == null) {
                    return 'Por favor, insira um número válido.';
                  }
                  return null;
                },
                onSaved: (value) => _height = value != null && value.isNotEmpty
                    ? int.tryParse(value)
                    : null,
              ),
              SizedBox(height: 16),
              TextFormField(
                decoration: InputDecoration(
                  labelText: 'Informações adicionais (opcional)',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true, // Aligns label to top for multiline
                ),
                maxLines: 3,
                onSaved: (value) => _additionalInfo = value,
              ),
              SizedBox(height: 24),
              Padding(
                padding: const EdgeInsets.only(
                    bottom: 20.0), // Ajuste o valor conforme necessário
                child: ElevatedButton(
                  onPressed: _submitForm,
                  child: Text('Submeter Inscrição'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    side: BorderSide(
                      color: Color.fromARGB(255, 43, 42, 42),
                      width: 1.0,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
