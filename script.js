
// ==================================================================
// 0. GERENCIADOR DE MEMÓRIA & CONFIGURAÇÃO INICIAL
// ==================================================================

// Detecta Modo Mestre (?char=Nome na URL)
const urlParams = new URLSearchParams(window.location.search);
const MODO_MESTRE = urlParams.has('char');
const charParaCarregar = urlParams.get('char');

// Sistema de Memória Inteligente (Session vs Local)
const Memoria = {
    storage: MODO_MESTRE ? sessionStorage : localStorage, // Define qual usar
    getItem: (key) => Memoria.storage.getItem(key),
    setItem: (key, val) => Memoria.storage.setItem(key, val),
    removeItem: (key) => Memoria.storage.removeItem(key),
    clear: () => Memoria.storage.clear(),
    getTudo: () => ({ ...Memoria.storage }) // Clona o objeto inteiro
};

// Feedback Visual
if (MODO_MESTRE) {
    console.warn("⚠ MODO MESTRE: Usando sessionStorage.");
    document.title = `[MESTRE] ${document.title}`;
} else {
    console.log("✓ MODO JOGADOR: Usando localStorage.");
}

// --- ELEMENTOS GLOBAIS ---
const els = {
    nome: document.getElementById('nome-char'),
    classe: document.getElementById('classe-char'),
    // Agrupando Status para facilitar loops
    status: [
        { id: 'pv', bar: 'vida', cor: '#c00', crit: '#500' },
        { id: 'san', bar: 'san', cor: '#800080', crit: '#4b0082' },
        { id: 'pe', bar: 'pe', cor: '#00e5ff', crit: '#00606b' },
        { id: 'ar', bar: 'ar', cor: '#2b59c3', crit: '#10224a' },
        { id: 'esp', bar: 'esp', cor: '#ffd700', crit: '#b39700' }
    ]
};

// ==================================================================
// 1. AUTO-LOAD (MODO MESTRE)
// ==================================================================

if (charParaCarregar) {
    const salvo = sessionStorage.getItem('nome-char');

    // Se não estiver na memória, busca no servidor
    if (salvo !== charParaCarregar) {
        console.log(`Buscando ficha de "${charParaCarregar}"...`);
        document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;color:#ff9900;font-size:2rem;font-family:sans-serif;">Carregando...</div>';

        (async () => {
            try {
                // Adiciona timestamp (?t=...) para evitar cache velho
                const resp = await fetch(`/carregar-ficha/${charParaCarregar}?t=${Date.now()}`);
                if (resp.ok) {
                    const dados = await resp.json();
                    sessionStorage.clear();
                    // Salva tudo de uma vez
                    Object.keys(dados).forEach(key => sessionStorage.setItem(key, dados[key]));
                    location.reload(); // Recarrega para aplicar
                } else {
                    alert(`Erro: Ficha "${charParaCarregar}" não encontrada.`);
                    window.close();
                }
            } catch (e) {
                document.body.innerHTML = '<h1 style="color:red">Erro de Conexão</h1>';
            }
        })();
        throw new Error("Pausando para reload...");
    }
}

// ==================================================================
// 2. INPUTS, STATUS E BARRAS (CORRIGIDO)
// ==================================================================

// Helper Mágico: Vincula qualquer input ao salvamento automático
const vincularInput = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const salvo = Memoria.getItem(id);
    if (salvo) el.value = salvo;
    el.addEventListener('input', () => Memoria.setItem(id, el.value));
};

// 1. Dados Pessoais & Atributos & Textos
[
    'nome-char', 'classe-char', 'subclasse-char', 'nivel-char', 
    'res-char', 'mov-char', 'defesa-char', 
    'idade-char', 'altura-char', 'peso-char', 'sorte-char', 'dinheiro-char',
    'input-for', 'input-agi', 'input-int', 'input-pre', 'input-con', 'input-arc',
    'temp-vida', 'temp-san', 'temp-pe', 'temp-ar', 'temp-esp',
    'anotacoes-rapidas', 'lesoes-texto', 'traumas-texto',
    'input-dt-global' // Seu novo input de DT
].forEach(vincularInput);

// 2. Sistema de Barras (Vida, Sanidade, PE...)
const statusConfig = [
    { id: 'pv', bar: 'vida', cor: '#c00', crit: '#500' },
    { id: 'san', bar: 'san', cor: '#800080', crit: '#4b0082' },
    { id: 'pe', bar: 'pe', cor: '#00e5ff', crit: '#00606b' },
    { id: 'ar', bar: 'ar', cor: '#2b59c3', crit: '#10224a' },
    { id: 'esp', bar: 'esp', cor: '#ffd700', crit: '#b39700' }
];

const alterarStatus = (id, valor, cfg) => {
    const elAtual = document.getElementById(`${id}-atual`);
    const elMax = document.getElementById(`${id}-max`);
    const elBarra = document.getElementById(`${cfg.bar}-bar-fill`);
    
    if(!elAtual || !elMax) return;

    let atual = parseInt(elAtual.textContent) || 0;
    let max = parseInt(elMax.textContent) || 1;
    
    // Atualiza o valor matemático
    let novo = Math.max(0, Math.min(atual + valor, max));

    // Salva e Atualiza Texto
    elAtual.textContent = novo;
    Memoria.setItem(`${id}-atual`, novo);

    // Atualiza a Barra Visual
    const pct = (novo / max) * 100;
    if(elBarra) {
        elBarra.style.width = `${pct}%`;
        elBarra.style.backgroundColor = (pct <= 25) ? cfg.crit : cfg.cor;
    }
};

// --- INICIALIZAÇÃO DOS STATUS (A CORREÇÃO ESTÁ AQUI) ---
statusConfig.forEach(stat => {
    const elAtual = document.getElementById(`${stat.id}-atual`);
    const elMax = document.getElementById(`${stat.id}-max`);

    // 1. Força o carregamento do MÁXIMO primeiro (Ex: max-pv)
    // Isso garante que a barra saiba o tamanho total correto
    const maxSalvo = Memoria.getItem(`max-${stat.id}`);
    if (maxSalvo && elMax) elMax.textContent = maxSalvo;

    // 2. Carrega o valor ATUAL salvo
    const atualSalvo = Memoria.getItem(`${stat.id}-atual`);
    if (atualSalvo !== null && elAtual) {
        elAtual.textContent = atualSalvo;
    }

    // 3. Chama a função com valor "0" apenas para pintar a barra corretamente
    alterarStatus(stat.id, 0, stat);

    // Listeners dos Botões
    document.getElementById(`btn-${stat.bar}-menos`)?.addEventListener('click', () => alterarStatus(stat.id, -1, stat));
    document.getElementById(`btn-${stat.bar}-mais`)?.addEventListener('click', () => alterarStatus(stat.id, 1, stat));
});

// --- SALVAMENTO DO DT (SEÇÃO EXTRA) ---
const inputDT = document.getElementById('input-dt-global');
if (inputDT) {
    const salvoDT = Memoria.getItem('input-dt-global');
    if (salvoDT) inputDT.value = salvoDT;
    inputDT.addEventListener('input', () => Memoria.setItem('input-dt-global', inputDT.value));
}

// 3. Sistema de Fome (Cascata)
window.atualizarFome = (checkbox) => {
    const grau = parseInt(checkbox.dataset.grau);
    const active = checkbox.checked;
    
    for (let i = 1; i <= 3; i++) {
        const el = document.getElementById(`fome-${i}`);
        if ((active && i <= grau) || (!active && i >= grau)) {
            el.checked = active;
        }
        Memoria.setItem(`fome-${i}`, el.checked);
    }
};
[1, 2, 3].forEach(i => {
    const el = document.getElementById(`fome-${i}`);
    if (el) el.checked = Memoria.getItem(`fome-${i}`) === 'true';
});

// ==================================================================
// 3. NAVEGAÇÃO & SEGREDOS
// ==================================================================

const HASH_PADRAO = "-1800952524"; // "mestre"
let hashExigido = HASH_PADRAO;

// Configuração dos Personagens
const PERSONAGENS = {
    "Drakon": {
        msg: "As chamas do passado queimam suas correntes.",
        hash: "-1800952524",
        origin: { 
            img: "img/Dragao_origem.png", title: "Coração de Dragão", 
            desc: "Sua linhagem draconica desperta." 
        },
        skills: [
            { id: "sopro", nome: "Sopro de Fogo", desc: "Cuspir chamas em cone.", hash: "3135424", pos: {x:20, y:25}, icone: "ph-fire" },
            { id: "escamas", nome: "Escamas Rígidas", desc: "+2 na Defesa passiva.", custo: 3, pos: {x:80, y:30}, icone: "ph-shield" },
            { id: "garras", nome: "Garras Afiadas", desc: "Ataques desarmados causam corte.", custo: 2, pos: {x:35, y:75}, icone: "ph-hand-fist" },
            { id: "voo", nome: "Asas Membranosas", desc: "Pode planar.", custo: 4, pos: {x:75, y:85}, icone: "ph-paper-plane-tilt" }
        ]
    },
    "Lucifer": { msg: "Apenas os tolos buscam o que não compreendem.", hash: "-1800952524" },
    "Soli": { msg: "Apenas os tolos buscam o que não compreendem.", hash: "1180179092" }
};

// Elementos Modal Senha
const uiSenha = {
    modal: document.getElementById('modal-senha'),
    input: document.getElementById('input-senha'),
    msg: document.getElementById('msg-bloqueio'),
    btnOk: document.getElementById('btn-confirma-senha'),
    btnCancel: document.getElementById('btn-cancelar-senha')
};

// Configuração das Abas
const abas = [
    { btn: 'btn-menu-ficha', div: 'ficha-container' },
    { btn: 'btn-menu-inventario', div: 'inventario-container' },
    { btn: 'btn-menu-magias', div: 'magias-container' },
    { btn: 'btn-menu-config', div: 'config-container' },
    { btn: 'btn-menu-secret', div: 'secret-container', lock: true }
];

// Lógica de Troca de Abas
abas.forEach(aba => {
    const btn = document.getElementById(aba.btn);
    const div = document.getElementById(aba.div);
    if (!btn || !div) return;

    btn.addEventListener('click', () => {
        if (aba.lock) {
            configurarModalSenha();
            return;
        }
        ativarAba(btn, div);
    });
});

const ativarAba = (btnAtivo, divAtiva) => {
    abas.forEach(a => {
        document.getElementById(a.btn).classList.remove('ativo');
        document.getElementById(a.div).classList.add('escondido');
    });
    btnAtivo.classList.add('ativo');
    divAtiva.classList.remove('escondido');
};

// Lógica de Senha
//const configurarModalSenha = () => {
    //const nome = els.nome.value.trim();
   //const dados = PERSONAGENS[nome];

    //if (dados) {
        //uiSenha.msg.innerText = dados.msg;
        //uiSenha.msg.style.color = "#ff9900";
        //hashExigido = dados.hash;
    //} else {
        //uiSenha.msg.innerHTML = "As correntes o protegem.<br>O selo NÃO te quer aqui.";
        //uiSenha.msg.style.color = "#f00";
        //hashExigido = HASH_PADRAO;
    //}
    
    //uiSenha.modal.classList.remove('escondido');
    //uiSenha.input.value = '';
    //uiSenha.input.focus();
//};

const tentarDesbloquear = () => {
    if (gerarHash(uiSenha.input.value) === hashExigido) {
        // Sucesso
        const abaSecret = abas.find(a => a.btn === 'btn-menu-secret');
        abaSecret.lock = false; // Destrava permanentemente
        
        const btn = document.getElementById('btn-menu-secret');
        const correntes = btn.querySelector('.camada-correntes');
        if (correntes) correntes.style.display = 'none';

        uiSenha.modal.classList.add('escondido');
        ativarAba(btn, document.getElementById('secret-container'));
    } else {
        // Erro
        uiSenha.input.classList.add('erro-animacao');
        setTimeout(() => uiSenha.input.classList.remove('erro-animacao'), 300);
    }
};

// Listeners Senha
uiSenha.btnOk.addEventListener('click', tentarDesbloquear);
uiSenha.btnCancel.addEventListener('click', () => uiSenha.modal.classList.add('escondido'));
uiSenha.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') tentarDesbloquear();
});

// Registro Rápido (Anotações)
const areaAnotacao = document.getElementById('anotacoes-rapidas');
if (areaAnotacao) {
    const salvo = Memoria.getItem('anotacoes-rapidas');
    if (salvo) areaAnotacao.value = salvo;
    
    areaAnotacao.addEventListener('input', () => {
        Memoria.setItem('anotacoes-rapidas', areaAnotacao.value);
        // Auto-Resize
        areaAnotacao.style.height = 'auto';
        areaAnotacao.style.height = areaAnotacao.scrollHeight + 'px';
    });
}

// ==================================================================
// 6. SISTEMA DE INVENTÁRIO (OTIMIZADO)
// ==================================================================

// Elementos da Interface (Agrupados para organização)
const uiInv = {
    lista: document.getElementById('lista-inventario'),
    cargaAtual: document.getElementById('carga-atual'),
    cargaMax: document.getElementById('carga-max'),
    displayCarga: document.querySelector('.carga-display'),
    inputForca: document.getElementById('input-for'),
    // Botões
    btnAbrir: document.getElementById('btn-abrir-modal'),
    btnDeleteMode: document.getElementById('btn-modo-delete'),
    // Modal
    modal: document.getElementById('modal-item'),
    inputs: {
        nome: document.getElementById('modal-nome'),
        qtd: document.getElementById('modal-qtd'),
        peso: document.getElementById('modal-peso'),
        desc: document.getElementById('modal-desc')
    },
    modalBtnSalvar: document.getElementById('btn-salvar-modal'),
    modalBtnCancel: document.getElementById('btn-cancelar-modal')
};

// Estado
let inventario = JSON.parse(Memoria.getItem('meu-inventario')) || [];
let modoExclusao = false;
let indiceEdicao = null;

// --- CÁLCULO E RENDERIZAÇÃO ---

const atualizarCarga = () => {
    // 1. Calcula Peso Total usando REDUCE (Acumulador)
    const pesoTotal = inventario.reduce((total, item) => {
        const peso = parseFloat(String(item.peso).replace(',', '.')) || 0;
        const qtd = parseInt(item.qtd) || 1;
        return total + (peso * qtd);
    }, 0);

    // 2. Calcula Limite (Força * 5, mínimo 5)
    const forca = parseInt(uiInv.inputForca?.value) || 0;
    const max = Math.max(5, forca * 5);

    // 3. Atualiza Interface
    if (uiInv.cargaAtual) uiInv.cargaAtual.innerText = Number.isInteger(pesoTotal) ? pesoTotal : pesoTotal.toFixed(1);
    if (uiInv.cargaMax) uiInv.cargaMax.innerText = max;

    // 4. Alerta Visual
    if (uiInv.displayCarga) {
        uiInv.displayCarga.classList.toggle('sobrepeso', pesoTotal > max);
    }
};

const renderizarInventario = () => {
    if (!uiInv.lista) return;
    uiInv.lista.innerHTML = '';
    atualizarCarga();

    inventario.forEach((item, i) => {
        const li = document.createElement('li');
        li.className = 'item-inv';
        li.id = `item-id-${i}`;

        // Define ícone e ação baseado no modo (Edição vs Exclusão)
        const [icone, classe, acao] = modoExclusao
            ? ['ph-trash', 'btn-delete', `deletarItem(${i})`]
            : ['ph-pencil-simple', 'btn-editar', `abrirModal(${i})`];

        // Formata peso para exibição (Ex: 0,5kg)
        const pesoFmt = item.peso ? `| ${String(item.peso).replace('.', ',')}kg` : '';

        li.innerHTML = `
            <div class="item-cabecalho" onclick="toggleDetalhes(${i})">
                <div class="info-item" style="flex-grow: 1;">
                    <span class="nome-item" style="font-weight: bold;">${item.nome}</span>
                    <span class="qtd-item" style="font-size: 0.8rem; color: #aaa; margin-left: 5px;">(x${item.qtd}) ${pesoFmt}</span>
                </div>
                <button class="${classe}" onclick="event.stopPropagation(); ${acao}">
                    <i class="ph ${icone}"></i>
                </button>
            </div>
            <div class="item-corpo">
                <p><strong>Descrição:</strong></p>
                <p>${item.desc || "..."}</p>
            </div>`;
        
        uiInv.lista.appendChild(li);
    });
    Memoria.setItem('meu-inventario', JSON.stringify(inventario));
};

// --- AÇÕES DO INVENTÁRIO ---

const salvarItem = () => {
    const { nome, qtd, desc, peso } = uiInv.inputs;
    if (!nome.value.trim()) return alert("Nome obrigatório!");

    const novoItem = {
        nome: nome.value,
        qtd: qtd.value,
        desc: desc.value,
        peso: peso.value || "0"
    };

    if (indiceEdicao === null) inventario.push(novoItem);
    else inventario[indiceEdicao] = novoItem;

    renderizarInventario();
    fecharModal();
};

window.deletarItem = (index) => {
    if (confirm(`Excluir "${inventario[index].nome}"?`)) {
        inventario.splice(index, 1);
        renderizarInventario();
        // Se acabar os itens, sai do modo exclusão automaticamente
        if (inventario.length === 0 && modoExclusao) alternarModoExclusao();
    }
};

// Funções de Interface
const abrirModal = (index = null) => {
    uiInv.modal.classList.remove('escondido');
    indiceEdicao = index;
    
    // Se for edição, carrega dados. Se for novo, limpa tudo.
    const item = index !== null ? inventario[index] : { nome: '', qtd: 1, desc: '', peso: '' };
    
    uiInv.inputs.nome.value = item.nome;
    uiInv.inputs.qtd.value = item.qtd;
    uiInv.inputs.desc.value = item.desc;
    uiInv.inputs.peso.value = item.peso;
    
    uiInv.inputs.nome.focus();
};

const fecharModal = () => uiInv.modal.classList.add('escondido');

const alternarModoExclusao = () => {
    modoExclusao = !modoExclusao;
    uiInv.btnDeleteMode.classList.toggle('modo-delete-ativo', modoExclusao);
    renderizarInventario();
};

window.toggleDetalhes = (i) => document.getElementById(`item-id-${i}`)?.classList.toggle('mostrando-detalhes');

// Listeners
if (uiInv.btnAbrir) uiInv.btnAbrir.onclick = () => abrirModal(null);
if (uiInv.btnDeleteMode) uiInv.btnDeleteMode.onclick = alternarModoExclusao;
if (uiInv.modalBtnSalvar) uiInv.modalBtnSalvar.onclick = salvarItem;
if (uiInv.modalBtnCancel) uiInv.modalBtnCancel.onclick = fecharModal;
if (uiInv.inputForca) uiInv.inputForca.addEventListener('input', atualizarCarga);

// Inicializa
renderizarInventario();



// ==================================================================
// 7. SISTEMA DE PERÍCIAS (SIMPLIFICADO)
// ==================================================================

const listasPericias = {
    fisicas: ["Acrobacia (Agi)", "Atletism (For)", "Furtividade (Agi)", "Iniciativa (Agi)", "Luta (For)", "Pilotagem (Agi)", "Prestidigitação (Agi)", "Reflexos (Agi)", "Vontade (Pre)"  ],
    mentais: ["Adestramento (Pre)", "Intimidação (Pre)", "Alquimia (Int)", "Intuição (Pre)", "Arcano (Arc)", "Investigação (Int)", "Artes (Int)", "Medicina (Int)", "Biologia (Int)", "Percepção (Pre)", "Curiosidade (Pre)", "Profissão (Pre)", "Diplomacia (Pre)", "Psicologia (Pre)", "Enganação (Pre)", "Química (Int)", "Engenharia (Int)", "Sobrevivência (Int)", "Herbologia (Int)", "Tática (Int)", "História (Int)", "Tecnologia (Int)"],
    armas: ["A. Branca Leves (Agi)", "A. Branca Longas (Agi/For)", "A. Branca Pesadas (For)", "Arremesso (Agi)", "A. Fogo Leves (Agi)", "A. Fogo Pesadas (For)", "Metralhadoras (For)", "Rifles de Precisão (Agi)"]
};

const preencherLista = (containerId, lista) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = lista.map(nome => `
        <div class="pericia-item">
            <span class="pericia-nome" title="${nome}">${nome}</span>
            <div class="pericia-controles">
                <div class="pericia-graus">
                    ${[1, 2, 3].map(i => `<input type="checkbox" data-grau="${i}" onclick="atualizarPericia(this)">`).join('')}
                </div>
                <span class="pericia-bonus">+0</span>
            </div>
        </div>
    `).join('');

    // Carrega o estado salvo após criar o HTML
    lista.forEach(nome => carregarPericia(container, nome));
};

// Lógica de Atualização (Cascata de Checkboxes)
window.atualizarPericia = (checkbox) => {
    const linha = checkbox.closest('.pericia-item');
    const checkboxes = linha.querySelectorAll('input');
    const spanBonus = linha.querySelector('.pericia-bonus');
    const nome = linha.querySelector('.pericia-nome').innerText;
    
    const grauClicado = parseInt(checkbox.dataset.grau);
    const marcar = checkbox.checked;

    // Lógica inteligente: Loop simples para marcar/desmarcar baseado no índice
    checkboxes.forEach((cb, index) => {
        const grauAtual = index + 1;
        if (marcar) {
            // Se marquei o 3, o 1 e 2 devem marcar também
            if (grauAtual <= grauClicado) cb.checked = true;
        } else {
            // Se desmarquei o 2, o 3 deve desmarcar também
            if (grauAtual >= grauClicado) cb.checked = false;
        }
    });

    // Calcula bônus: Conta quantos estão marcados * 5
    const marcados = Array.from(checkboxes).filter(cb => cb.checked).length;
    const bonus = marcados * 5;

    spanBonus.innerText = `+${bonus}`;
    spanBonus.classList.toggle('tem-bonus', bonus > 0);
    Memoria.setItem(`pericia-${nome}`, bonus);
};

const carregarPericia = (container, nome) => {
    const bonus = parseInt(Memoria.getItem(`pericia-${nome}`)) || 0;
    if (bonus === 0) return;

    // Encontra a linha certa buscando pelo texto do span
    const spans = Array.from(container.querySelectorAll('.pericia-nome'));
    const targetSpan = spans.find(s => s.innerText === nome);
    if (!targetSpan) return;

    const linha = targetSpan.closest('.pericia-item');
    const checkboxes = linha.querySelectorAll('input');
    
    // Marca visualmente baseado no bônus (5 -> 1 check, 10 -> 2 checks...)
    const qtdChecks = bonus / 5;
    for(let i = 0; i < qtdChecks; i++) checkboxes[i].checked = true;

    const spanBonus = linha.querySelector('.pericia-bonus');
    spanBonus.innerText = `+${bonus}`;
    spanBonus.classList.add('tem-bonus');
};

// Inicializa tudo
preencherLista('container-fisicas', listasPericias.fisicas);
preencherLista('container-mentais', listasPericias.mentais);
preencherLista('container-armas', listasPericias.armas);


// ==================================================================
// 8. PONTOS TEMPORÁRIOS E TEXTOS (SIMPLIFICADO)
// ==================================================================

['temp-vida', 'temp-san', 'temp-pe', 'temp-ar', 'temp-esp'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    const salvo = Memoria.getItem(id);
    if (salvo) input.value = salvo;

    input.addEventListener('input', () => Memoria.setItem(id, input.value));
});

// Salvamento de Textos Grandes
['anotacoes-rapidas', 'lesoes-texto', 'traumas-texto'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.value = Memoria.getItem(id) || '';
        el.addEventListener('input', () => Memoria.setItem(id, el.value));
    }
});

// ==================================================================
// 9. SISTEMA DE MAGIAS (COM SWITCH PE/ARC)
// ==================================================================

const uiMagia = {
    modal: document.getElementById('modal-magia'),
    lista: document.getElementById('lista-magias'),
    inputs: {
        nome: document.getElementById('magia-nome'),
        custo: document.getElementById('magia-custo'),
        extra: document.getElementById('magia-custo-extra'),
        desc: document.getElementById('magia-desc'),
        cor: document.getElementById('magia-elemento-select'),
        maestria: document.getElementById('magia-maestria') 
    },

    wrapperCusto: document.getElementById('box-custo-wrapper'),
    btnSwitch: document.getElementById('btn-switch-custo'),
    
    btns: {
        add: document.getElementById('btn-add-magia'),
        save: document.getElementById('btn-salvar-magia'),
        cancel: document.getElementById('btn-cancelar-magia'),
        addCusto: document.getElementById('btn-add-custo')
    },
    containerExtra: document.getElementById('container-custo-extra')
};

// Variáveis de Estado
let listaMagias = JSON.parse(Memoria.getItem('minhas-magias')) || [];
let tipoCustoAtual = 'PE'; // Padrão inicial

// --- LÓGICA DO SWITCH VISUAL ---
if (uiMagia.btnSwitch) {
    uiMagia.btnSwitch.addEventListener('click', () => {
        // Alterna entre PE e ARC
        tipoCustoAtual = (tipoCustoAtual === 'PE') ? 'ARC' : 'PE';
        atualizarVisualSwitch();
    });
}

function atualizarVisualSwitch() {
    if (!uiMagia.wrapperCusto) return;
    
    // Remove as classes antigas
    uiMagia.wrapperCusto.classList.remove('modo-pe', 'modo-arc');
    
    // Adiciona a classe certa
    if (tipoCustoAtual === 'PE') {
        uiMagia.wrapperCusto.classList.add('modo-pe');
    } else {
        uiMagia.wrapperCusto.classList.add('modo-arc');
    }
}

// --- RENDERIZAÇÃO DOS CARDS ---
const renderizarMagias = () => {
    if (!uiMagia.lista) return;

    uiMagia.lista.innerHTML = listaMagias.map((m, i) => {
        // 1. Identifica os custos (Ficam no Rodapé)
        const labelTipo = m.tipoCusto || 'PE';
        const tagCusto = `<span class="magia-tag" style="color:${m.cor}; border-color:${m.cor}">${m.custo} ${labelTipo}</span>`;
        
        const tagExtra = (m.custoExtra && m.custoExtra.trim()) 
            ? `<span class="magia-tag tag-extra">${m.custoExtra}</span>` : '';
        
        // 2. Lógica da Imagem de Maestria (Vai para o Topo)
        let tagMaestria = '';
        const valorMaestria = m.maestria; // Pega o valor salvo
        
        if (valorMaestria) {
            // Pega apenas o número (ex: "Opcao 2" vira "2")
            const numeroEncontrado = String(valorMaestria).match(/\d+/);
            if (numeroEncontrado) {
                const numero = numeroEncontrado[0];
                tagMaestria = `<img src="img/maestria-${numero}.png" class="icone-maestria" title="Maestria ${numero}">`;
            }
        }

        // 3. Monta o novo HTML do Card
        return `
        <div class="magia-card" style="border-color: ${m.cor}; box-shadow: 0 0 5px ${m.cor}40">
            
            <div class="card-topo">
                <div class="card-nome-grupo">
                    <h3 class="magia-nome" style="color: ${m.cor}">${m.nome}</h3>
                    ${tagMaestria}
                </div>
                <button class="btn-del-magia" onclick="deletarMagia(${i})">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
            
            <div class="card-corpo">
                <p class="magia-texto">${m.desc}</p>
            </div>
            
            <div class="card-rodape">
                ${tagCusto}
                ${tagExtra}
            </div>
        </div>`;
    }).join('');

    Memoria.setItem('minhas-magias', JSON.stringify(listaMagias));
};

// --- AÇÕES ---
const salvarMagia = () => {

    const { nome, custo, extra, desc, cor, maestria } = uiMagia.inputs;
    
    if (!nome.value.trim()) return alert("Nome obrigatório!");

    const valorMaestria = maestria ? maestria.value : "";

    listaMagias.push({
        nome: nome.value,
        custo: custo.value || '0',
        tipoCusto: tipoCustoAtual,
        custoExtra: extra.value,
        cor: cor.value,
        maestria: valorMaestria,
        desc: desc.value
    });

    renderizarMagias();
    fecharModalMagia();
};

window.deletarMagia = (index) => {
    if (confirm("Apagar este ritual?")) {
        listaMagias.splice(index, 1);
        renderizarMagias();
    }
};

// --- UI CONTROL ---
const abrirModalMagia = () => {
    uiMagia.modal.classList.remove('escondido');
    Object.values(uiMagia.inputs).forEach(input => input.value = '');
    
    // Reseta o Switch para PE sempre que abrir
    tipoCustoAtual = 'PE';
    atualizarVisualSwitch();
    
    setTimeout(() => uiMagia.inputs.nome.focus(), 50);
};

const fecharModalMagia = () => uiMagia.modal.classList.add('escondido');

// Listeners
if (uiMagia.btns.add) uiMagia.btns.add.onclick = abrirModalMagia;
if (uiMagia.btns.save) uiMagia.btns.save.onclick = salvarMagia;
if (uiMagia.btns.cancel) uiMagia.btns.cancel.onclick = fecharModalMagia;


// Inicializa
renderizarMagias();

// ==================================================================
// 10. PREFERÊNCIAS VISUAIS
// ==================================================================

const checkFonte = document.getElementById('check-fonte-legivel');

if (checkFonte) {
    // Carrega
    const ativa = Memoria.getItem('fonte-legivel') === 'true';
    checkFonte.checked = ativa;
    document.body.classList.toggle('modo-fonte-simples', ativa);

    // Salva
    checkFonte.addEventListener('change', () => {
        const estado = checkFonte.checked;
        document.body.classList.toggle('modo-fonte-simples', estado);
        Memoria.setItem('fonte-legivel', estado);
    });
}


// ==================================================================
// 11. SISTEMA DE SALVAR/CARREGAR (VISUAL DARK + SERVIDOR LOCAL)
// ==================================================================
const btnSalvarNuvem = document.getElementById('btn-salvar-nuvem');
const btnCarregarNuvem = document.getElementById('btn-carregar-nuvem');

// --- 1. SALVAR (COM POP-UP BONITO) ---
if (btnSalvarNuvem) {
    // O segredo está aqui: 'async' permite esperar o pop-up
    btnSalvarNuvem.onclick = async () => {
        const textoOriginal = btnSalvarNuvem.innerHTML;
        btnSalvarNuvem.innerHTML = '<i class="ph ph-spinner mb-spin"></i> ...';

        // Tenta pegar os dados (Memoria ou localStorage)
        let dados = (typeof Memoria !== 'undefined') ? Memoria.getTudo() : localStorage;
        
        // Garante que o nome esteja atualizado
        const inputNome = document.getElementById('nome-char');
        dados['nome-char'] = inputNome ? inputNome.value : 'SemNome';

        try {
            // Envia para o servidor
            const resp = await fetch('/salvar-ficha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (resp.ok) {
                // SUCESSO VISUAL
                await RPG.alert("Sincronizado", "Ficha salva na pasta 'dados' com sucesso! ✅");
            } else {
                // ERRO VISUAL
                await RPG.alert("Erro", "O servidor recusou o salvamento. Verifique o terminal.");
            }
        } catch (e) {
            console.error(e);
            // ERRO DE CONEXÃO VISUAL
            await RPG.alert("Sem Conexão", "Não consegui falar com o servidor.\nCertifique-se que o 'node server.js' está rodando.");
        } finally {
            btnSalvarNuvem.innerHTML = textoOriginal;
        }
    };
}

// --- 2. CARREGAR (COM POP-UP BONITO) ---
if (btnCarregarNuvem) {
    btnCarregarNuvem.onclick = async () => {
        let nomeAlvo = document.getElementById('nome-char').value;

        // Se o campo estiver vazio, abre a CAIXINHA PRETA para digitar
        if (!nomeAlvo) {
            nomeAlvo = await RPG.prompt("Baixar Ficha", "Digite o nome do personagem para restaurar:");
        }

        // Se clicou em cancelar ou deixou vazio, para tudo
        if (!nomeAlvo) return;

        const textoOriginal = btnCarregarNuvem.innerHTML;
        btnCarregarNuvem.innerHTML = '<i class="ph ph-spinner mb-spin"></i> ...';

        try {
            // Busca no servidor
            const resp = await fetch(`/carregar-ficha/${nomeAlvo}?t=${Date.now()}`);
            
            if (resp.ok) {
                const dados = await resp.json();
                
                // PERGUNTA DE CONFIRMAÇÃO VISUAL
                const confirmou = await RPG.confirm(
                    "Ficha Encontrada", 
                    `Deseja substituir a ficha atual pela versão salva de "${dados['nome-char']}"?`
                );

                if (confirmou) {
                    // Lógica de Carregamento
                    if (typeof Memoria !== 'undefined') {
                        Memoria.clear();
                        Object.keys(dados).forEach(k => Memoria.setItem(k, dados[k]));
                    } else {
                        localStorage.clear();
                        Object.keys(dados).forEach(k => localStorage.setItem(k, dados[k]));
                    }
                    location.reload();
                }
            } else {
                // ERRO: NÃO ACHOU
                await RPG.alert("Não Encontrado", `Não existe nenhum arquivo "${nomeAlvo}.json" na pasta dados.`);
            }
        } catch (e) {
            console.error(e);
            await RPG.alert("Erro", "Erro ao conectar com o servidor.");
        } finally {
            btnCarregarNuvem.innerHTML = textoOriginal;
        }
    };
}

// ==================================================================
// 12. FOTO DE PERFIL & UTILITÁRIOS
// ==================================================================

const inputFoto = document.getElementById('input-foto-char');
const imgFoto = document.getElementById('char-foto');

// Carregar
const fotoSalva = Memoria.getItem('foto-personagem');
if (fotoSalva && imgFoto) imgFoto.src = fotoSalva;

// Salvar (Upload)
if (inputFoto) {
    inputFoto.addEventListener('change', (e) => {
        const arquivo = e.target.files[0];
        if (!arquivo) return;

        if (arquivo.size > 2 * 1024 * 1024) return alert("Imagem muito grande (Max 2MB).");

        const leitor = new FileReader();
        leitor.onload = (evt) => {
            imgFoto.src = evt.target.result;
            Memoria.setItem('foto-personagem', evt.target.result);
        };
        leitor.readAsDataURL(arquivo);
    });
}

// Utilitário de Hash (Usado na aba Secret)
function gerarHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Converte para 32bit integer
    }
    return hash.toString();
}

// ==================================================================
// 15. SISTEMA DE EDITAR MÁXIMOS (Refatorado)
// ==================================================================

const uiMax = {
    modal: document.getElementById('modal-maximos'),
    btns: {
        open: document.getElementById('btn-edit-maximos'),
        save: document.getElementById('btn-salvar-max'),
        close: document.getElementById('btn-cancelar-max')
    },
    // Configuração dos campos: ID do Input, ID do Texto na Ficha, Chave na Memória, Valor Padrão
    campos: [
        { id: 'pv', input: 'edit-pv-max', display: 'pv-max', mem: 'max-pv', def: '20' },
        { id: 'san', input: 'edit-san-max', display: 'san-max', mem: 'max-san', def: '20' },
        { id: 'pe', input: 'edit-pe-max', display: 'pe-max', mem: 'max-pe', def: '5' },
        { id: 'ar', input: 'edit-ar-max', display: 'ar-max', mem: 'max-ar', def: '10' },
        { id: 'esp', input: 'edit-esp-max', display: 'esp-max', mem: 'max-esp', def: '20' }
    ]
};

// 1. Abrir Modal (Carrega dados)
uiMax.btns.open.addEventListener('click', () => {
    uiMax.modal.classList.remove('escondido');
    uiMax.campos.forEach(c => {
        const input = document.getElementById(c.input);
        if (input) input.value = Memoria.getItem(c.mem) || c.def;
    });
});

// 2. Salvar (Grava e Atualiza)
uiMax.btns.save.addEventListener('click', () => {
    uiMax.campos.forEach(c => {
        const input = document.getElementById(c.input);
        if (input) Memoria.setItem(c.mem, input.value);
    });
    atualizarDisplayMaximos();
    uiMax.modal.classList.add('escondido');
});

uiMax.btns.close.addEventListener('click', () => uiMax.modal.classList.add('escondido'));

// 3. Atualizar Tela (Exportada para usar no inicio)
function atualizarDisplayMaximos() {
    uiMax.campos.forEach(c => {
        const el = document.getElementById(c.display);
        if (el) el.innerText = Memoria.getItem(c.mem) || c.def;
    });
}
atualizarDisplayMaximos();


// ==================================================================
// 17. SISTEMA SECRET: ÁRVORE E HABILIDADES
// ==================================================================

const uiTree = {
    container: document.getElementById('secret-container'),
    areaNodes: document.getElementById('skill-nodes-area'),
    areaRoots: document.getElementById('skill-roots'), // SVG
    masterNode: document.getElementById('master-node'),
    masterImg: document.getElementById('master-symbol-img'),
    // Modal Skill
    modal: document.getElementById('modal-skill-card'),
    card: {
        img: document.getElementById('card-skill-img'),
        title: document.getElementById('card-skill-title'),
        desc: document.getElementById('card-skill-desc'),
        btnLock: null, // Será criado dinamicamente se não existir
        btnClose: document.getElementById('btn-fechar-skill-card'),
        inputPass: document.getElementById('skill-pass-input'),
        areaLock: document.getElementById('skill-lock-area')
    }
};

// Garante que o botão de desbloqueio existe
if (!document.getElementById('btn-desbloquear-skill') && uiTree.modal) {
    const divBtns = uiTree.modal.querySelector('.modal-botoes') || uiTree.modal;
    const btn = document.createElement('button');
    btn.id = 'btn-desbloquear-skill';
    divBtns.prepend(btn); // Adiciona no começo
}
uiTree.card.btnLock = document.getElementById('btn-desbloquear-skill');

// Estado Local
let skillsCompradas = [];
let skillFocada = null;

// --- MATEMÁTICA: CURVAS DE BÉZIER (Raízes) ---
const gerarCurva = (destX, destY) => {
    const [startX, startY] = [50, 50]; // Centro
    const rnd = () => (Math.random() - 0.5) * 15; // Variação orgânica
    
    // Pontos de controle para suavizar a curva
    const cp1x = startX + (destX - startX) * 0.4 + rnd();
    const cp1y = startY + (destY - startY) * 0.4 + rnd();
    const cp2x = startX + (destX - startX) * 0.6 + rnd();
    const cp2y = startY + (destY - startY) * 0.6 + rnd();

    return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${destX} ${destY}`;
};

// --- RENDERIZAÇÃO PRINCIPAL ---
function carregarAbaSecreta() {
    // Busca o nome digitado na ficha
    const nomeInput = document.getElementById('nome-char');
    const nome = nomeInput ? nomeInput.value : '';
    
    // Se a variável PERSONAGENS não existir, cria um objeto vazio para não travar
    const listaPersonagens = (typeof PERSONAGENS !== 'undefined') ? PERSONAGENS : {};
    const dados = listaPersonagens[nome];

    // Tema Dracomante (Vermelho)
    if (uiTree.container) {
        uiTree.container.classList.toggle('theme-red', nome === 'Drakon');
    }

    // Carrega progresso
    skillsCompradas = JSON.parse(Memoria.getItem('skills-unlocked')) || [];

    // 1. Renderiza Origem (Centro)
    if (dados?.origin) {
        uiTree.masterImg.src = dados.origin.img;
        uiTree.masterNode.onclick = () => abrirModalSkill(dados.origin, true);
        uiTree.masterNode.style.display = 'flex';
    } else {
        // Se não tiver personagem especial, esconde o losango central
        if(uiTree.masterNode) uiTree.masterNode.style.display = 'none';
    }

    // 2. Limpa e Valida
    if (uiTree.areaNodes) uiTree.areaNodes.innerHTML = '';
    if (uiTree.areaRoots) uiTree.areaRoots.innerHTML = '';
    
    // Se não tiver dados de skills, para por aqui (não trava o site)
    if (!dados?.skills) return;

    // 3. Renderiza Skills (Nós + Raízes)
    dados.skills.forEach(skill => {
        const unlocked = skillsCompradas.includes(skill.id);

        // A. Cria a Raiz (SVG Path)
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", gerarCurva(skill.pos.x, skill.pos.y));
        path.classList.add("root-line");
        
        if (unlocked) {
            path.style.stroke = nome === 'Drakon' ? '#c70000' : '#ff9900';
            path.style.strokeDasharray = "0"; 
            path.style.filter = `drop-shadow(0 0 5px ${path.style.stroke})`;
            path.style.zIndex = "2";
        } else {
            path.style.stroke = "#444";
            path.style.strokeDasharray = "8, 4"; 
            path.style.opacity = "0.5";
        }
        uiTree.areaRoots.appendChild(path);

        // B. Cria o Nó (Planeta/Bolinha)
        const node = document.createElement('div');
        node.className = `skill-node ${unlocked ? 'unlocked' : ''}`;
        node.style.left = `${skill.pos.x}%`;
        node.style.top = `${skill.pos.y}%`;
        node.innerHTML = `<i class="ph ${skill.icone}"></i>`;
        
        node.onclick = () => abrirModalSkill(skill, false);
        
        const destino = uiTree.areaNodes || uiTree.container.querySelector('.skill-tree-wrapper');
        destino.appendChild(node);
    });
}

// --- INTERAÇÃO: MODAL DE HABILIDADE ---
function abrirModalSkill(skill, isOrigin) {
    skillFocada = skill;
    uiTree.modal.classList.remove('escondido');
    
    // Preenche dados básicos
    uiTree.card.title.innerText = isOrigin ? skill.titulo : skill.nome;
    uiTree.card.img.style.display = skill.img ? 'block' : 'none';
    if(skill.img) uiTree.card.img.src = skill.img;

    const unlocked = isOrigin || skillsCompradas.includes(skill.id);

    if (unlocked) {
        // MODO LEITURA (Já tem a skill)
        uiTree.card.desc.innerText = skill.desc;
        uiTree.card.desc.classList.remove('bloqueado');
        uiTree.card.areaLock.style.display = 'none';
        
        // Botão Verde/Desativado
        estilizarBotaoLock(true);

    } else {
        // MODO MISTÉRIO (Bloqueado)
        uiTree.card.desc.innerText = "Esta informação está selada. Quebre o selo para ler.";
        uiTree.card.desc.classList.add('bloqueado'); // Efeito Blur
        uiTree.card.areaLock.style.display = 'block';
        
        // Reset Input
        uiTree.card.inputPass.value = '';
        uiTree.card.inputPass.focus();

        // Botão Vermelho/Ação
        estilizarBotaoLock(false);
    }
}

function estilizarBotaoLock(jaPossui) {
    const btn = uiTree.card.btnLock;
    if (jaPossui) {
        btn.innerText = "Habilidade Desperta";
        btn.disabled = true;
        btn.style.cssText = "background: #1a3300; color: #4dff88; border: 1px solid #4dff88;";
        btn.style.display = skillFocada.titulo ? 'none' : 'block'; // Esconde se for Origem
    } else {
        btn.innerText = "QUEBRAR SELO";
        btn.disabled = false;
        btn.style.cssText = "background: #c00; color: #fff; border: 1px solid #f00;";
    }
}

// Ação de Desbloqueio
if (uiTree.card.btnLock) {
    uiTree.card.btnLock.onclick = () => {
        if (!skillFocada) return;

        const attempt = uiTree.card.inputPass.value.trim();
        
        // Verifica Hash
        if (gerarHash(attempt) === skillFocada.hash) {
            alert("O selo se rompe!");
            skillsCompradas.push(skillFocada.id);
            Memoria.setItem('skills-unlocked', JSON.stringify(skillsCompradas));
            
            uiTree.modal.classList.add('escondido');
            carregarAbaSecreta(); // Redesenha a árvore com linhas acesas
        } else {
            // Erro Visual
            const input = uiTree.card.inputPass;
            input.style.borderColor = "red";
            input.classList.add('erro-animacao');
            setTimeout(() => {
                input.classList.remove('erro-animacao');
                input.style.borderColor = ""; // Volta ao original (definido no CSS)
            }, 500);
        }
    };
}

// Fechar Modal
const fecharSkill = () => uiTree.modal.classList.add('escondido');
uiTree.card.btnClose.onclick = fecharSkill;

// Atalho Enter na Senha
uiTree.card.inputPass.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !uiTree.card.btnLock.disabled) {
        uiTree.card.btnLock.click();
    }
});

// Gatilho do Menu (Recarrega árvore ao clicar na aba)
document.getElementById('btn-menu-secret')?.addEventListener('click', () => {
    setTimeout(carregarAbaSecreta, 100);
});

// Inicialização de teste
setTimeout(carregarAbaSecreta, 500);

/* --- SISTEMA DE DEFESA (SALVAR/CARREGAR) --- */

const inputDefesa = document.getElementById('defesa-char');

// 1. Carregar o valor salvo (se existir) ao abrir a página
if (localStorage.getItem('defesa-char')) {
    inputDefesa.value = localStorage.getItem('defesa-char');
}

// 2. Salvar automaticamente toda vez que você mudar o número
if (inputDefesa) {
    inputDefesa.addEventListener('input', function() {
        localStorage.setItem('defesa-char', this.value);
    });
}

/* ==========================================================================
   10. CONFIGURAÇÕES VISUAIS (FONTE & SWITCHES)
   ========================================================================== */

// Função unificada para configurar switches
const setupSwitch = (idBotao, classeBody, chaveStorage) => {
    const toggle = document.getElementById(idBotao);
    if (!toggle) return;

    // Carregar
    const ativo = localStorage.getItem(chaveStorage) === 'true';
    if (ativo) {
        document.body.classList.add(classeBody);
        toggle.checked = true;
    }

    // Salvar
    toggle.addEventListener('change', () => {
        document.body.classList.toggle(classeBody, toggle.checked);
        localStorage.setItem(chaveStorage, toggle.checked);
    });
};

// Configuração em Lote
[
    ['check-legivel-dados', 'legivel-dados', 'pref-legivel-dados'],
    ['check-legivel-traumas', 'legivel-traumas', 'pref-legivel-traumas'],
    ['check-legivel-registro', 'legivel-registro', 'pref-legivel-registro'],
    ['check-legivel-bestiario', 'legivel-bestiario', 'pref-legivel-bestiario']
].forEach(conf => setupSwitch(...conf));


/* ==========================================================================
   LÓGICA DO BESTIÁRIO
   ========================================================================== */

// 1. Sistema de Busca (Filtro)
document.querySelector('.input-busca')?.addEventListener('input', function() {
    const termo = this.value.toLowerCase();
    document.querySelectorAll('.card-monstro').forEach(card => {
        const texto = card.innerText.toLowerCase();
        card.style.display = texto.includes(termo) ? 'flex' : 'none';
    });
});

// 2. Botão Adicionar Monstro (Rápido)
const btnAddMonstro = document.querySelector('.btn-add-monstro');
const gridMonstros = document.querySelector('.grid-monstros');

if (btnAddMonstro && gridMonstros) {
    btnAddMonstro.addEventListener('click', () => {
        const novoCard = document.createElement('div');
        novoCard.className = 'card-monstro';
        novoCard.style.opacity = '0';
        
        novoCard.innerHTML = `
            <div class="monstro-img-placeholder"><i class="ph ph-question"></i></div>
            <div class="monstro-info">
                <h3 class="monstro-nome">Nova Criatura</h3>
                <p class="monstro-tipo">Desconhecido</p>
                <div class="monstro-stats"><span class="stat-tag vida">HP: ??</span><span class="stat-tag dano">Dano: ??</span></div>
            </div>`;

        gridMonstros.appendChild(novoCard);
        setTimeout(() => { novoCard.style.transition = 'opacity 0.5s'; novoCard.style.opacity = '1'; }, 10);
    });
}

// 3. Renderização do Bestiário (Dados do arquivo externo)
function renderizarBestiario() {
    if (!gridMonstros || typeof bestiarioData === 'undefined') return;
    console.log("Desenhando bestiário...");
    
    gridMonstros.innerHTML = '';
    
    bestiarioData.forEach(monstro => {
        const card = document.createElement('div');
        card.className = 'card-monstro';
        card.onclick = () => abrirDetalhesMonstro(monstro);

        const imagem = monstro.img ? `<img src="${monstro.img}" style="width:100%; height:100%; object-fit:cover;">` : '<i class="ph ph-skull"></i>';

        card.innerHTML = `
            <div class="monstro-img-placeholder">${imagem}</div>
            <div class="monstro-info">
                <h3 class="monstro-nome">${monstro.nome}</h3>
                <p class="monstro-tipo">${monstro.tipo}</p>
                <button class="btn-detalhes-card"><i class="ph ph-book-open-text"></i> Detalhes</button>
            </div>`;
        gridMonstros.appendChild(card);
    });
}

// 4. Modal de Detalhes
function abrirDetalhesMonstro(m) {
    const modal = document.getElementById('modal-bestiario-detalhes');
    if (!modal) return;

    // Preenche Textos
    const setTxt = (id, txt) => document.getElementById(id).textContent = txt || "---";
    setTxt('livro-titulo', m.nome);
    setTxt('livro-desc', m.desc);
    setTxt('livro-fraquezas', m.fraquezas);
    setTxt('livro-habilidades', m.habilidades);
    setTxt('livro-dadivas', m.dadivas);
    document.getElementById('livro-tipo').innerHTML = m.tipo; // HTML para suportar cores

    // Preenche Imagem
    const imgElem = document.getElementById('livro-img');
    const iconElem = document.querySelector('.livro-icon-fallback');
    
    if (m.img) {
        imgElem.src = m.img;
        imgElem.style.display = 'block';
        if(iconElem) iconElem.style.display = 'none';
    } else {
        imgElem.style.display = 'none';
        if(iconElem) iconElem.style.display = 'flex';
    }

    modal.classList.remove('escondido');
}

const fecharModalBestiario = () => document.getElementById('modal-bestiario-detalhes')?.classList.add('escondido');

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderizarBestiario === 'function') renderizarBestiario();
});


/* ==========================================================================
   SISTEMA DE NAVEGAÇÃO UNIVERSAL (GERENCIA TODAS AS ABAS)
   ========================================================================== */
const mapaNavegacao = {
    'btn-menu-ficha': 'ficha-container',
    'btn-menu-inventario': 'inventario-container',
    'btn-menu-magias': 'magias-container',
    'btn-menu-bestiario': 'aba-bestiario',
    'btn-menu-config': 'config-container',
    'btn-menu-secret': 'secret-container'
};

// 1. Puxa o elemento de áudio que você criou no HTML
const audioSecreto = document.getElementById('audio-secreto');

Object.keys(mapaNavegacao).forEach(btnId => {
    const btn = document.getElementById(btnId);
    const divId = mapaNavegacao[btnId];

    if (btn) {
        btn.addEventListener('click', function() {
            // Esconde todas as abas
            Object.values(mapaNavegacao).forEach(id => {
                const aba = document.getElementById(id);
                if (aba) aba.classList.add('escondido');
            });
            
            // Mostra a alvo
            const alvo = document.getElementById(divId);
            if (alvo) {
                alvo.classList.remove('escondido');
                alvo.style.opacity = '0';
                setTimeout(() => alvo.style.opacity = '1', 10);
            }

            // Atualiza Menu
            document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('ativo'));
            this.classList.add('ativo');

            // =========================================================
            // LÓGICA DO ÁUDIO DA ABA SECRETA
            // =========================================================
            if (audioSecreto) {
                if (divId === 'secret-container') {
                    // Se abriu a aba secreta, dá o play
                    audioSecreto.volume = 0.5; // Ajuste o volume (0.0 a 1.0)
                    
                    // O catch previne um erro caso o navegador bloqueie o som inicial
                    audioSecreto.play().catch(e => console.log("Áudio bloqueado temporariamente:", e)); 
                } else {
                    // Se clicou em qualquer outra aba, pausa e zera o tempo
                    audioSecreto.pause();
                    audioSecreto.currentTime = 0; 
                }
            }
        });
    }
});


/* ==========================================================================
   BOTÃO DE RESET E SISTEMA RPG (MODALS)
   ========================================================================== */

// Botão Reset (Perigo)
const btnReset = document.getElementById('btn-resetar-tudo');
if (btnReset) {
    btnReset.addEventListener('click', async () => {
        if (await RPG.confirm("Cuidado!", "TEM CERTEZA? Isso vai apagar a ficha da tela (mas não apaga o arquivo salvo).")) {
            if (typeof Memoria !== 'undefined') Memoria.clear();
            localStorage.clear();
            location.reload();
        }
    });
}

// Sistema Visual (Alert/Confirm/Prompt Customizados)
const RPG = {
    alert: (titulo, msg) => new Promise(resolve => configurarModal(titulo, msg, 'alert', resolve)),
    confirm: (titulo, msg) => new Promise(resolve => configurarModal(titulo, msg, 'confirm', resolve)),
    prompt: (titulo, msg) => new Promise(resolve => configurarModal(titulo, msg, 'prompt', resolve))
};

function configurarModal(titulo, msg, tipo, resolve) {
    const el = {
        modal: document.getElementById('modal-sistema'),
        h3: document.getElementById('sistema-titulo'),
        p: document.getElementById('sistema-mensagem'),
        input: document.getElementById('sistema-input'),
        ok: document.getElementById('btn-sistema-ok'),
        cancel: document.getElementById('btn-sistema-cancel')
    };
    
    // Fallback de segurança se o HTML não existir
    if (!el.modal) return alert(msg);

    el.h3.textContent = titulo;
    el.p.textContent = msg;
    el.input.value = '';
    
    el.input.classList.toggle('escondido', tipo !== 'prompt');
    el.cancel.classList.toggle('escondido', tipo === 'alert');
    el.ok.textContent = tipo === 'alert' ? "Entendido" : "Confirmar";

    if (tipo === 'prompt') setTimeout(() => el.input.focus(), 100);

    el.modal.classList.remove('escondido');

    // Remove listeners antigos clonando os botões
    const novoOk = el.ok.cloneNode(true);
    const novoCancel = el.cancel.cloneNode(true);
    el.ok.parentNode.replaceChild(novoOk, el.ok);
    el.cancel.parentNode.replaceChild(novoCancel, el.cancel);

    novoOk.onclick = () => { el.modal.classList.add('escondido'); resolve(tipo === 'prompt' ? el.input.value : true); };
    novoCancel.onclick = () => { el.modal.classList.add('escondido'); resolve(tipo === 'prompt' ? null : false); };
    
    if (tipo === 'prompt') el.input.onkeydown = (e) => { if (e.key === 'Enter') novoOk.click(); };
}


/* ==========================================================================
   EFEITO: PALAVRAS ASSOMBRADAS (ABA SECRET)
   ========================================================================== */

// 1. A sua lista de palavras (pode adicionar quantas quiser)
const palavrasMacabras = [
    "Sofrimento", "Dor", "Fome", "Vazio", "Sangue", 
    "Escuridão", "Ninguém escapa", "selo", "Correntes", 
    "Frio", "Estamos aqui", "Culpado", "Desespero",
    "Alma", "Socorro", "Perdão", "Quebre", "Liberte-se",
    "Morra", "Medo", "Ganância", "Agonia", "Terror",
    "Pânico", "Loucura", "Angústia", "Delírio", "Tormento",
    "Luto", "Rancor", "Paranóia", "Remorso", "Aflição",
    "Podridão", "Decadência", "Ossos", "Cinzas",
    "Carnificina", "Cicatriz", "Ferida aberta", "Veneno",
    "Cadáver", "Vermes", "Lâmina", "Mutilação", "Vísceras",
    "Putrefação", "Abismo", "Maldição", "Sombras", "Pesadelo",
    "Pacto", "Sacrifício", "Ritual", "Profanação", "Pecado",
    "Ruína", "Devastação", "Silêncio absoluto", "Oculto",
    "Rasgue", "Rasteje", "Devore", "Sufoque", "Apodreça",
    "Espreite", "Condene", "Enterre", "Ajoelhe-se", "Chore",
    "Padeça", "Nâo olhe para trás", "Ele está vindo",
    "É tarde demais", "Ouça os gritos", "Fique conosco",
    "Tudo queima", "Não há saída", "Feche os olhos",
    "Eles sabem o que você fez", "Apenas ceda", "A carne é fraca",
    "Sua mente nos pertence", "GRITE POR AJUDA", "Sem salvação",
    "Abandone suas esperanças", "Mentiroso"
];

const spawnPalavraAssombrada = () => {
    const container = document.getElementById('container-palavras-assombradas');
    const abaSecret = document.getElementById('secret-container');
    
    // Trava de segurança: Só cria palavras se a aba Secret estiver aberta/visível
    if (!container || !abaSecret || abaSecret.classList.contains('escondido')) return;

    // Cria o elemento da palavra
    const palavra = document.createElement('span');
    palavra.className = 'palavra-assombrada';
    
    // Sorteia a palavra
    palavra.textContent = palavrasMacabras[Math.floor(Math.random() * palavrasMacabras.length)];

    // =========================================================
    // VOLTAMOS PARA A MATEMÁTICA SIMPLES (ESPALHAR POR TUDO)
    // =========================================================
    // Sorteia a posição (entre 5% e 95% da tela para um espalhamento total)
    palavra.style.left = Math.floor(Math.random() * 90 + 5) + '%';
    palavra.style.top = Math.floor(Math.random() * 90 + 5) + '%';
    
    // Sorteia um tamanho (sensação de profundidade)
    palavra.style.fontSize = (Math.random() * 2 + 2) + 'rem'; // Entre 1.5rem e 3rem

    // Adiciona na tela
    container.appendChild(palavra);

    // Lógica do Fade-In e Fade-Out (Igual antes)
    setTimeout(() => {
        palavra.style.opacity = (Math.random() * 0.4 + 0.3).toFixed(1); 
    }, 100);

    setTimeout(() => {
        palavra.style.opacity = '0'; 
        setTimeout(() => palavra.remove(), 2000); 
    }, 3000 + Math.random() * 3000); 
};

// Dispara o criador de palavras a cada 2 segundos
setInterval(spawnPalavraAssombrada, 2000);