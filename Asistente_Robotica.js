'use strict';

function respTextToSpeech(text) {
    const textToSpeech = require('@google-cloud/text-to-speech');
    const fs = require('fs');
    const player = require('play-sound')();

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

function streamingRecognize(filename, encoding, sampleRateHertz, languageCode) {
  const fs = require('fs');
  const speech = require('@google-cloud/speech');
  const client = new speech.SpeechClient();

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    },
    interimResults: false,
  };

  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
      console.log(
        `Transcription: ${data.results[0].alternatives[0].transcript}`
      );
    });

  // Stream an audio file from disk to the Speech API, e.g. "./resources/audio.raw"
  fs.createReadStream(filename).pipe(recognizeStream);
  // [END speech_streaming_recognize]
}

function streamingMicRecognize(encoding, sampleRateHertz, languageCode) {
  // [START speech_streaming_mic_recognize]
  const record = require('node-record-lpcm16');

  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    },
    interimResults: false, // If you want interim results, set this to true
  };

  // Create a recognize stream
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
      const transcripcion = data.results[0].alternatives[0].transcript;
      if (transcripcion.includes('hora')) {
        respTextToSpeech('La hora es: 17:04');
      }

      process.stdout.write(
        data.results[0] && data.results[0].alternatives[0]
          ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
          : `\n\nReached transcription time limit, press Ctrl+C\n`
      )
    }
    );

  // Start recording and send the microphone input to the Speech API
  record
    .start({
      sampleRateHertz: sampleRateHertz,
      threshold: 0,
      verbose: false,
      recordProgram: 'rec',
      silence: '10.0',
    })
    .on('error', console.error)
    .pipe(recognizeStream);

  console.log('Listening, press Ctrl+C to stop.');
}

require(`yargs`)
  .demand(1)
  .command(
    `listen`,
    `Detects speech in a microphone input stream. This command requires that you have SoX installed and available in your $PATH. See https://www.npmjs.com/package/node-record-lpcm16#dependencies`,
    {},
    opts =>
      streamingMicRecognize(
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .options({
    encoding: {
      alias: 'e',
      default: 'LINEAR16',
      global: true,
      requiresArg: true,
      type: 'string',
    },
    sampleRateHertz: {
      alias: 'r',
      default: 16000,
      global: true,
      requiresArg: true,
      type: 'number',
    },
    languageCode: {
      alias: 'l',
      default: 'es-CL',
      global: true,
      requiresArg: true,
      type: 'string',
    },
  })
  .example(`node $0 listen`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/speech/docs`)
  .help()
  .strict().argv;