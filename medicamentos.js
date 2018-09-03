const requestHttp = require('request');
  
const headers = {
  'User-Agent': 'Super Agent/0.0.1',
  'Content-Type': 'application/x-www-form-urlencoded'
}

const rut = '191825152';
let nombre = '';
let medicamentos = [
  {
    nombre: 'Paracetamol',
    hora: '17:49'
  },
  {
    nombre: 'Ibuprofeno',
    hora: '10:00'
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
            console.log(body);
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
          player.play(outputFile, function(err){
              if (err) throw err
          })              
      });
    });
}

getRequest(`https://api.rutify.cl/rut/${rut}`);