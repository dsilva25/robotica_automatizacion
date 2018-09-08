const requestHttp = require('request');
var cron = require('node-cron');
  
const headers = {
  'User-Agent': 'Super Agent/0.0.1',
  'Content-Type': 'application/x-www-form-urlencoded'
}

const rut = '191825152';
let nombre = '';
let medicamentos = [
  {
    nombre: 'Paracetamol',
    hora: '18:59'
  },
  {
    nombre: 'Ibuprofeno',
    hora: '19:00'
  },
  {
    nombre: 'Nope',
    hora: '19:01'
  }
];

function getRequest(url) {
    const options = {
        url: url,
        method: 'GET',
        headers: headers,
    }
    requestHttp(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            const tmpNombre = body.nombre.split(" ");
            nombre = tmpNombre[2];
            console.log(nombre);

            const date = new Date();
            medicamentos.forEach(element => {
                if (element.hora == `${date.getHours()}:${date.getMinutes()}`) {
                    respTextToSpeech(`${nombre}, son las: ${date.getHours()}:${date.getMinutes()}. Es momento de tomar el medicamento: ${element.nombre}`);
                }
            });
        }

    })
}

function respTextToSpeech(text) {
    const textToSpeech = require('@google-cloud/text-to-speech');
    const fs = require('fs');
    let player = require('play-sound')();
    const cmd=require('node-cmd');
  
    const client = new textToSpeech.TextToSpeechClient();
  
    const outputFile = './output.mp3';
  
    const request = {
    input: {text: text},
    voice: {languageCode: 'es-CL', ssmlGender: 'FEMALE'},
    audioConfig: {audioEncoding: 'MP3'},
    };
  
    client.synthesizeSpeech(request, (err, response) => {
      if (err) {
          console.error('ERROR:', err);
          return;
      }
  
      fs.writeFile(outputFile, response.audioContent, 'binary', err => {
          if (err) {
          console.error('ERROR:', err);
          return;
          }
          console.log(`Audio content written to file: ${outputFile}`);
            cmd.get(
                `mpg123 ${outputFile}`,
                function(err, data, stderr) {
                    if (err) throw err;
                    console.log(data);
            }
            );             
      });
    });
}

cron.schedule('*/1 * * * *', function(){
    getRequest(`https://api.rutify.cl/rut/${rut}`);
});