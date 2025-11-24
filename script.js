/* ==================================================================
   SCRIPT PRINCIPAL DO ARMAGEDON
   ==================================================================
*/

// --- 1. SELEÇÃO DOS ELEMENTOS (O "Pointer" do DOM) ---
// Pegamos tudo que vamos precisar manipular logo no começo.

// DADOS DO PERFIL
const nomeInput = document.getElementById('nome-char');
const classeInput = document.getElementById('classe-char');

// VIDA
const vidaAtualEl = document.getElementById('pv-atual');
const vidaMaxEl = document.getElementById('pv-max');
const barraVida = document.getElementById('vida-bar-fill');
const btnVidaMenos = document.getElementById('btn-vida-menos');
const btnVidaMais = document.getElementById('btn-vida-mais');

// SANIDADE
const sanAtualEl = document.getElementById('san-atual');
const sanMaxEl = document.getElementById('san-max');
const barraSan = document.getElementById('san-bar-fill');
const btnSanMenos = document.getElementById('btn-san-menos');
const btnSanMais = document.getElementById('btn-san-mais');

// PE (Pontos de Esforço)
const peAtualEl = document.getElementById('pe-atual');
const peMaxEl = document.getElementById('pe-max');
const barraPe = document.getElementById('pe-bar-fill');
const btnPeMenos = document.getElementById('btn-pe-menos');
const btnPeMais = document.getElementById('btn-pe-mais');

// ARCANO
const arAtualEl = document.getElementById('ar-atual');
const arMaxEl = document.getElementById('ar-max');
const barraAr = document.getElementById('ar-bar-fill');
const btnArMenos = document.getElementById('btn-ar-menos');
const btnArMais = document.getElementById('btn-ar-mais');



// --- 2. A FUNÇÃO GENÉRICA (ABSTRAÇÃO) ---

/**
 * Esta função faz TUDO. Ela calcula, limita e atualiza visual e barra.
 * @param {HTMLElement} elAtual - O span do valor atual (ex: pv-atual)
 * @param {HTMLElement} elMax - O span do valor máximo (ex: pv-max)
 * @param {HTMLElement} elBarra - A div da barra colorida
 * @param {number} valor - Quanto somar ou subtrair (+1, -1, etc)
 * @param {string} corNormal - A cor padrão da barra (ex: "#c00")
 * @param {string} corCritica - A cor quando estiver acabando (ex: "#500")
 */
function alterarStatus(elAtual, elMax, elBarra, valor, corNormal, corCritica) {
    // 1. Ler os valores (Convertendo para número)
    let atual = parseInt(elAtual.textContent);
    let max = parseInt(elMax.textContent);

    // 2. Calcular novo valor
    let novoValor = atual + valor;

    // 3. Limites (0 a Max)
    if (novoValor < 0) novoValor = 0;
    if (novoValor > max) novoValor = max;

    // Atualiza na Tela
    elAtual.textContent = novoValor;

    // Usa o ID do elemento (ex: "pv-atual") como nome da gaveta para guardar o valor
    localStorage.setItem(elAtual.id, novoValor); 

    // Atualiza a Barra (Visual)
    const porcentagem = (novoValor / max) * 100;
    elBarra.style.width = `${porcentagem}%`;

    // 6. Mudar cor se estiver crítico (menos de 25%)
    if (porcentagem <= 25) {
        elBarra.style.backgroundColor = corCritica;
    } else {
        elBarra.style.backgroundColor = corNormal;
    }
}

function carregarDados() {
    // Lista de tudo que queremos carregar
    // [Elemento Atual, Elemento Max, Barra, Cor Normal, Cor Critica]
    const dados = [
        { el: vidaAtualEl, max: vidaMaxEl, bar: barraVida, cor: "#c00", crit: "#500" },
        { el: sanAtualEl,  max: sanMaxEl,  bar: barraSan,  cor: "#800080", crit: "#4b0082" },
        { el: peAtualEl,   max: peMaxEl,   bar: barraPe,   cor: "#00e5ff", crit: "#00606b" },
        { el: arAtualEl,   max: arMaxEl,   bar: barraAr,   cor: "#2b59c3", crit: "#10224a" }
    ];

    // Para cada item da lista...
    dados.forEach(item => {
        // 1. Tenta pegar o valor salvo usando o ID (ex: "pv-atual")
        const valorSalvo = localStorage.getItem(item.el.id);

        // 2. Se existir valor salvo (não for nulo)...
        if (valorSalvo !== null) {
            // Atualiza o texto na tela
            item.el.textContent = valorSalvo;
            
            // 3. Força uma atualização visual da barra
            // Chamamos a função com '0' para não mudar o valor, apenas redesenhar a barra
            alterarStatus(item.el, item.max, item.bar, 0, item.cor, item.crit);
        }
    });
}

// --- 3. EVENTOS (CONECTANDO TUDO) ---

// VIDA (Vermelho)
btnVidaMenos.addEventListener('click', function() {
    // Chamamos a função mestra passando os elementos da VIDA e a cor VERMELHA
    alterarStatus(vidaAtualEl, vidaMaxEl, barraVida, -1, "#c00", "#500");
});

btnVidaMais.addEventListener('click', function() {
    alterarStatus(vidaAtualEl, vidaMaxEl, barraVida, 1, "#c00", "#500");
});

// SANIDADE (Roxo)
btnSanMenos.addEventListener('click', function() {
    // Chamamos a função mestra passando os elementos da SANIDADE e a cor ROXA
    alterarStatus(sanAtualEl, sanMaxEl, barraSan, -1, "#800080", "#4b0082");
});

btnSanMais.addEventListener('click', function() {
    alterarStatus(sanAtualEl, sanMaxEl, barraSan, 1, "#800080", "#4b0082");
});

btnPeMenos.addEventListener('click', function() {
    alterarStatus(peAtualEl, peMaxEl, barraPe, -1, "#00e5ff", "#00606b");
});

btnPeMais.addEventListener('click', function() {
    alterarStatus(peAtualEl, peMaxEl, barraPe, 1, "#00e5ff", "#00606b");
});


// --- EVENTOS DO ARCANO (Azul) ---
btnArMenos.addEventListener('click', function() {
    alterarStatus(arAtualEl, arMaxEl, barraAr, -1, "#2b59c3", "#10224a");
});

btnArMais.addEventListener('click', function() {
    alterarStatus(arAtualEl, arMaxEl, barraAr, 1, "#2b59c3", "#10224a");
});

// --- EVENTOS DE PERFIL (Salvar Texto) ---

// Salvar Nome
nomeInput.addEventListener('input', function() {
    localStorage.setItem('nome-char', nomeInput.value);
});

// Salvar Classe
classeInput.addEventListener('input', function() {
    localStorage.setItem('classe-char', classeInput.value);
});

const nomeSalvo = localStorage.getItem('nome-char');
    if (nomeSalvo) nomeInput.value = nomeSalvo;

const classeSalva = localStorage.getItem('classe-char');
    if (classeSalva) classeInput.value = classeSalva

carregarDados();