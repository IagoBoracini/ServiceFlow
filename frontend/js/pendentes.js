const API_URL = "https://serviceflow-production-a083.up.railway.app";

const tabelaPendentes =
    document.getElementById("tabelaPendentes");

const quantidadePendentes =
    document.getElementById("quantidadePendentes");

const botaoAtualizar =
    document.getElementById("botaoAtualizar");

const botaoVoltar =
    document.getElementById("botaoVoltar");

let funcionariosPendentes = [];

async function listarPendentes() {
    const token =
        localStorage.getItem("serviceflow_token");

    if (!token) {
        removerAutenticacao();
        return;
    }

    alterarEstadoAtualizacao(true);
    mostrarCarregamento();

    try {
        const resposta = await fetch(
            `${API_URL}/funcionarios/pendentes`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (resposta.status === 401) {
            removerAutenticacao();
            return;
        }

        if (resposta.status === 403) {
            mostrarMensagemTabela(
                "Você não possui permissão para acessar esta página."
            );

            atualizarQuantidade(0);
            return;
        }

        const dados =
            await lerResposta(resposta);

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                "Não foi possível carregar as solicitações."
            );
        }

        funcionariosPendentes =
            Array.isArray(dados)
                ? dados
                : [];

        mostrarPendentes(
            funcionariosPendentes
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar solicitações:",
            erro
        );

        mostrarMensagemTabela(
            erro.message ||
            "Erro ao carregar solicitações."
        );

        atualizarQuantidade(0);

    } finally {
        alterarEstadoAtualizacao(false);
    }
}

function mostrarCarregamento() {
    tabelaPendentes.innerHTML = `
        <tr>
            <td colspan="5">
                Carregando solicitações...
            </td>
        </tr>
    `;
}

function mostrarMensagemTabela(mensagem) {
    tabelaPendentes.innerHTML = `
        <tr>
            <td colspan="5">
                ${mensagem}
            </td>
        </tr>
    `;
}

function mostrarPendentes(lista) {
    tabelaPendentes.innerHTML = "";

    atualizarQuantidade(lista.length);

    if (!lista || lista.length === 0) {
        mostrarMensagemTabela(
            "Nenhuma solicitação pendente."
        );

        return;
    }

    lista.forEach(funcionario => {
        const linha =
            document.createElement("tr");

        linha.innerHTML = `
            <td>
                ${funcionario.nome ?? "-"}
            </td>

            <td>
                ${funcionario.email ?? "-"}
            </td>

            <td>
                ${formatarCargo(funcionario.cargo)}
            </td>

            <td>
                <span class="status status-pendente">
                    ${funcionario.status ?? "PENDENTE"}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="botao-aprovar"
                    data-id="${funcionario.id}"
                >
                    Aprovar
                </button>

                <button
                    type="button"
                    class="botao-rejeitar"
                    data-id="${funcionario.id}"
                >
                    Rejeitar
                </button>
            </td>
        `;

        tabelaPendentes.appendChild(linha);
    });
}

function formatarCargo(cargo) {
    if (!cargo) {
        return "-";
    }

    if (cargo === "ADMIN") {
        return "Administrador";
    }

    if (cargo === "ATENDENTE") {
        return "Atendente";
    }

    if (cargo === "TECNICO") {
        return "Técnico";
    }

    return cargo;
}

function atualizarQuantidade(quantidade) {
    quantidadePendentes.textContent =
        `${quantidade} solicitação(ões) pendente(s)`;
}

async function aprovarFuncionario(
    id,
    botao
) {
    const confirmou = confirm(
        "Deseja aprovar este funcionário?"
    );

    if (!confirmou) {
        return;
    }

    await alterarStatusFuncionario(
        id,
        "aprovar",
        botao
    );
}

async function rejeitarFuncionario(
    id,
    botao
) {
    const confirmou = confirm(
        "Deseja rejeitar esta solicitação?"
    );

    if (!confirmou) {
        return;
    }

    await alterarStatusFuncionario(
        id,
        "rejeitar",
        botao
    );
}

async function alterarStatusFuncionario(
    id,
    acao,
    botao
) {
    const token =
        localStorage.getItem("serviceflow_token");

    if (!token) {
        removerAutenticacao();
        return;
    }

    alterarEstadoBotaoAcao(
        botao,
        true,
        acao
    );

    try {
        const resposta = await fetch(
            `${API_URL}/funcionarios/${id}/${acao}`,
            {
                method: "PATCH",

                headers: {
                    "Authorization": `Bearer ${token}`
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
            throw new Error(
                "Você não possui permissão para realizar esta ação."
            );
        }

        if (!resposta.ok) {
            throw new Error(
                dados.mensagem ||
                "Não foi possível concluir a operação."
            );
        }

        alert(
            dados.mensagem ||
            "Operação realizada com sucesso."
        );

        await listarPendentes();

    } catch (erro) {
        console.error(
            "Erro ao alterar funcionário:",
            erro
        );

        alert(
            erro.message ||
            "Ocorreu um erro inesperado."
        );

        alterarEstadoBotaoAcao(
            botao,
            false,
            acao
        );
    }
}

function alterarEstadoBotaoAcao(
    botao,
    carregando,
    acao
) {
    if (!botao) {
        return;
    }

    botao.disabled = carregando;

    if (carregando) {
        botao.textContent =
            acao === "aprovar"
                ? "Aprovando..."
                : "Rejeitando...";

        return;
    }

    botao.textContent =
        acao === "aprovar"
            ? "Aprovar"
            : "Rejeitar";
}

function alterarEstadoAtualizacao(
    carregando
) {
    botaoAtualizar.disabled =
        carregando;

    botaoAtualizar.textContent =
        carregando
            ? "Atualizando..."
            : "Atualizar";
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

function voltarFuncionarios() {
    window.location.href =
        "funcionarios.html";
}

tabelaPendentes.addEventListener(
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
                "botao-aprovar"
            )
        ) {
            aprovarFuncionario(
                id,
                botao
            );
        }

        if (
            botao.classList.contains(
                "botao-rejeitar"
            )
        ) {
            rejeitarFuncionario(
                id,
                botao
            );
        }
    }
);

botaoAtualizar.addEventListener(
    "click",
    listarPendentes
);

botaoVoltar.addEventListener(
    "click",
    voltarFuncionarios
);

listarPendentes();