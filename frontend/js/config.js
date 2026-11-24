// Configuração única do frontend.
// Local (localhost / 127.0.0.1 / arquivo): usa o back-end da sua máquina.
// Publicado (Vercel): usa o back-end do Railway. Para trocar, altere a URL abaixo.
const API_URL = ["localhost", "127.0.0.1", ""].includes(window.location.hostname)
    ? "http://localhost:8080"
    : "https://serviceflow-production-a083.up.railway.app";


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
