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
    hora: '23:37'
  },
  {
    nombre: 'Ibuprofeno',
    hora: '23:38'
  },
  {
    nombre: 'Nope',
    hora: '23:44'
  }
];

async function main() {
    const delay = (time) => new Promise(reject => setTimeout(reject, time));

    while(true) {
        await delay(50000);

        const date = new Date();
        medicamentos.forEach(element => {
            if (element.hora == `${date.getHours()}:${date.getMinutes()}`) {
                getRequest(`https://api.rutify.cl/rut/${rut}`);
            }
        });
    }
}

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

main();