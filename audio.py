""" Record a few seconds of audio and save to a WAVE file. """

import pyaudio
import wave
import sys
#import getch

# 
import subprocess

# CronTab
from crontab import CronTab

# Ruta a Script de medicamento
RUTA_MEDICAMENTO = "/home/pi/robotica_automatizacion"

# Every minute
cron = CronTab(user='pi')
job = cron.new(command='cd ' + RUTA_MEDICAMENTO + ' && node ' + RUTA_MEDICAMENTO + '/medicamentos.js')
job.run()
job.minute.every(1)
cron.write()

# Variables de audio
chunk = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
RECORD_SECONDS = 5
WAVE_OUTPUT_FILENAME = "audio.raw"

p = pyaudio.PyAudio()

while True:
	tecla = raw_input("Presione enter para grabar:  ")

	if tecla == '':
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
		print("Presionar enter para grabar")

p.terminate()

print ("Programa finalizado")
