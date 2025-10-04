'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// Configuración de Seguridad con Helmet
app.use(helmet.frameguard({ action: 'sameorigin' }));
app.use(helmet.dnsPrefetchControl({ allow: false }));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

// Servir archivos estáticos
app.use('/public', express.static(process.cwd() + '/public'));

// ✅ CONFIGURACIÓN CORS MEJORADA PARA PRODUCCIÓN
const corsOptions = {
  origin: function (origin, callback) {
    // Permite solicitudes sin 'origin' y en entorno de desarrollo
    if (!origin || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      // En producción, verifica contra dominios permitidos
      const allowedOrigins = [
        process.env.YOUR_FRONTEND_URL,
        'http://localhost:3000'
      ].filter(Boolean);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });
app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API 
apiRoutes(app);

// ✅ Middleware para Manejo de Errores CORS
app.use((err, req, res, next) => {
  if (err.message === 'Origen no permitido por CORS') {
    res.status(403).json({ 
      error: 'Acceso denegado',
      message: 'Tu dominio no tiene permisos para acceder a este recurso'
    });
  } else {
    next(err);
  }
});

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Tu aplicación está escuchando en el puerto ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.log(e);
      }
    }, 1500);
  }
});

module.exports = app;