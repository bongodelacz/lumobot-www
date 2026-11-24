@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title LumoBot: prosty plik bat

echo ================================
echo   Cześć, !USERNAME!^^!
echo ================================
echo Dzisiaj jest: %DATE%, godzina %TIME:~0,5%
echo Jesteś w folderze: !CD!
echo.

set "IMIE="
set /p "IMIE=Jak masz na imię? "
if defined IMIE set "IMIE=!IMIE:"=!"
if not defined IMIE set "IMIE=nieznajomy"
echo Miło cię poznać, !IMIE!^^!
echo.

echo Pliki w tym folderze:
dir /b
echo.

pause
endlocal