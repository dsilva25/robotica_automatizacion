import pyaudio
import wave
import sys
import getch
import subprocess

# Ruta a Script de medicamento
RUTA_MEDICAMENTO = "/home/pi/robotica_automatizacion"

# Variables de audio
chunk = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
RECORD_SECONDS = 5
WAVE_OUTPUT_FILENAME = "audio.raw"

p = pyaudio.PyAudio()

while True:
	tecla = getch.getche()

	if tecla == 'r':
		stream = p.open(format = FORMAT,
						channels = CHANNELS,
						rate = RATE,
						input = True,
						frames_per_buffer = chunk)

		print ("* recording")
		all = []
		for i in range(0, int(RATE / chunk * RECORD_SECONDS)):
			data = stream.read(chunk)
			all.append(data)
		print ("* done recording")

		stream.close()

		# write data to WAVE file
		data = b''.join(all)
		wf = wave.open(WAVE_OUTPUT_FILENAME, 'wb')
		wf.setnchannels(CHANNELS)
		wf.setsampwidth(p.get_sample_size(FORMAT))
		wf.setframerate(RATE)
		wf.writeframes(data)
		wf.close()

		# Call command node speech-to-text.js
		subprocess.call(['node', 'speech-to-text.js'])
	else:
		print("Presionar la tecla 'r' para grabar")

p.terminate()

print ("Programa finalizado")
