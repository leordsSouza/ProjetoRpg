/* ==========================================================================
   BANCO DE DADOS: BESTIÁRIO
   Este arquivo contém apenas as informações das criaturas.
   ========================================================================== */

const bestiarioData = [
    {
        id: 1,
        nome: "Carniçal",
        tipo: "Morto-Vivo <br><span class='texto-vermelho'>Amaranthus</span>", 
        img: "img/Carnival.jpg", 
        habilidades: "Garras Infectas\nVisão no Escuro",
        dadivas: "Nenhuma.",
        desc: "Uma criatura decrépita que se alimenta de cadáveres. ",
        fraquezas: "Fogo causa dano dobrado."
    },
    {
        id: 2,
        nome: "Rato Gigante",
        tipo: "Animal <br><span class='texto-vermelho'>Amaranthus</span>",
        img: "", 
        habilidades: "Mordida: 1d4 de dano\nEnxame",
        dadivas: "Faro Aguçado.",
        desc: "Ratos mutantes crescidos nos esgotos.",
        fraquezas: "Medo de luz forte."
    },
];