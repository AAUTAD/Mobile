import 'package:aautad_app/models/sport_info.dart';
import 'package:aautad_app/services/api_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

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

  List<SportInfo> _sportsList = [];
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
    if (picked != null) {
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
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Inscrição submetida com sucesso!')),
      );
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
      backgroundColor: Theme.of(context).colorScheme.primary,
      ),
      body: SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(28.0, 16.0, 28.0, 80.0),
      child: Form(
        key: _formKey,
        child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          TextFormField(
          decoration: InputDecoration(labelText: 'Nome completo'),
          validator: (value) => value == null || value.isEmpty
            ? 'Por favor, insira o nome completo.'
            : null,
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
          validator: (value) => value == null || value.isEmpty
            ? 'Por favor, selecione a data de nascimento.'
            : null,
          ),
          SizedBox(height: 16),
          TextFormField(
          decoration: InputDecoration(labelText: 'Nº mecanográfico'),
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          validator: (value) => value == null || value.isEmpty
            ? 'Por favor, insira o nº mecanográfico.'
            : null,
          onSaved: (value) => _studentNumber = value,
          ),
          SizedBox(height: 16),
          TextFormField(
          decoration: InputDecoration(labelText: 'Curso'),
          validator: (value) => value == null || value.isEmpty
            ? 'Por favor, insira o curso.'
            : null,
          onSaved: (value) => _course = value,
          ),
          SizedBox(height: 16),
          _isLoadingSports
            ? Center(child: CircularProgressIndicator())
            : _sportsLoadingError != null
              ? Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Text(
                _sportsLoadingError!,
                style: TextStyle(color: Colors.red, fontSize: 16),
                ),
              )
              : DropdownButtonFormField<String>(
                decoration: InputDecoration(labelText: 'Modalidades'),
                value: _selectedSport,
                items: _sportsList.map((SportInfo sport) {
                return DropdownMenuItem<String>(
                  value: sport.name,
                  child: Text(sport.name),
                );
                }).toList(),
                onChanged: (value) {
                setState(() {
                  _selectedSport = value;
                });
                },
                validator: (value) => value == null
                  ? 'Por favor, selecione uma modalidade.'
                  : null,
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
                _isCurrentlyFederated = null;
                _federatedYears = null;
              });
              },
            ),
            ),
          ],
          ),
          if (_isFederatedPreviously == true) ...[
          SizedBox(height: 16),
          TextFormField(
            decoration:
              InputDecoration(labelText: 'Se sim, quantos anos?'),
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Por favor, insira o número de anos.';
            }
            if (int.tryParse(value) == null) {
              return 'Por favor, insira um número válido.';
            }
            return null;
            },
            onSaved: (value) => _federatedYears =
              value != null ? int.tryParse(value) : null,
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
                });
              },
              ),
            ),
            ],
          ),
          ],
          SizedBox(height: 16),
          TextFormField(
          decoration: InputDecoration(labelText: 'Peso (kg)'),
          keyboardType: TextInputType.numberWithOptions(decimal: true),
          inputFormatters: [
            FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
          ],
          validator: (value) {
            if (value == null || value.isEmpty) {
            return 'Por favor, insira o peso.';
            }
            if (double.tryParse(value) == null) {
            return 'Por favor, insira um número válido.';
            }
            return null;
          },
          onSaved: (value) =>
            _weight = value != null ? double.tryParse(value) : null,
          ),
          SizedBox(height: 16),
          TextFormField(
          decoration: InputDecoration(labelText: 'Altura (cm)'),
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          validator: (value) {
            if (value == null || value.isEmpty) {
            return 'Por favor, insira a altura.';
            }
            if (int.tryParse(value) == null) {
            return 'Por favor, insira um número válido.';
            }
            return null;
          },
          onSaved: (value) =>
            _height = value != null ? int.tryParse(value) : null,
          ),
          SizedBox(height: 16),
          TextFormField(
          decoration: InputDecoration(
            labelText: 'Informações adicionais (opcional)',
            border: OutlineInputBorder(),
            alignLabelWithHint: true,
          ),
          maxLines: 3,
          onSaved: (value) => _additionalInfo = value,
          ),
          SizedBox(height: 24),
          ElevatedButton(
          onPressed: _submitForm,
          child: Text('Submeter Inscrição'),
          ),
          SizedBox(height: 24),
        ],
        ),
      ),
      ),
    );
  }
}
