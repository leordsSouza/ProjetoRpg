/* ==========================================================================
   SERVIDOR COMPLETO (SITE + DADOS)
   1. Roda o site em http://localhost:3000
   2. Salva fichas na pasta 'dados'
   ========================================================================== */

const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

// --- CONFIGURAÇÕES ---
app.use(cors()); // Permite conexões externas
app.use(express.json({ limit: '50mb' })); // Permite salvar fotos grandes

// *** A MÁGICA: SERVIR O SITE ***
// Isso faz o localhost:3000 mostrar o seu index.html
app.use(express.static(__dirname)); 

// Garante que a pasta 'dados' existe
const pastaDados = path.join(__dirname, 'dados');
if (!fs.existsSync(pastaDados)) {
    fs.mkdirSync(pastaDados);
    console.log(`Pasta 'dados' criada.`);
}

// --- ROTA 1: SALVAR FICHA ---
app.post('/salvar-ficha', (req, res) => {
    const dados = req.body;
    const nomeChar = dados['nome-char'] || 'SemNome';
    
    // Cria nome de arquivo seguro (sem caracteres estranhos)
    const nomeArquivo = nomeChar.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const caminho = path.join(pastaDados, `${nomeArquivo}.json`);

    fs.writeFile(caminho, JSON.stringify(dados, null, 2), (err) => {
        if (err) {
            console.error("Erro ao salvar:", err);
            res.status(500).send("Erro ao gravar no disco.");
        } else {
            console.log(`[SALVO] ${nomeArquivo}.json`);
            res.send("Salvo com sucesso!");
        }
    });
});

// --- ROTA 2: CARREGAR FICHA ---
app.get('/carregar-ficha/:nome', (req, res) => {
    const nome = req.params.nome;
    const nomeArquivo = nome.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const caminho = path.join(pastaDados, `${nomeArquivo}.json`);

    if (fs.existsSync(caminho)) {
        fs.readFile(caminho, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send("Erro ao ler arquivo.");
            } else {
                console.log(`[CARREGADO] ${nomeArquivo}.json`);
                res.json(JSON.parse(data));
            }
        });
    } else {
        res.status(404).send("Ficha não encontrada.");
    }
});

// --- INICIAR ---
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🔥 SITE ESTÁ NO AR!`);
    console.log(`👉 ACESSE AQUI: http://localhost:3000`);
    console.log(`==================================================\n`);
});