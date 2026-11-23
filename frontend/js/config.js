// Configuração única do frontend.
// Para apontar para outro backend (ex.: ambiente local), altere apenas esta linha.
const API_URL = "http://localhost:8080";


// Rótulos legíveis (com acentos) para valores vindos da API.
const SF_ROTULOS = {
    EM_EXECUCAO: "Em execução",
    EM_ANDAMENTO: "Em andamento",
    AGUARDANDO_CLIENTE: "Aguardando cliente",
    CONCLUIDO: "Concluído",
    FINALIZADA: "Finalizada",
    MEDIA: "Média",
    TECNICO: "Técnico"
};

function sfRotulo(valor) {
    return SF_ROTULOS[String(valor || "").toUpperCase()] || null;
}
