'use strict';

// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
const fs = require('fs');

// Creates a client
const client = new speech.SpeechClient();

// The name of the audio file to transcribe
const fileName = './audio.raw';

// Reads a local audio file and converts it to base64
const file = fs.readFileSync(fileName);
const audioBytes = file.toString('base64');

// The audio file's encoding, sample rate in hertz, and BCP-47 language code
const audio = {
    content: audioBytes,
};
const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'es-CL',
};
const request = {
    audio: audio,
    config: config,
};

const requestHttp = require('request');
const accuweather = require('node-accuweather')()('6qGot0GpOcGDRcQ1Ga4ko7qHwmPEJ1O4');

const headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': 'application/x-www-form-urlencoded'
}

const rut = '191825152';
let nombre = '';

// Detects speech in the audio file
client
    .recognize(request)
    .then(data => {
        const response = data[0];
        let transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        transcription = transcription.toLowerCase();
        transcription = transcription.replace("é", "e");
        console.log(`Transcription: ${transcription}`);
        handleResponse(transcription);
    })
    .catch(err => {
        console.error('ERROR:', err);
    });

function getRequest(url) {
    const options = {
        url: url,
        method: 'GET',
        headers: headers,
    }
    requestHttp(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body);
            const tmpNombre = body.nombre.split(" ");
            nombre = tmpNombre[2];
        }
    })
}

function handleResponse(transcripcion) {
    // Esto obtiene la transcripcion desde el servidor
    try {
        // Flujo
        if ((transcripcion.includes('que') || transcripcion.includes('dime')) && transcripcion.includes('hora')) {
            const date = new Date();
            respTextToSpeech(`${nombre}, la hora es: ${date.getHours()}:${date.getMinutes()}`);
        } else if (transcripcion.includes('temperatura')) {
            accuweather.getCurrentConditions("Santiago", { unit: "Celsius" })
                .then(function (result) {
                    console.log(result);
                    respTextToSpeech(`${nombre}, la temperatura es: ${result.Temperature} Grados. Pero se siente como: ${result.RealFeel} Grados`);
                });
        }

        // Esto imprime la salida por la terminal. Solo muestra los mensajes
        /* process.stdout.write(
        data.results[0] && data.results[0].alternatives[0]
            ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
            : `\n\nReached transcription time limit, press Ctrl+C\n`
        ) */
    } catch (e) {
        console.log("NO SE PUDO PROCESAR LA SOLICITUD, PROBABLEMENTE EL MENSAJE ES MUY LARGO");
        console.log(e);
    }
}

function respTextToSpeech(text) {
    const textToSpeech = require('@google-cloud/text-to-speech');
    const fs = require('fs');
    let player = require('play-sound')();
    const cmd=require('node-cmd');

    const client = new textToSpeech.TextToSpeechClient();

    const outputFile = './output.mp3';

    const request = {
        input: { text: text },
        voice: { languageCode: 'es-CL', ssmlGender: 'FEMALE' },
        audioConfig: { audioEncoding: 'MP3' },
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
            /* player.play(outputFile, function (err) {
                console.log(err);
                if (err) throw err
            }) */
        });
    });
}

getRequest(`https://api.rutify.cl/rut/${rut}`);