@echo off
rem Strona LumoBota: serwer podgladu na http://127.0.0.1:8790
start "" http://127.0.0.1:8790/
set "PY=%USERPROFILE%\Desktop\Neuro AI\.venv\Scripts\python.exe"
if not exist "%PY%" set "PY=python"
"%PY%" "%~dp0narzedzia\serwer.py"
