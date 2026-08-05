const API_URL = "https://serviceflow-production-a083.up.railway.app";

const tabelaFuncionarios =
    document.getElementById("tabelaFuncionarios");

const pesquisaFuncionario =
    document.getElementById("pesquisaFuncionario");

const filtroStatus =
    document.getElementById("filtroStatus");

const botaoLimparFiltros =
    document.getElementById("botaoLimparFiltros");

const quantidadeFuncionarios =
    document.getElementById("quantidadeFuncionarios");

const botaoSair =
    document.getElementById("botaoSair");

const botaoPendentes =
    document.getElementById("botaoPendentes");

const paginaAnterior =
    document.getElementById("paginaAnterior");

const proximaPagina =
    document.getElementById("proximaPagina");

const informacaoPagina =
    document.getElementById("informacaoPagina");

const userName =
    document.getElementById("user-name");

const userRole =
    document.getElementById("user-role");

const userAvatar =
    document.getElementById("user-avatar");

let funcionarios = [];

let paginaAtual = 0;
let totalPaginas = 0;

const tamanhoPagina = 10;


function iniciarPagina() {
    const token =
        localStorage.getItem("serviceflow_token");

    if (!token) {
        removerAutenticacao();
        return;
    }

    carregarUsuarioSalvo();
    listarFuncionarios();
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
            usuario.nome || "Usuário";

        userName.textContent =
            nome;

        userRole.textContent =
            formatarCargo(usuario.cargo);

        userAvatar.textContent =
            nome
                .charAt(0)
                .toUpperCase();

    } catch (erro) {
        console.error(
            "Erro ao carregar usuário:",
            erro
        );

        localStorage.removeItem(
            "serviceflow_usuario"
        );

        definirUsuarioPadrao();
    }
}


function definirUsuarioPadrao() {
    if (userName) {
        userName.textContent =
            "Usuário";
    }

    if (userRole) {
        userRole.textContent =
            "ServiceFlow";
    }

    if (userAvatar) {
        userAvatar.textContent =
            "U";
    }
}


async function listarFuncionarios() {
    const token =
        localStorage.getItem("serviceflow_token");

    if (!token) {
        removerAutenticacao();
        return;
    }

    mostrarCarregamento();

    try {
        const resposta = await fetch(
            `${API_URL}/funcionarios?pagina=${paginaAtual}&tamanho=${tamanhoPagina}`,
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

        if (resposta.status === 401) {
            removerAutenticacao();
            return;
        }

        if (resposta.status === 403) {
            mostrarMensagemTabela(
                "Você não possui permissão para visualizar a equipe."
            );

            desabilitarPaginacao();
            atualizarQuantidade(0);

            return;
        }

        const dados =
            await lerResposta(resposta);

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                dados.message ||
                "Não foi possível carregar os funcionários."
            );
        }

        funcionarios =
            dados.content || [];

        totalPaginas =
            dados.totalPages || 0;

        aplicarFiltros();
        atualizarPaginacao();

    } catch (erro) {
        console.error(
            "Erro ao carregar funcionários:",
            erro
        );

        mostrarMensagemTabela(
            erro.message ||
            "Erro ao carregar funcionários."
        );

        desabilitarPaginacao();
        atualizarQuantidade(0);
    }
}


function mostrarCarregamento() {
    tabelaFuncionarios.innerHTML = `
        <tr>
            <td
                colspan="5"
                class="loading-row"
            >
                Carregando funcionários...
            </td>
        </tr>
    `;
}


function mostrarMensagemTabela(mensagem) {
    tabelaFuncionarios.innerHTML = `
        <tr>
            <td
                colspan="5"
                class="loading-row"
            >
                ${escaparHtml(mensagem)}
            </td>
        </tr>
    `;
}


function mostrarFuncionarios(lista) {
    tabelaFuncionarios.innerHTML = "";

    atualizarQuantidade(lista.length);

    if (!lista || lista.length === 0) {
        mostrarMensagemTabela(
            "Nenhum funcionário encontrado."
        );

        return;
    }

    lista.forEach(funcionario => {
        const linha =
            document.createElement("tr");

        const botaoAcao =
            criarBotaoStatus(funcionario);

        const classeStatus =
            obterClasseStatus(
                funcionario.status
            );

        linha.innerHTML = `
            <td>
                ${escaparHtml(
                    funcionario.nome ?? "-"
                )}
            </td>

            <td>
                ${escaparHtml(
                    funcionario.email ?? "-"
                )}
            </td>

            <td>
                ${escaparHtml(
                    formatarCargo(
                        funcionario.cargo
                    )
                )}
            </td>

            <td>
                <span
                    class="status ${classeStatus}"
                >
                    ${escaparHtml(
                        formatarStatus(
                            funcionario.status
                        )
                    )}
                </span>
            </td>

            <td>
                ${botaoAcao}
            </td>
        `;

        tabelaFuncionarios.appendChild(
            linha
        );
    });
}


function formatarCargo(cargo) {
    if (!cargo) {
        return "ServiceFlow";
    }

    const cargos = {
        ADMIN: "Administrador",
        ATENDENTE: "Atendente",
        TECNICO: "Técnico"
    };

    return cargos[cargo] ||
        formatarTexto(cargo);
}


function formatarStatus(status) {
    if (!status) {
        return "-";
    }

    return formatarTexto(status);
}


function formatarTexto(texto) {
    return String(texto)
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            letra =>
                letra.toUpperCase()
        );
}


function obterClasseStatus(status) {
    const classes = {
        ATIVO: "status-ativo",
        INATIVO: "status-inativo",
        PENDENTE: "status-pendente"
    };

    return classes[status] || "";
}


function criarBotaoStatus(funcionario) {
    if (funcionario.status === "ATIVO") {
        return `
            <button
                type="button"
                class="botao-inativar"
                data-id="${funcionario.id}"
            >
                Inativar
            </button>
        `;
    }

    if (funcionario.status === "INATIVO") {
        return `
            <button
                type="button"
                class="botao-reativar"
                data-id="${funcionario.id}"
            >
                Reativar
            </button>
        `;
    }

    if (funcionario.status === "PENDENTE") {
        return `
            <span class="status status-pendente">
                Aguardando aprovação
            </span>
        `;
    }

    return "-";
}


function aplicarFiltros() {
    const textoPesquisado =
        pesquisaFuncionario.value
            .toLowerCase()
            .trim();

    const statusSelecionado =
        filtroStatus.value;

    const resultado =
        funcionarios.filter(funcionario => {
            const nome =
                funcionario.nome
                    ?.toLowerCase() ?? "";

            const email =
                funcionario.email
                    ?.toLowerCase() ?? "";

            const cargo =
                funcionario.cargo
                    ?.toLowerCase() ?? "";

            const status =
                funcionario.status
                    ?.toLowerCase() ?? "";

            const correspondePesquisa =
                textoPesquisado === "" ||
                nome.includes(textoPesquisado) ||
                email.includes(textoPesquisado) ||
                cargo.includes(textoPesquisado) ||
                formatarCargo(
                    funcionario.cargo
                )
                    .toLowerCase()
                    .includes(textoPesquisado) ||
                status.includes(textoPesquisado);

            const correspondeStatus =
                statusSelecionado === "" ||
                funcionario.status ===
                    statusSelecionado;

            return (
                correspondePesquisa &&
                correspondeStatus
            );
        });

    mostrarFuncionarios(resultado);
}


function limparFiltros() {
    pesquisaFuncionario.value = "";
    filtroStatus.value = "";

    mostrarFuncionarios(funcionarios);
}


function atualizarQuantidade(quantidade) {
    quantidadeFuncionarios.textContent =
        `${quantidade} funcionário(s) exibido(s)`;
}


async function alterarStatusFuncionario(
    id,
    acao
) {
    const token =
        localStorage.getItem("serviceflow_token");

    if (!token) {
        removerAutenticacao();
        return;
    }

    const mensagemConfirmacao =
        acao === "inativar"
            ? "Deseja inativar este funcionário?"
            : "Deseja reativar este funcionário?";

    const confirmou =
        confirm(mensagemConfirmacao);

    if (!confirmou) {
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/funcionarios/${id}/${acao}`,
            {
                method: "PATCH",

                headers: {
                    "Authorization":
                        `Bearer ${token}`,

                    "Accept":
                        "application/json"
                }
            }
        );

        const dados =
            await lerResposta(resposta);

        if (resposta.status === 401) {
            removerAutenticacao();
            return;
        }

        if (resposta.status === 403) {
            alert(
                "Você não possui permissão para realizar esta ação."
            );

            return;
        }

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                dados.message ||
                "Não foi possível alterar o funcionário."
            );
        }

        alert(
            dados.mensagem ||
            "Funcionário atualizado com sucesso."
        );

        await listarFuncionarios();

    } catch (erro) {
        console.error(
            "Erro ao alterar funcionário:",
            erro
        );

        alert(
            erro.message ||
            "Ocorreu um erro inesperado."
        );
    }
}


function atualizarPaginacao() {
    const paginaExibida =
        totalPaginas === 0
            ? 1
            : paginaAtual + 1;

    const totalExibido =
        totalPaginas === 0
            ? 1
            : totalPaginas;

    informacaoPagina.textContent =
        `Página ${paginaExibida} de ${totalExibido}`;

    paginaAnterior.disabled =
        paginaAtual === 0;

    proximaPagina.disabled =
        totalPaginas === 0 ||
        paginaAtual >= totalPaginas - 1;
}


function desabilitarPaginacao() {
    paginaAnterior.disabled = true;
    proximaPagina.disabled = true;

    informacaoPagina.textContent =
        "Página 1 de 1";
}


function voltarPagina() {
    if (paginaAtual <= 0) {
        return;
    }

    paginaAtual--;

    pesquisaFuncionario.value = "";
    filtroStatus.value = "";

    listarFuncionarios();
}


function avancarPagina() {
    if (
        totalPaginas === 0 ||
        paginaAtual >= totalPaginas - 1
    ) {
        return;
    }

    paginaAtual++;

    pesquisaFuncionario.value = "";
    filtroStatus.value = "";

    listarFuncionarios();
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


function removerAutenticacao() {
    localStorage.removeItem(
        "serviceflow_token"
    );

    localStorage.removeItem(
        "serviceflow_usuario"
    );

    window.location.href =
        "../login.html";
}


function abrirPendentes() {
    window.location.href =
        "pendentes.html";
}


function sair() {
    removerAutenticacao();
}


tabelaFuncionarios.addEventListener(
    "click",
    evento => {
        const botao =
            evento.target.closest("button");

        if (!botao) {
            return;
        }

        const id =
            botao.dataset.id;

        if (!id) {
            return;
        }

        if (
            botao.classList.contains(
                "botao-inativar"
            )
        ) {
            alterarStatusFuncionario(
                id,
                "inativar"
            );
        }

        if (
            botao.classList.contains(
                "botao-reativar"
            )
        ) {
            alterarStatusFuncionario(
                id,
                "reativar"
            );
        }
    }
);


pesquisaFuncionario.addEventListener(
    "input",
    aplicarFiltros
);

filtroStatus.addEventListener(
    "change",
    aplicarFiltros
);

botaoLimparFiltros.addEventListener(
    "click",
    limparFiltros
);

botaoSair.addEventListener(
    "click",
    sair
);

botaoPendentes.addEventListener(
    "click",
    abrirPendentes
);

paginaAnterior.addEventListener(
    "click",
    voltarPagina
);

proximaPagina.addEventListener(
    "click",
    avancarPagina
);


iniciarPagina();