@echo off
echo ==========================================
echo      INICIANDO O SISTEMA ARMAGEDON
echo ==========================================
echo.
echo 1. Abrindo o navegador...
start http://localhost:3000

echo 2. Ligando o servidor...
echo (Nao feche esta janela preta enquanto jogar!)
echo.
node server.js
pause