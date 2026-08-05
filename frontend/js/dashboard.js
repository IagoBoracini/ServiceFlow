const API_URL = "http://localhost:8080";
const URL_DASHBOARD = `${API_URL}/dashboard`;

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebar-overlay");

const menuButton =
    document.getElementById("menu-button");

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


document.addEventListener(
    "DOMContentLoaded",
    iniciarDashboard
);


function iniciarDashboard() {
    const token =
        obterToken();

    if (!token) {
        redirecionarParaLogin();
        return;
    }

    configurarEventos();
    carregarUsuarioSalvo();
    carregarDashboard();
}


function obterToken() {
    return localStorage.getItem(
        "serviceflow_token"
    );
}


function configurarEventos() {
    if (menuButton) {
        menuButton.addEventListener(
            "click",
            abrirMenu
        );
    }

    if (closeSidebarButton) {
        closeSidebarButton.addEventListener(
            "click",
            fecharMenu
        );
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener(
            "click",
            fecharMenu
        );
    }

    if (logoutButton) {
        logoutButton.addEventListener(
            "click",
            realizarLogout
        );
    }

    window.addEventListener(
        "resize",
        verificarTamanhoTela
    );

    document.addEventListener(
        "keydown",
        fecharMenuComEscape
    );
}


function abrirMenu() {
    if (sidebar) {
        sidebar.classList.add(
            "open"
        );
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.add(
            "active"
        );
    }

    document.body.style.overflow =
        "hidden";
}


function fecharMenu() {
    if (sidebar) {
        sidebar.classList.remove(
            "open"
        );
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove(
            "active"
        );
    }

    document.body.style.overflow =
        "";
}


function verificarTamanhoTela() {
    if (window.innerWidth > 800) {
        fecharMenu();
    }
}


function fecharMenuComEscape(evento) {
    if (evento.key !== "Escape") {
        return;
    }

    fecharMenu();
}


function realizarLogout() {
    limparDadosDeAutenticacao();
    redirecionarParaLogin();
}


function limparDadosDeAutenticacao() {
    localStorage.removeItem(
        "serviceflow_token"
    );

    localStorage.removeItem(
        "serviceflow_usuario"
    );
}


function redirecionarParaLogin() {
    window.location.href =
        "../login.html";
}


function carregarUsuarioSalvo() {
    const usuarioSalvo =
        localStorage.getItem(
            "serviceflow_usuario"
        );

    if (!usuarioSalvo) {
        definirUsuarioPadrao();
        return;
    }

    try {
        const usuario =
            JSON.parse(usuarioSalvo);

        const nome =
            usuario.nome ||
            "Usuário";

        const cargo =
            formatarCargo(
                usuario.cargo
            );

        atualizarInformacoesUsuario(
            nome,
            cargo
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar usuário salvo:",
            erro
        );

        localStorage.removeItem(
            "serviceflow_usuario"
        );

        definirUsuarioPadrao();
    }
}


function definirUsuarioPadrao() {
    atualizarInformacoesUsuario(
        "Usuário",
        "ServiceFlow"
    );
}


function atualizarInformacoesUsuario(
    nome,
    cargo
) {
    const nomeValido =
        String(
            nome || "Usuário"
        ).trim() || "Usuário";

    if (userName) {
        userName.textContent =
            nomeValido;
    }

    if (userRole) {
        userRole.textContent =
            cargo || "ServiceFlow";
    }

    if (userAvatar) {
        userAvatar.textContent =
            obterInicialUsuario(
                nomeValido
            );
    }

    if (welcomeTitle) {
        welcomeTitle.textContent =
            `Bem-vindo, ${obterPrimeiroNome(nomeValido)}!`;
    }
}


function obterInicialUsuario(nome) {
    const nomeNormalizado =
        String(nome || "")
            .trim();

    if (!nomeNormalizado) {
        return "U";
    }

    return nomeNormalizado
        .charAt(0)
        .toUpperCase();
}


function formatarCargo(cargo) {
    const cargos = {
        ADMIN: "Administrador",
        ATENDENTE: "Atendente",
        TECNICO: "Técnico"
    };

    if (!cargo) {
        return "ServiceFlow";
    }

    return cargos[cargo] ||
        formatarTexto(cargo);
}


async function carregarDashboard() {
    limparMensagem();
    mostrarCarregamento();

    const token =
        obterToken();

    try {
        const resposta = await fetch(
            URL_DASHBOARD,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const dados =
            await lerResposta(
                resposta
            );

        if (resposta.status === 401) {
            limparDadosDeAutenticacao();
            redirecionarParaLogin();
            return;
        }

        if (resposta.status === 403) {
            throw new Error(
                dados.mensagem ||
                dados.message ||
                "Você não possui permissão para acessar o dashboard."
            );
        }

        if (!resposta.ok) {
            throw new Error(
                obterMensagemErro(
                    dados
                )
            );
        }

        atualizarResumo(
            dados
        );

        renderizarChamados(
            dados.ultimosChamados ||
            []
        );

        renderizarOrdens(
            dados.ultimasOrdens ||
            []
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

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
    atualizarTextoElemento(
        totalClientes,
        dados.clientes ??
        dados.totalClientes ??
        0
    );

    atualizarTextoElemento(
        chamadosAbertos,
        dados.chamadosAbertos ??
        0
    );

    atualizarTextoElemento(
        chamadosAndamento,
        dados.chamadosEmAndamento ??
        0
    );

    atualizarTextoElemento(
        ordensFinalizadas,
        dados.ordensFinalizadas ??
        0
    );
}


function zerarResumo() {
    atualizarTextoElemento(
        totalClientes,
        0
    );

    atualizarTextoElemento(
        chamadosAbertos,
        0
    );

    atualizarTextoElemento(
        chamadosAndamento,
        0
    );

    atualizarTextoElemento(
        ordensFinalizadas,
        0
    );
}


function mostrarCarregamento() {
    atualizarTextoElemento(
        totalClientes,
        "..."
    );

    atualizarTextoElemento(
        chamadosAbertos,
        "..."
    );

    atualizarTextoElemento(
        chamadosAndamento,
        "..."
    );

    atualizarTextoElemento(
        ordensFinalizadas,
        "..."
    );

    if (recentTickets) {
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
    }

    if (recentOrders) {
        recentOrders.innerHTML = `
            <div class="empty-list">
                Carregando ordens...
            </div>
        `;
    }
}


function atualizarTextoElemento(
    elemento,
    valor
) {
    if (elemento) {
        elemento.textContent =
            valor;
    }
}


function renderizarChamados(chamados) {
    if (!recentTickets) {
        return;
    }

    const listaChamados =
        Array.isArray(chamados)
            ? chamados
            : [];

    if (listaChamados.length === 0) {
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
        listaChamados
            .map(chamado => {
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

                const tecnico =
                    chamado.tecnicoNome ||
                    chamado.tecnicoResponsavelNome ||
                    "Não atribuído";

                const data =
                    formatarData(
                        chamado.dataAbertura
                    );

                const informacoes =
                    `${tecnico} · ${data}`;

                return `
                    <tr>

                        <td>
                            <strong>
                                ${escaparHtml(titulo)}
                            </strong>

                            <div class="secondary-information">
                                ${escaparHtml(informacoes)}
                            </div>
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
                                ${escaparHtml(
                                    formatarTexto(
                                        prioridade
                                    )
                                )}
                            </span>
                        </td>

                        <td>
                            <span
                                class="
                                    status-badge
                                    ${obterClasseStatus(
                                        status
                                    )}
                                "
                            >
                                ${escaparHtml(
                                    formatarTexto(
                                        status
                                    )
                                )}
                            </span>
                        </td>

                    </tr>
                `;
            })
            .join("");
}


function renderizarOrdens(ordens) {
    if (!recentOrders) {
        return;
    }

    const listaOrdens =
        Array.isArray(ordens)
            ? ordens
            : [];

    if (listaOrdens.length === 0) {
        recentOrders.innerHTML = `
            <div class="empty-list">
                Nenhuma ordem encontrada.
            </div>
        `;

        return;
    }

    recentOrders.innerHTML =
        listaOrdens
            .map(ordem => {
                const numero =
                    ordem.numero ||
                    "Número não informado";

                const cliente =
                    ordem.clienteNome ||
                    ordem.nomeCliente ||
                    ordem.cliente ||
                    "Cliente não informado";

                const chamado =
                    ordem.chamadoTitulo ||
                    "Chamado não informado";

                const tecnico =
                    ordem.tecnicoNome ||
                    ordem.tecnicoResponsavelNome ||
                    "Técnico não informado";

                const status =
                    ordem.status ||
                    "ABERTA";

                const data =
                    formatarData(
                        ordem.dataCriacao
                    );

                return `
                    <div class="order-item">

                        <div class="order-item-header">

                            <span class="order-number">
                                ${escaparHtml(numero)}
                            </span>

                            <span
                                class="
                                    status-badge
                                    ${obterClasseStatus(
                                        status
                                    )}
                                "
                            >
                                ${escaparHtml(
                                    formatarTexto(
                                        status
                                    )
                                )}
                            </span>

                        </div>

                        <p class="order-client">
                            ${escaparHtml(cliente)}
                        </p>

                        <p class="order-client">
                            ${escaparHtml(chamado)}
                        </p>

                        <p class="order-client">
                            ${escaparHtml(
                                `${tecnico} · ${data}`
                            )}
                        </p>

                    </div>
                `;
            })
            .join("");
}


function obterClasseStatus(status) {
    const classes = {
        ABERTO:
            "status-open",

        ABERTA:
            "status-open",

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
        BAIXA:
            "priority-low",

        MEDIA:
            "priority-medium",

        ALTA:
            "priority-high",

        CRITICA:
            "priority-critical",

        URGENTE:
            "priority-critical"
    };

    return classes[prioridade] ||
        "priority-low";
}


function formatarTexto(texto) {
    if (!texto) {
        return "-";
    }

    return String(texto)
        .toLowerCase()
        .replaceAll(
            "_",
            " "
        )
        .replace(
            /\b\w/g,
            letra =>
                letra.toUpperCase()
        );
}


function formatarData(valor) {
    if (!valor) {
        return "Data não informada";
    }

    const data =
        new Date(valor);

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return "Data não informada";
    }

    return data.toLocaleString(
        "pt-BR"
    );
}


function obterPrimeiroNome(
    nomeCompleto
) {
    const nome =
        String(
            nomeCompleto || ""
        ).trim();

    if (!nome) {
        return "Usuário";
    }

    return nome.split(
        /\s+/
    )[0];
}


function mostrarErro(mensagem) {
    if (!dashboardMessage) {
        return;
    }

    dashboardMessage.textContent =
        mensagem;

    dashboardMessage.className =
        "dashboard-message error";
}


function limparMensagem() {
    if (!dashboardMessage) {
        return;
    }

    dashboardMessage.textContent =
        "";

    dashboardMessage.className =
        "dashboard-message";
}


function obterMensagemErro(dados) {
    if (!dados) {
        return "Não foi possível carregar o dashboard.";
    }

    if (
        typeof dados === "string"
    ) {
        return dados;
    }

    if (dados.mensagem) {
        return dados.mensagem;
    }

    if (dados.message) {
        return dados.message;
    }

    if (dados.erro) {
        return dados.erro;
    }

    if (dados.error) {
        return dados.error;
    }

    if (
        dados.erros &&
        typeof dados.erros ===
            "object"
    ) {
        return Object.values(
            dados.erros
        ).join(" ");
    }

    return "Não foi possível carregar o dashboard.";
}


async function lerResposta(
    resposta
) {
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
        try {
            return await resposta.json();

        } catch (erro) {
            return {};
        }
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
        document.createElement(
            "div"
        );

    elemento.textContent =
        String(texto ?? "");

    return elemento.innerHTML;
}