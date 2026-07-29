const token = localStorage.getItem("serviceflow_token");

const URL_DASHBOARD = "http://localhost:8080/dashboard";

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

const menuButton = document.getElementById("menu-button");
const closeSidebarButton =
    document.getElementById("close-sidebar");

const logoutButton =
    document.getElementById("logout-button");

const userName =
    document.getElementById("user-name");

const userRole =
    document.getElementById("user-role");

const userAvatar =
    document.getElementById("user-avatar");

const welcomeTitle =
    document.getElementById("welcome-title");

const totalClientes =
    document.getElementById("total-clientes");

const chamadosAbertos =
    document.getElementById("chamados-abertos");

const chamadosAndamento =
    document.getElementById("chamados-andamento");

const ordensFinalizadas =
    document.getElementById("ordens-finalizadas");

const recentTickets =
    document.getElementById("recent-tickets");

const recentOrders =
    document.getElementById("recent-orders");

const dashboardMessage =
    document.getElementById("dashboard-message");


iniciarDashboard();


function iniciarDashboard() {

    protegerPagina();

    configurarEventos();

    carregarUsuarioSalvo();

    carregarDashboard();
}


function protegerPagina() {

    if (!token) {

        window.location.href =
            "../../login.html";
    }
}


function configurarEventos() {

    menuButton.addEventListener(
        "click",
        abrirMenu
    );

    closeSidebarButton.addEventListener(
        "click",
        fecharMenu
    );

    sidebarOverlay.addEventListener(
        "click",
        fecharMenu
    );

    logoutButton.addEventListener(
        "click",
        realizarLogout
    );
}


function abrirMenu() {

    sidebar.classList.add("open");

    sidebarOverlay.classList.add("active");
}


function fecharMenu() {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("active");
}


function realizarLogout() {

    limparDadosDeAutenticacao();

    window.location.href =
        "../../login.html";
}


function limparDadosDeAutenticacao() {

    localStorage.removeItem(
        "serviceflow_token"
    );

    localStorage.removeItem(
        "serviceflow_usuario"
    );
}


function carregarUsuarioSalvo() {

    const usuarioSalvo =
        localStorage.getItem(
            "serviceflow_usuario"
        );

    if (!usuarioSalvo) {

        userName.textContent = "Usuário";

        userRole.textContent = "ServiceFlow";

        userAvatar.textContent = "U";

        return;
    }

    try {

        const usuario =
            JSON.parse(usuarioSalvo);

        const nome =
            usuario.nome || "Usuário";

        const cargo =
            usuario.cargo
                ? formatarTexto(usuario.cargo)
                : "ServiceFlow";

        userName.textContent = nome;

        userRole.textContent = cargo;

        userAvatar.textContent =
            nome.charAt(0).toUpperCase();

        welcomeTitle.textContent =
            `Bem-vindo, ${obterPrimeiroNome(nome)}!`;

    } catch (erro) {

        localStorage.removeItem(
            "serviceflow_usuario"
        );
    }
}


async function carregarDashboard() {

    limparMensagem();

    mostrarCarregamento();

    try {

        const resposta = await fetch(
            URL_DASHBOARD,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`,

                    "Accept":
                        "application/json"
                }
            }
        );

        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            limparDadosDeAutenticacao();

            window.location.href =
                "../../login.html";

            return;
        }

        const dados =
            await lerResposta(resposta);

        if (!resposta.ok) {

            const mensagemErro =
                dados.mensagem ||
                dados.erro ||
                "Não foi possível carregar o dashboard.";

            throw new Error(mensagemErro);
        }

        atualizarResumo(dados);

        renderizarChamados(
            dados.ultimosChamados || []
        );

        renderizarOrdens(
            dados.ultimasOrdens || []
        );

    } catch (erro) {

        zerarResumo();

        renderizarChamados([]);

        renderizarOrdens([]);

        mostrarErro(
            erro.message ||
            "Não foi possível conectar ao servidor."
        );
    }
}


function atualizarResumo(dados) {

    totalClientes.textContent =
        dados.clientes ?? 0;

    chamadosAbertos.textContent =
        dados.chamadosAbertos ?? 0;

    chamadosAndamento.textContent =
        dados.chamadosEmAndamento ?? 0;

    ordensFinalizadas.textContent =
        dados.ordensFinalizadas ?? 0;
}


function zerarResumo() {

    totalClientes.textContent = "0";

    chamadosAbertos.textContent = "0";

    chamadosAndamento.textContent = "0";

    ordensFinalizadas.textContent = "0";
}


function mostrarCarregamento() {

    totalClientes.textContent = "...";

    chamadosAbertos.textContent = "...";

    chamadosAndamento.textContent = "...";

    ordensFinalizadas.textContent = "...";

    recentTickets.innerHTML = `
        <tr>
            <td
                colspan="4"
                class="empty-table"
            >
                Carregando chamados...
            </td>
        </tr>
    `;

    recentOrders.innerHTML = `
        <div class="empty-list">
            Carregando ordens...
        </div>
    `;
}


function renderizarChamados(chamados) {

    if (!Array.isArray(chamados)) {

        chamados = [];
    }

    if (chamados.length === 0) {

        recentTickets.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="empty-table"
                >
                    Nenhum chamado encontrado.
                </td>
            </tr>
        `;

        return;
    }

    recentTickets.innerHTML =
        chamados
            .map((chamado) => {

                const titulo =
                    chamado.titulo ||
                    "Sem título";

                const cliente =
                    chamado.clienteNome ||
                    chamado.nomeCliente ||
                    chamado.cliente ||
                    "Cliente não informado";

                const prioridade =
                    chamado.prioridade ||
                    "BAIXA";

                const status =
                    chamado.status ||
                    "ABERTO";

                return `
                    <tr>

                        <td>
                            ${escaparHtml(titulo)}
                        </td>

                        <td>
                            ${escaparHtml(cliente)}
                        </td>

                        <td>

                            <span
                                class="
                                    priority-badge
                                    ${obterClassePrioridade(
                                        prioridade
                                    )}
                                "
                            >
                                ${formatarTexto(prioridade)}
                            </span>

                        </td>

                        <td>

                            <span
                                class="
                                    status-badge
                                    ${obterClasseStatus(status)}
                                "
                            >
                                ${formatarTexto(status)}
                            </span>

                        </td>

                    </tr>
                `;
            })
            .join("");
}


function renderizarOrdens(ordens) {

    if (!Array.isArray(ordens)) {

        ordens = [];
    }

    if (ordens.length === 0) {

        recentOrders.innerHTML = `
            <div class="empty-list">
                Nenhuma ordem encontrada.
            </div>
        `;

        return;
    }

    recentOrders.innerHTML =
        ordens
            .map((ordem) => {

                const numero =
                    ordem.numero ||
                    "Número não informado";

                const cliente =
                    ordem.clienteNome ||
                    ordem.nomeCliente ||
                    ordem.cliente ||
                    "Cliente não informado";

                const status =
                    ordem.status ||
                    "ABERTA";

                return `
                    <div class="order-item">

                        <div class="order-item-header">

                            <span class="order-number">
                                ${escaparHtml(numero)}
                            </span>

                            <span
                                class="
                                    status-badge
                                    ${obterClasseStatus(status)}
                                "
                            >
                                ${formatarTexto(status)}
                            </span>

                        </div>

                        <p class="order-client">
                            ${escaparHtml(cliente)}
                        </p>

                    </div>
                `;
            })
            .join("");
}


function obterClasseStatus(status) {

    const classes = {
        ABERTO: "status-open",
        ABERTA: "status-open",

        EM_ANDAMENTO:
            "status-progress",

        AGUARDANDO_CLIENTE:
            "status-progress",

        EM_EXECUCAO:
            "status-progress",

        CONCLUIDO:
            "status-finished",

        FINALIZADA:
            "status-finished",

        CANCELADO:
            "status-cancelled",

        CANCELADA:
            "status-cancelled"
    };

    return classes[status] ||
        "status-open";
}


function obterClassePrioridade(
    prioridade
) {

    const classes = {
        BAIXA: "priority-low",
        MEDIA: "priority-medium",
        ALTA: "priority-high",
        URGENTE: "priority-high"
    };

    return classes[prioridade] ||
        "priority-low";
}


function formatarTexto(texto) {

    if (!texto) {
        return "";
    }

    return String(texto)
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (letra) =>
                letra.toUpperCase()
        );
}


function obterPrimeiroNome(
    nomeCompleto
) {

    return nomeCompleto
        .trim()
        .split(" ")[0];
}


function mostrarErro(mensagem) {

    dashboardMessage.textContent =
        mensagem;

    dashboardMessage.className =
        "dashboard-message error";
}


function limparMensagem() {

    dashboardMessage.textContent = "";

    dashboardMessage.className =
        "dashboard-message";
}


async function lerResposta(resposta) {

    const tipoConteudo =
        resposta.headers.get(
            "content-type"
        );

    if (
        tipoConteudo &&
        tipoConteudo.includes(
            "application/json"
        )
    ) {

        return await resposta.json();
    }

    const texto =
        await resposta.text();

    if (!texto) {
        return {};
    }

    return {
        mensagem: texto
    };
}


function escaparHtml(texto) {

    const elemento =
        document.createElement("div");

    elemento.textContent =
        String(texto ?? "");

    return elemento.innerHTML;
}