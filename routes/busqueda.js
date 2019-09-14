var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');



// ===========================================
// Búsqueda Específica - Por Colección
// ===========================================
app.get('/coleccion/:tabla/:busqueda', async (req, res) => {

    let busqueda = req.params.busqueda;
    let tabla = req.params.tabla;
    let regex = new RegExp(busqueda, 'i');

    try {

        switch(tabla){
            
            case 'usuarios':
                promesa = await buscarUsuarios(regex);
                break;

            case 'hospitales':
                promesa = await buscarHospitales(regex);
                break;

            case 'medicos':
                promesa = await buscarMedicos(regex);
                break;

            default:
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Los tipos de búsqueda sólo son: usuarios, medicos y hospitales',
                    error: {message: 'tipo de tabla/coleccion no válido'}
                });

        }
        res.status(200).json({
            ok: true,
            [tabla]: promesa
        });

    }catch(error){
        res.status(500).json({
            ok: false,
            error
        })
    }


});


// ===========================================
// Búsqueda General
// ===========================================
app.get('/todo/:busqueda', async (req, res, next) => {

    let busqueda = req.params.busqueda;
    let regex = new RegExp(busqueda, 'i');

    try {
        let hospitales = await buscarHospitales(regex);
        let medicos = await buscarMedicos(regex);
        let usuarios = await buscarUsuarios(regex);

        res.status(200).json({
            ok: true,
            hospitales,
            medicos,
            usuarios
        });

    }catch(error){
        res.status(500).json({
            ok: false,
            error
        })
    }
});

function buscarHospitales(regex) {

    return new Promise( (resolve, reject) => {

        Hospital.find({nombre: regex})
                .populate('usuario', 'nombre email')
                .exec((err, hospitales) => {
                    if(err){
                        reject('Error al cargar hospitales', err);
                    }else{
                        resolve(hospitales)
                    }
                });   
    });
}

function buscarMedicos(regex) {

    return new Promise( (resolve, reject) => {

        Medico.find({nombre: regex})
              .populate('usuario', 'nombre email')
              .populate('hospital')
              .exec((err, medicos) => {
                  if(err){
                      reject('Error al cargar medicos', err);
                  }else{
                      resolve(medicos);
                  }
              });    
    });
}

function buscarUsuarios(regex) {

    return new Promise( (resolve, reject) => {

        Usuario.find({}, 'nombre email role')
                .or([{'nombre': regex}, {'email': regex}])
                .exec((err, usuarios) => {
                    if(err){
                        reject('Error al cargar usuarios', err);
                    }else{
                        resolve(usuarios);
                    }
                });
    });
}



module.exports = app;