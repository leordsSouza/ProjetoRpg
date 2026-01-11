@echo off
echo INICIANDO O SISTEMA ARMAGEDON RPG...
echo.
echo 1. Iniciando Servidor...
start /min node server.js
echo.
echo 2. Aguardando o servidor ligar...
timeout /t 2 >nul
echo.
echo 3. Abrindo Painel do Mestre...
start http://localhost:3000/mestre.html
echo.
echo SISTEMA ONLINE! NAO FECHE ESTA JANELA PRETA.
echo.
pause