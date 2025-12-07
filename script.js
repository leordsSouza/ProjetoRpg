// --- ELEMENTOS E VARIÁVEIS GLOBAIS ---
const nomeInput = document.getElementById('nome-char'),
      classeInput = document.getElementById('classe-char');

// Elementos de Vida, Sanidade, PE e Arcano agrupados
const vidaAtualEl = document.getElementById('pv-atual'),
      vidaMaxEl = document.getElementById('pv-max'),
      barraVida = document.getElementById('vida-bar-fill'),
      btnVidaMenos = document.getElementById('btn-vida-menos'),
      btnVidaMais = document.getElementById('btn-vida-mais');

const sanAtualEl = document.getElementById('san-atual'),
      sanMaxEl = document.getElementById('san-max'),
      barraSan = document.getElementById('san-bar-fill'),
      btnSanMenos = document.getElementById('btn-san-menos'),
      btnSanMais = document.getElementById('btn-san-mais');

const peAtualEl = document.getElementById('pe-atual'),
      peMaxEl = document.getElementById('pe-max'),
      barraPe = document.getElementById('pe-bar-fill'),
      btnPeMenos = document.getElementById('btn-pe-menos'),
      btnPeMais = document.getElementById('btn-pe-mais');

const arAtualEl = document.getElementById('ar-atual'),
      arMaxEl = document.getElementById('ar-max'),
      barraAr = document.getElementById('ar-bar-fill'),
      btnArMenos = document.getElementById('btn-ar-menos'),
      btnArMais = document.getElementById('btn-ar-mais');

// --- FUNÇÃO GENÉRICA DE STATUS ---
function alterarStatus(elAtual, elMax, elBarra, valor, corNormal, corCritica) {
    let atual = parseInt(elAtual.textContent);
    let max = parseInt(elMax.textContent);
    let novoValor = atual + valor;

    if (novoValor < 0) novoValor = 0;
    if (novoValor > max) novoValor = max;

    elAtual.textContent = novoValor;
    localStorage.setItem(elAtual.id, novoValor);

    const porcentagem = (novoValor / max) * 100;
    elBarra.style.width = `${porcentagem}%`;
    elBarra.style.backgroundColor = (porcentagem <= 25) ? corCritica : corNormal;
}

function carregarDados() {
    const dados = [
        { el: vidaAtualEl, max: vidaMaxEl, bar: barraVida, cor: "#c00", crit: "#500" },
        { el: sanAtualEl,  max: sanMaxEl,  bar: barraSan,  cor: "#800080", crit: "#4b0082" },
        { el: peAtualEl,   max: peMaxEl,   bar: barraPe,   cor: "#00e5ff", crit: "#00606b" },
        { el: arAtualEl,   max: arMaxEl,   bar: barraAr,   cor: "#2b59c3", crit: "#10224a" }
    ];
    dados.forEach(item => {
        const valorSalvo = localStorage.getItem(item.el.id);
        if (valorSalvo !== null) {
            item.el.textContent = valorSalvo;
            alterarStatus(item.el, item.max, item.bar, 0, item.cor, item.crit);
        }
    });
}

// --- EVENT LISTENERS (STATUS) ---
btnVidaMenos.addEventListener('click', () => alterarStatus(vidaAtualEl, vidaMaxEl, barraVida, -1, "#c00", "#500"));
btnVidaMais.addEventListener('click', () => alterarStatus(vidaAtualEl, vidaMaxEl, barraVida, 1, "#c00", "#500"));

btnSanMenos.addEventListener('click', () => alterarStatus(sanAtualEl, sanMaxEl, barraSan, -1, "#800080", "#4b0082"));
btnSanMais.addEventListener('click', () => alterarStatus(sanAtualEl, sanMaxEl, barraSan, 1, "#800080", "#4b0082"));

btnPeMenos.addEventListener('click', () => alterarStatus(peAtualEl, peMaxEl, barraPe, -1, "#00e5ff", "#00606b"));
btnPeMais.addEventListener('click', () => alterarStatus(peAtualEl, peMaxEl, barraPe, 1, "#00e5ff", "#00606b"));

btnArMenos.addEventListener('click', () => alterarStatus(arAtualEl, arMaxEl, barraAr, -1, "#2b59c3", "#10224a"));
btnArMais.addEventListener('click', () => alterarStatus(arAtualEl, arMaxEl, barraAr, 1, "#2b59c3", "#10224a"));

// --- PERFIL (SALVAR TEXTO) ---
nomeInput.addEventListener('input', () => localStorage.setItem('nome-char', nomeInput.value));
classeInput.addEventListener('input', () => localStorage.setItem('classe-char', classeInput.value));

const nomeSalvo = localStorage.getItem('nome-char');
if (nomeSalvo) nomeInput.value = nomeSalvo;
const classeSalva = localStorage.getItem('classe-char');
if (classeSalva) classeInput.value = classeSalva;

carregarDados();

// --- SALVAR FUNDAMENTOS ---
const atributosIds = ['input-for', 'input-agi', 'input-int', 'input-pre', 'input-con', 'input-arc'];
atributosIds.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        const salvo = localStorage.getItem(id);
        if (salvo) input.value = salvo;
        input.addEventListener('input', () => localStorage.setItem(id, input.value));
    }
});

// --- NAVEGAÇÃO (ABAS) ---
const abas = [
    { btnId: 'btn-menu-ficha',      containerId: 'ficha-container' },
    { btnId: 'btn-menu-inventario', containerId: 'inventario-container' },
    { btnId: 'btn-menu-magias',     containerId: 'magias-container' },
    { btnId: 'btn-menu-config',     containerId: 'config-container' },
    { btnId: 'btn-menu-secret',     containerId: 'secret-container' }
];

abas.forEach(aba => {
    const botao = document.getElementById(aba.btnId);
    const container = document.getElementById(aba.containerId);
    if (!botao || !container) return;

    botao.addEventListener('click', () => {
        abas.forEach(item => {
            document.getElementById(item.btnId).classList.remove('ativo');
            document.getElementById(item.containerId).classList.add('escondido');
        });
        botao.classList.add('ativo');
        container.classList.remove('escondido');
    });
});

// --- REGISTRO RÁPIDO E CONFIG ---
const anotacoesInput = document.getElementById('anotacoes-rapidas');
if (anotacoesInput) {
    const anotacoesSalvas = localStorage.getItem('anotacoes-rapidas');
    if (anotacoesSalvas) anotacoesInput.value = anotacoesSalvas;
    anotacoesInput.addEventListener('input', () => localStorage.setItem('anotacoes-rapidas', anotacoesInput.value));
}

const textarea = document.getElementById('anotacoes-rapidas');
if (textarea) {
    const autoResize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    };
    textarea.addEventListener('input', autoResize);
    setTimeout(autoResize, 100);
}

const checkFonte = document.getElementById('check-fonte-legivel');
if (checkFonte && textarea) {
    function aplicarFonte(usarArial) {
        if (usarArial) textarea.classList.add('fonte-arial');
        else textarea.classList.remove('fonte-arial');
    }
    const prefFonte = localStorage.getItem('pref-fonte-legivel');
    if (prefFonte === 'true') {
        checkFonte.checked = true;
        aplicarFonte(true);
    }
    checkFonte.addEventListener('change', () => {
        const estado = checkFonte.checked;
        aplicarFonte(estado);
        localStorage.setItem('pref-fonte-legivel', estado);
    });
}

// ==================================================================
// 6. SISTEMA DE INVENTÁRIO (CRUD AVANÇADO)
// ==================================================================

// --- A. SELEÇÃO DOS ELEMENTOS DO HTML ---
const invLista = document.getElementById('lista-inventario');

// Botões principais (Cabeçalho do inventário)
const btnAbrirModal = document.getElementById('btn-abrir-modal');
const btnModoDelete = document.getElementById('btn-modo-delete');

// Elementos do Modal (Pop-up)
const modal = document.getElementById('modal-item');
const modalNome = document.getElementById('modal-nome');
const modalQtd = document.getElementById('modal-qtd');
const modalDesc = document.getElementById('modal-desc');
const btnSalvarModal = document.getElementById('btn-salvar-modal');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');

// --- B. ESTADO (MEMÓRIA) ---
let inventario = JSON.parse(localStorage.getItem('meu-inventario')) || [];

// Variáveis de Controle
let modoExclusao = false; // Começa falso (não estamos deletando)
let indiceEdicao = null;  // Se for null, estamos criando. Se for número, estamos editando.

// --- C. FUNÇÕES DO MODAL (ABRIR/FECHAR) ---

function abrirModal(index = null) {
    // 1. Remove a classe 'escondido' para o pop-up aparecer
    modal.classList.remove('escondido');

    // 2. Verifica se é um NOVO item ou se estamos EDITANDO
    if (index === null) {
        // MODO CRIAR: Limpa tudo
        modalNome.value = '';
        modalQtd.value = '1';
        modalDesc.value = '';
        indiceEdicao = null; // Marca que é um novo item
    } else {
        // MODO EDITAR: Puxa os dados do item clicado
        const item = inventario[index];
        modalNome.value = item.nome;
        modalQtd.value = item.qtd;
        modalDesc.value = item.desc || ''; // Se não tiver descrição, fica vazio
        indiceEdicao = index; // Guarda o número do item que estamos mexendo
    }
    
    modalNome.focus(); // Já coloca o cursor para digitar
}

function fecharModal() {
    modal.classList.add('escondido');
}

// --- D. FUNÇÃO PRINCIPAL: RENDERIZAR (DESENHAR NA TELA) ---
function renderizarInventario() {
    invLista.innerHTML = ''; // Limpa a lista visual

    inventario.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('item-inv');

        // LÓGICA DO ÍCONE:
        // Se modoExclusao for TRUE -> Mostra Lixo (Vermelho)
        // Se modoExclusao for FALSE -> Mostra Lápis (Normal)
        
        let icone = '';
        let classeBotao = '';
        let acao = '';

        if (modoExclusao) {
            icone = 'ph-trash';       // Ícone de lixo
            classeBotao = 'btn-delete'; // Classe CSS (podemos criar estilo vermelho depois)
            acao = `deletarItem(${index})`;
        } else {
            icone = 'ph-quill'; // Ícone de lápis
            classeBotao = 'btn-editar'; // Classe normal
            acao = `abrirModal(${index})`;
        }

        // HTML do Item
        li.innerHTML = `
            <div class="info-item" onclick="mostrarDetalhes(${index})" style="flex-grow: 1; cursor: pointer;">
                <span class="nome-item" style="font-weight: bold;">${item.nome}</span>
                <span class="qtd-item" style="font-size: 0.8rem; color: #aaa;">(x${item.qtd})</span>
            </div>
            
            <button class="${classeBotao}" onclick="${acao}">
                <i class="ph ${icone}"></i>
            </button>
        `;

        invLista.appendChild(li);
    });

    // Salva no navegador
    localStorage.setItem('meu-inventario', JSON.stringify(inventario));
}

// --- E. AÇÕES (SALVAR, DELETAR, MOSTRAR DETALHES) ---

// Função chamada pelo botão "Salvar" do Modal
function salvarItem() {
    const nome = modalNome.value;
    const qtd = modalQtd.value;
    const desc = modalDesc.value;

    if (nome.trim() === '') {
        alert("O item precisa de um nome!");
        return;
    }

    const objetoItem = { nome, qtd, desc };

    if (indiceEdicao === null) {
        // CRIAR NOVO: Adiciona no final da lista
        inventario.push(objetoItem);
    } else {
        // ATUALIZAR EXISTENTE: Substitui o item antigo
        inventario[indiceEdicao] = objetoItem;
    }

    renderizarInventario(); // Atualiza a tela
    fecharModal();          // Fecha o pop-up
}

// Função global para deletar (precisa ser window.deletar para o HTML ver)
window.deletarItem = function(index) {
    if(confirm(`Tem certeza que quer deletar "${inventario[index].nome}"?`)) {
        inventario.splice(index, 1); // Remove do array
        renderizarInventario();      // Atualiza a tela
        
        // Se acabar os itens, desliga o modo exclusão automaticamente (opcional)
        if(inventario.length === 0) alternarModoExclusao();
    }
}

// Função para mostrar detalhes na direita (futuro)
window.mostrarDetalhes = function(index) {
    const item = inventario[index];
    const divDireita = document.querySelector('.inv-direita');
    
    // Injeta o HTML na coluna da direita
    divDireita.innerHTML = `
        <h3 style="color: #ff9900; margin-top: 0;">${item.nome}</h3>
        <p style="font-size: 0.9rem; color: #aaa;">Quantidade: ${item.qtd}</p>
        <hr style="border-color: #333;">
        <p style="white-space: pre-wrap;">${item.desc || "Sem descrição."}</p>
    `;
}

// Função para ligar/desligar modo Delete
function alternarModoExclusao() {
    modoExclusao = !modoExclusao; // Inverte (se true vira false, se false vira true)
    
    // Muda a cor do botão da lixeira pra avisar que tá ligado
    if (modoExclusao) {
        btnModoDelete.classList.add('modo-delete-ativo');
    } else {
        btnModoDelete.classList.remove('modo-delete-ativo');
    }

    renderizarInventario(); // Redesenha a lista para trocar os ícones (Lápis <-> Lixo)
}

// --- F. EVENT LISTENERS (QUEM ESCUTA OS CLIQUES) ---

// Botão "+" principal
btnAbrirModal.addEventListener('click', () => abrirModal(null)); // Passa null = Novo item

// Botão "Lixeira" principal
btnModoDelete.addEventListener('click', alternarModoExclusao);

// Botões do Modal
btnSalvarModal.addEventListener('click', salvarItem);
btnCancelarModal.addEventListener('click', fecharModal);

// INICIALIZAÇÃO
renderizarInventario();

// --- D. FUNÇÃO PRINCIPAL: RENDERIZAR ---
function renderizarInventario() {
    invLista.innerHTML = ''; 

    inventario.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('item-inv');
        
        // Damos um ID único para cada LI para podermos achar ela depois
        li.id = `item-id-${index}`;

        // Lógica dos Ícones (Igual antes)
        let icone = modoExclusao ? 'ph-trash' : 'ph-pencil-simple';
        let classeBotao = modoExclusao ? 'btn-delete' : 'btn-editar';
        
        // CUIDADO AQUI:
        // O onclick do botão chama uma função e o 'event.stopPropagation()'
        // Isso impede que, ao clicar no lixo, o item tente abrir a descrição ao mesmo tempo.
        let acaoBotao = modoExclusao 
            ? `event.stopPropagation(); deletarItem(${index})` 
            : `event.stopPropagation(); abrirModal(${index})`;

        // O HTML agora tem CABEÇALHO e CORPO
        li.innerHTML = `
            <div class="item-cabecalho" onclick="toggleDetalhes(${index})">
                <div class="info-item" style="flex-grow: 1;">
                    <span class="nome-item" style="font-weight: bold;">${item.nome}</span>
                    <span class="qtd-item" style="font-size: 0.8rem; color: #aaa; margin-left: 5px;">(x${item.qtd})</span>
                </div>
                
                <button class="${classeBotao}" onclick="${acaoBotao}">
                    <i class="ph ${icone}"></i>
                </button>
            </div>

            <div class="item-corpo">
                <p><strong>Descrição:</strong></p>
                <p>${item.desc || "Sem detalhes..."}</p>
            </div>
        `;

        invLista.appendChild(li);
    });

    localStorage.setItem('meu-inventario', JSON.stringify(inventario));
}

// --- NOVA FUNÇÃO: TOGGLE (Abrir/Fechar) ---
function toggleDetalhes(index) {
    // 1. Acha o elemento LI correspondente
    const elementoItem = document.getElementById(`item-id-${index}`);
    
    // 2. Adiciona ou Remove a classe que faz a mágica do CSS acontecer
    elementoItem.classList.toggle('mostrando-detalhes');
}

// ==================================================================
// 7. SISTEMA DE PERÍCIAS (DIVIDIDO E CORRIGIDO)
// ==================================================================

// 1. Definição das Listas Separadas
const listaFisicas = [
    "Acrobacia", "Atletismo", "Fortitude", "Furtividade", 
    "Iniciativa", "Luta", "Pontaria", "Reflexos"
];

const listaMentais = [
    "Adestramento", "Medicina", "Arcano", "Percepção",
    "Artes", "Pilotagem", "Crime", 
    "Profissão", "Diplomacia", "Religião", 
    "Enganação", "Sobrevivência", "Intimidação", "Tática", 
    "Intuição", "Tecnologia", "Investigação", "Vontade"
];

const listaArmas = [
    "Armas Curtas", "Armas Longas", "Armas Pesadas", 
    "Arremesso", "Lâminas"
];

// 2. Função Genérica: Cria HTML dentro do container certo
function preencherLista(idContainer, listaNomes) {
    const container = document.getElementById(idContainer);
    
    // Se o container não existir no HTML, para a função para não dar erro
    if (!container) return;

    container.innerHTML = ''; // Limpa

    listaNomes.forEach(nome => {
        const div = document.createElement('div');
        div.classList.add('pericia-item');

        div.innerHTML = `
            <span class="pericia-nome" title="${nome}">${nome}</span>
            <div class="pericia-controles">
                <div class="pericia-graus">
                    <input type="checkbox" data-grau="1" onclick="atualizarPericia(this)">
                    <input type="checkbox" data-grau="2" onclick="atualizarPericia(this)">
                    <input type="checkbox" data-grau="3" onclick="atualizarPericia(this)">
                </div>
                <span class="pericia-bonus">+0</span>
            </div>
        `;

        container.appendChild(div);
        carregarPericiaSalva(div, nome); // Carrega o save
    });
}

// 3. Funções de Lógica (Iguais às anteriores)
window.atualizarPericia = function(checkbox) {
    const linha = checkbox.closest('.pericia-item');
    const checkboxes = linha.querySelectorAll('input[type="checkbox"]');
    const spanBonus = linha.querySelector('.pericia-bonus');
    const nomePericia = linha.querySelector('.pericia-nome').innerText;

    const grauClicado = parseInt(checkbox.dataset.grau);
    const estaMarcado = checkbox.checked;

    if (estaMarcado) {
        if (grauClicado >= 2) checkboxes[0].checked = true;
        if (grauClicado >= 3) checkboxes[1].checked = true;
    } else {
        if (grauClicado <= 2) checkboxes[2].checked = false;
        if (grauClicado <= 1) checkboxes[1].checked = false;
    }

    let bonus = 0;
    if (checkboxes[2].checked) bonus = 15;
    else if (checkboxes[1].checked) bonus = 10;
    else if (checkboxes[0].checked) bonus = 5;

    spanBonus.innerText = `+${bonus}`;
    if (bonus > 0) spanBonus.classList.add('tem-bonus');
    else spanBonus.classList.remove('tem-bonus');

    localStorage.setItem(`pericia-${nomePericia}`, bonus);
}

function carregarPericiaSalva(div, nome) {
    const salvo = localStorage.getItem(`pericia-${nome}`);
    if (salvo) {
        const bonus = parseInt(salvo);
        const checkboxes = div.querySelectorAll('input');
        
        if (bonus >= 5) checkboxes[0].checked = true;
        if (bonus >= 10) checkboxes[1].checked = true;
        if (bonus >= 15) checkboxes[2].checked = true;

        const span = div.querySelector('.pericia-bonus');
        span.innerText = `+${bonus}`;
        if(bonus > 0) span.classList.add('tem-bonus');
    }
}

// 4. INICIALIZAÇÃO: Chama a função 3 vezes (uma para cada bloco)
function gerarTodasPericias() {
    preencherLista('container-fisicas', listaFisicas);
    preencherLista('container-mentais', listaMentais);
    preencherLista('container-armas', listaArmas);
}

// Executa
gerarTodasPericias();

// ==================================================================
// 8. SALVAR PONTOS TEMPORÁRIOS
// ==================================================================

// Lista dos IDs dos inputs temporários
const temporariosIds = ['temp-vida', 'temp-san', 'temp-pe', 'temp-ar'];

temporariosIds.forEach(id => {
    const input = document.getElementById(id);
    
    if (input) {
        // 1. Carregar valor salvo (se houver)
        const salvo = localStorage.getItem(id);
        if (salvo) input.value = salvo;

        // 2. Salvar sempre que digitar
        input.addEventListener('input', () => {
            localStorage.setItem(id, input.value);
        });
    }
});