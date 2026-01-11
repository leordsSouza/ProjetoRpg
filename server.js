// Importando as ferramentas
const express = require('express');
const fs = require('fs'); // Ferramenta para ler/escrever arquivos (File System)
const cors = require('cors');
const path = require('path');

const app = express();
const PORTA = 3000;

// Configurações básicas
app.use(cors()); // Permite conexões
app.use(express.json()); // Permite ler JSON enviado pelo front
app.use(express.static('.')); // Serve seus arquivos HTML/CSS/JS atuais

// --- BANCO DE DADOS (SIMPLES) ---
// Vamos salvar as fichas numa pasta chamada "dados"
const PASTA_DADOS = path.join(__dirname, 'dados');

// Se a pasta não existir, cria ela
if (!fs.existsSync(PASTA_DADOS)) {
    fs.mkdirSync(PASTA_DADOS);
}

// --- ROTAS (O CAMINHO DAS PEDRAS) ---

// 1. Rota para SALVAR uma ficha
app.post('/salvar-ficha', (req, res) => {
    const ficha = req.body;
    const nomePersonagem = ficha['nome-char'] || 'SemNome';
    
    // Cria um nome de arquivo seguro (tira espaços e caracteres estranhos)
    const nomeArquivo = `${nomePersonagem.replace(/[^a-z0-9]/gi, '_')}.json`;
    const caminhoArquivo = path.join(PASTA_DADOS, nomeArquivo);

    // Escreve no disco do seu PC
    fs.writeFile(caminhoArquivo, JSON.stringify(ficha, null, 2), (erro) => {
        if (erro) {
            console.error("Erro ao salvar:", erro);
            res.status(500).send("Erro ao salvar ficha.");
        } else {
            console.log(`Ficha de ${nomePersonagem} salva!`);
            res.send("Ficha salva com sucesso no servidor!");
        }
    });
});

// 2. Rota para CARREGAR uma ficha específica
app.get('/carregar-ficha/:nome', (req, res) => {
    const nome = req.params.nome;
    const nomeArquivo = `${nome}.json`;
    const caminhoArquivo = path.join(PASTA_DADOS, nomeArquivo);

    if (fs.existsSync(caminhoArquivo)) {
        const dados = fs.readFileSync(caminhoArquivo);
        const ficha = JSON.parse(dados);
        res.json(ficha);
    } else {
        res.status(404).send("Ficha não encontrada.");
    }
});

// 3. Rota MESTRE (Ver todas as fichas) - O "Olho de Deus"
app.get('/todas-fichas', (req, res) => {
    const arquivos = fs.readdirSync(PASTA_DADOS);
    const listaFichas = [];

    arquivos.forEach(arquivo => {
        if (arquivo.endsWith('.json')) {
            const conteudo = fs.readFileSync(path.join(PASTA_DADOS, arquivo));
            listaFichas.push(JSON.parse(conteudo));
        }
    });

    res.json(listaFichas);
});

// ... (outras rotas)

// 4. Rota para DELETAR uma ficha (Para quando o monstro morrer)
app.delete('/deletar-ficha/:nome', (req, res) => {
    const nome = req.params.nome;
    // Tenta encontrar o arquivo com _ ou espaços
    // O ideal é padronizar, mas vamos tentar achar o arquivo exato
    const arquivos = fs.readdirSync(PASTA_DADOS);
    
    // Procura um arquivo que comece com esse nome (ignorando case sensitive se der)
    const arquivoAlvo = arquivos.find(a => a.toLowerCase() === `${nome}.json`.toLowerCase() || a === `${nome}.json`);

    if (arquivoAlvo) {
        fs.unlinkSync(path.join(PASTA_DADOS, arquivoAlvo));
        res.send("Ficha deletada com sucesso.");
    } else {
        res.status(404).send("Arquivo não encontrado.");
    }
});

// ... (app.listen)

// --- LIGAR O SERVIDOR ---
app.listen(PORTA, () => {
    console.log(`SERVIDOR RODANDO! Acesse: http://localhost:${PORTA}`);
});