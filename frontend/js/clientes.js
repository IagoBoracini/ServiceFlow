const API_URL = "http://localhost:8080";

const PAGE_SIZE = 10;

let currentPage = 0;
let totalPages = 0;
let selectedClientId = null;
let confirmationAction = null;
let searchTimer = null;


const newClientButton =
    document.getElementById("new-client-button");

const refreshButton =
    document.getElementById("refresh-button");

const logoutButton =
    document.getElementById("logout-button");

const searchInput =
    document.getElementById("search-input");

const clientsTableBody =
    document.getElementById("clients-table-body");

const tableContainer =
    document.getElementById("table-container");

const emptyState =
    document.getElementById("empty-state");

const loadingContainer =
    document.getElementById("loading-container");

const pageMessage =
    document.getElementById("page-message");

const paginationContainer =
    document.getElementById("pagination-container");

const paginationInformation =
    document.getElementById("pagination-information");

const previousPageButton =
    document.getElementById("previous-page-button");

const nextPageButton =
    document.getElementById("next-page-button");


const userName =
    document.getElementById("user-name");

const userRole =
    document.getElementById("user-role");

const userAvatar =
    document.getElementById("user-avatar");


const clientModal =
    document.getElementById("client-modal");

const closeModalButton =
    document.getElementById("close-modal-button");

const cancelButton =
    document.getElementById("cancel-button");

const modalTitle =
    document.getElementById("modal-title");

const modalMessage =
    document.getElementById("modal-message");

const clientForm =
    document.getElementById("client-form");

const saveButton =
    document.getElementById("save-button");

const clientIdInput =
    document.getElementById("client-id");

const clientNameInput =
    document.getElementById("client-name");

const clientDocumentInput =
    document.getElementById("client-document");

const clientPhoneInput =
    document.getElementById("client-phone");

const clientEmailInput =
    document.getElementById("client-email");

const clientAddressInput =
    document.getElementById("client-address");


const confirmationModal =
    document.getElementById("confirmation-modal");

const confirmationTitle =
    document.getElementById("confirmation-title");

const confirmationText =
    document.getElementById("confirmation-text");

const confirmationIcon =
    document.getElementById("confirmation-icon");

const cancelConfirmationButton =
    document.getElementById(
        "cancel-confirmation-button"
    );

const confirmActionButton =
    document.getElementById(
        "confirm-action-button"
    );


document.addEventListener(
    "DOMContentLoaded",
    iniciarPagina
);

newClientButton.addEventListener(
    "click",
    abrirModalCadastro
);

refreshButton.addEventListener(
    "click",
    atualizarListagem
);

logoutButton.addEventListener(
    "click",
    realizarLogout
);

searchInput.addEventListener(
    "input",
    pesquisarComAtraso
);

previousPageButton.addEventListener(
    "click",
    carregarPaginaAnterior
);

nextPageButton.addEventListener(
    "click",
    carregarProximaPagina
);

closeModalButton.addEventListener(
    "click",
    fecharModalCliente
);

cancelButton.addEventListener(
    "click",
    fecharModalCliente
);

clientForm.addEventListener(
    "submit",
    salvarCliente
);

clientDocumentInput.addEventListener(
    "input",
    aplicarMascaraDocumento
);

clientPhoneInput.addEventListener(
    "input",
    aplicarMascaraTelefone
);

cancelConfirmationButton.addEventListener(
    "click",
    fecharModalConfirmacao
);

confirmActionButton.addEventListener(
    "click",
    executarAcaoConfirmada
);

clientModal.addEventListener(
    "click",
    fecharModalAoClicarFora
);

confirmationModal.addEventListener(
    "click",
    fecharConfirmacaoAoClicarFora
);

document.addEventListener(
    "keydown",
    fecharModaisComEscape
);


function iniciarPagina() {
    const token =
        obterToken();

    if (!token) {
        redirecionarParaLogin();
        return;
    }

    carregarUsuarioSalvo();
    carregarClientes();
}


function obterToken() {
    return localStorage.getItem(
        "serviceflow_token"
    );
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

        const cargo =
            formatarCargoUsuario(
                usuario.cargo
            );

        if (userName) {
            userName.textContent =
                nome;
        }

        if (userRole) {
            userRole.textContent =
                cargo;
        }

        if (userAvatar) {
            userAvatar.textContent =
                obterInicialUsuario(nome);
        }

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


function formatarCargoUsuario(cargo) {
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


function obterInicialUsuario(nome) {
    const nomeNormalizado =
        String(nome || "").trim();

    if (!nomeNormalizado) {
        return "U";
    }

    return nomeNormalizado
        .charAt(0)
        .toUpperCase();
}


function formatarTexto(valor) {
    if (!valor) {
        return "";
    }

    return String(valor)
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            letra =>
                letra.toUpperCase()
        );
}


function obterCabecalhosAutenticados() {
    return {
        "Content-Type":
            "application/json",

        "Accept":
            "application/json",

        "Authorization":
            `Bearer ${obterToken()}`
    };
}


async function carregarClientes() {
    esconderMensagemPagina();
    mostrarCarregamento();

    try {
        const resposta = await fetch(
            `${API_URL}/clientes?pagina=${currentPage}&tamanho=${PAGE_SIZE}`,
            {
                method: "GET",
                headers:
                    obterCabecalhosAutenticados()
            }
        );

        const dados =
            await processarResposta(
                resposta
            );

        const clientes =
            Array.isArray(dados.content)
                ? dados.content
                : [];

        totalPages =
            Number(
                dados.totalPages
            ) || 0;

        renderizarClientes(
            clientes
        );

        atualizarPaginacao(
            dados.number ??
                currentPage,

            totalPages,

            dados.totalElements ??
                clientes.length
        );

    } catch (erro) {
        tratarErroDaPagina(
            erro
        );

    } finally {
        esconderCarregamento();
    }
}


function renderizarClientes(clientes) {
    clientsTableBody.innerHTML = "";

    if (clientes.length === 0) {
        tableContainer.style.display =
            "none";

        emptyState.classList.add(
            "visible"
        );

        return;
    }

    tableContainer.style.display =
        "block";

    emptyState.classList.remove(
        "visible"
    );

    clientes.forEach(cliente => {
        const linha =
            document.createElement(
                "tr"
            );

        linha.innerHTML = `
            <td>
                <span class="client-name">
                    ${escaparHtml(
                        cliente.nome
                    )}
                </span>
            </td>

            <td>
                ${formatarDocumento(
                    cliente.documento
                )}
            </td>

            <td>
                <span class="client-email">
                    ${escaparHtml(
                        cliente.email ||
                        "Sem e-mail"
                    )}
                </span>

                <span class="client-phone">
                    ${formatarTelefone(
                        cliente.telefone
                    )}
                </span>
            </td>

            <td>
                <span class="client-address">
                    ${escaparHtml(
                        cliente.endereco ||
                        "Não informado"
                    )}
                </span>
            </td>

            <td>
                <span
                    class="
                        status
                        ${
                            cliente.ativo
                                ? "active"
                                : "inactive"
                        }
                    "
                >
                    ${
                        cliente.ativo
                            ? "Ativo"
                            : "Inativo"
                    }
                </span>
            </td>

            <td>
                <div class="table-actions">

                    <button
                        type="button"
                        class="action-button"
                        data-action="edit"
                        data-client-id="${cliente.id}"
                    >
                        Editar
                    </button>

                    ${
                        cliente.ativo
                            ? `
                                <button
                                    type="button"
                                    class="action-button danger"
                                    data-action="deactivate"
                                    data-client-id="${cliente.id}"
                                    data-client-name="${escaparAtributo(
                                        cliente.nome
                                    )}"
                                >
                                    Inativar
                                </button>
                            `
                            : `
                                <button
                                    type="button"
                                    class="action-button success"
                                    data-action="reactivate"
                                    data-client-id="${cliente.id}"
                                    data-client-name="${escaparAtributo(
                                        cliente.nome
                                    )}"
                                >
                                    Reativar
                                </button>
                            `
                    }

                </div>
            </td>
        `;

        clientsTableBody.appendChild(
            linha
        );
    });

    adicionarEventosAosBotoesDaTabela();
}


function adicionarEventosAosBotoesDaTabela() {
    const botoes =
        clientsTableBody
            .querySelectorAll(
                "[data-action]"
            );

    botoes.forEach(botao => {
        botao.addEventListener(
            "click",
            tratarAcaoDaTabela
        );
    });
}


function tratarAcaoDaTabela(evento) {
    const botao =
        evento.currentTarget;

    const acao =
        botao.dataset.action;

    const clienteId =
        Number(
            botao.dataset.clientId
        );

    const clienteNome =
        botao.dataset.clientName ||
        "";

    if (acao === "edit") {
        abrirModalEdicao(
            clienteId
        );

        return;
    }

    if (acao === "deactivate") {
        abrirConfirmacaoInativacao(
            clienteId,
            clienteNome
        );

        return;
    }

    if (acao === "reactivate") {
        abrirConfirmacaoReativacao(
            clienteId,
            clienteNome
        );
    }
}


function atualizarPaginacao(
    pagina,
    quantidadePaginas,
    totalClientes
) {
    currentPage = pagina;

    paginationContainer.classList.remove(
        "hidden"
    );

    const paginaExibida =
        quantidadePaginas === 0
            ? 0
            : pagina + 1;

    paginationInformation.textContent =
        `Página ${paginaExibida} de ${quantidadePaginas} · ${totalClientes} cliente(s)`;

    previousPageButton.disabled =
        pagina <= 0;

    nextPageButton.disabled =
        quantidadePaginas === 0 ||
        pagina >=
            quantidadePaginas - 1;
}


function carregarPaginaAnterior() {
    if (currentPage <= 0) {
        return;
    }

    currentPage--;

    carregarClientes();
}


function carregarProximaPagina() {
    if (
        totalPages === 0 ||
        currentPage >= totalPages - 1
    ) {
        return;
    }

    currentPage++;

    carregarClientes();
}


function pesquisarComAtraso() {
    clearTimeout(
        searchTimer
    );

    searchTimer = setTimeout(
        pesquisarClientes,
        400
    );
}


async function pesquisarClientes() {
    const nome =
        searchInput.value.trim();

    esconderMensagemPagina();

    if (nome === "") {
        currentPage = 0;
        carregarClientes();

        return;
    }

    mostrarCarregamento();

    paginationContainer.classList.add(
        "hidden"
    );

    try {
        const resposta = await fetch(
            `${API_URL}/clientes/buscar?nome=${encodeURIComponent(
                nome
            )}`,
            {
                method: "GET",
                headers:
                    obterCabecalhosAutenticados()
            }
        );

        const clientes =
            await processarResposta(
                resposta
            );

        renderizarClientes(
            Array.isArray(clientes)
                ? clientes
                : []
        );

    } catch (erro) {
        tratarErroDaPagina(
            erro
        );

    } finally {
        esconderCarregamento();
    }
}


function atualizarListagem() {
    searchInput.value = "";

    currentPage = 0;

    carregarClientes();
}


function abrirModalCadastro() {
    selectedClientId = null;

    limparFormulario();

    modalTitle.textContent =
        "Novo cliente";

    saveButton.textContent =
        "Salvar cliente";

    abrirModalCliente();

    clientNameInput.focus();
}


async function abrirModalEdicao(
    clienteId
) {
    limparFormulario();

    selectedClientId =
        clienteId;

    modalTitle.textContent =
        "Editar cliente";

    saveButton.textContent =
        "Salvar alterações";

    abrirModalCliente();

    mostrarMensagemModal(
        "Carregando dados do cliente...",
        "success"
    );

    desabilitarFormulario(
        true
    );

    try {
        const resposta = await fetch(
            `${API_URL}/clientes/${clienteId}`,
            {
                method: "GET",
                headers:
                    obterCabecalhosAutenticados()
            }
        );

        const cliente =
            await processarResposta(
                resposta
            );

        clientIdInput.value =
            cliente.id;

        clientNameInput.value =
            cliente.nome || "";

        clientDocumentInput.value =
            formatarDocumento(
                cliente.documento
            );

        clientPhoneInput.value =
            formatarTelefone(
                cliente.telefone,
                false
            );

        clientEmailInput.value =
            cliente.email || "";

        clientAddressInput.value =
            cliente.endereco || "";

        esconderMensagemModal();

        clientNameInput.focus();

    } catch (erro) {
        mostrarMensagemModal(
            erro.message,
            "error"
        );

    } finally {
        desabilitarFormulario(
            false
        );
    }
}


async function salvarCliente(evento) {
    evento.preventDefault();

    limparErrosFormulario();
    esconderMensagemModal();

    const dados =
        obterDadosFormulario();

    if (!validarFormulario(dados)) {
        mostrarMensagemModal(
            "Verifique os campos destacados.",
            "error"
        );

        return;
    }

    const editando =
        selectedClientId !== null;

    const url =
        editando
            ? `${API_URL}/clientes/${selectedClientId}`
            : `${API_URL}/clientes`;

    const metodo =
        editando
            ? "PUT"
            : "POST";

    alterarEstadoBotaoSalvar(
        true
    );

    try {
        const resposta = await fetch(
            url,
            {
                method: metodo,

                headers:
                    obterCabecalhosAutenticados(),

                body: JSON.stringify({
                    nome:
                        dados.nome,

                    documento:
                        dados.documento,

                    email:
                        dados.email ||
                        null,

                    telefone:
                        dados.telefone ||
                        null,

                    endereco:
                        dados.endereco ||
                        null
                })
            }
        );

        await processarResposta(
            resposta
        );

        fecharModalCliente();

        mostrarMensagemPagina(
            editando
                ? "Cliente atualizado com sucesso."
                : "Cliente cadastrado com sucesso.",
            "success"
        );

        currentPage = 0;
        searchInput.value = "";

        await carregarClientes();

    } catch (erro) {
        mostrarMensagemModal(
            erro.message,
            "error"
        );

    } finally {
        alterarEstadoBotaoSalvar(
            false
        );
    }
}


function obterDadosFormulario() {
    return {
        nome:
            clientNameInput.value
                .trim(),

        documento:
            obterSomenteNumeros(
                clientDocumentInput.value
            ),

        telefone:
            obterSomenteNumeros(
                clientPhoneInput.value
            ),

        email:
            clientEmailInput.value
                .trim()
                .toLowerCase(),

        endereco:
            clientAddressInput.value
                .trim()
    };
}


function validarFormulario(dados) {
    let formularioValido =
        true;

    if (dados.nome === "") {
        definirErro(
            clientNameInput,
            "client-name-error",
            "O nome do cliente é obrigatório."
        );

        formularioValido =
            false;
    }

    if (dados.documento === "") {
        definirErro(
            clientDocumentInput,
            "client-document-error",
            "O CPF ou CNPJ é obrigatório."
        );

        formularioValido =
            false;

    } else if (
        dados.documento.length !== 11 &&
        dados.documento.length !== 14
    ) {
        definirErro(
            clientDocumentInput,
            "client-document-error",
            "Digite um CPF com 11 números ou um CNPJ com 14 números."
        );

        formularioValido =
            false;
    }

    if (
        dados.email !== "" &&
        !validarEmail(
            dados.email
        )
    ) {
        definirErro(
            clientEmailInput,
            "client-email-error",
            "Digite um e-mail válido."
        );

        formularioValido =
            false;
    }

    if (
        dados.telefone !== "" &&
        dados.telefone.length < 10
    ) {
        definirErro(
            clientPhoneInput,
            "client-phone-error",
            "Digite um telefone válido."
        );

        formularioValido =
            false;
    }

    return formularioValido;
}


function definirErro(
    input,
    errorId,
    mensagem
) {
    input.classList.add(
        "input-error"
    );

    const elementoErro =
        document.getElementById(
            errorId
        );

    if (elementoErro) {
        elementoErro.textContent =
            mensagem;
    }
}


function limparErrosFormulario() {
    document
        .querySelectorAll(
            ".input-error"
        )
        .forEach(input => {
            input.classList.remove(
                "input-error"
            );
        });

    document
        .querySelectorAll(
            ".field-error"
        )
        .forEach(erro => {
            erro.textContent = "";
        });
}


function abrirConfirmacaoInativacao(
    clienteId,
    clienteNome
) {
    selectedClientId =
        clienteId;

    confirmationAction =
        "deactivate";

    confirmationIcon.textContent =
        "⚠️";

    confirmationTitle.textContent =
        "Inativar cliente";

    confirmationText.textContent =
        `Tem certeza de que deseja inativar o cliente "${clienteNome}"?`;

    confirmActionButton.textContent =
        "Inativar";

    confirmActionButton.classList.remove(
        "reactivate"
    );

    abrirModalConfirmacao();
}


function abrirConfirmacaoReativacao(
    clienteId,
    clienteNome
) {
    selectedClientId =
        clienteId;

    confirmationAction =
        "reactivate";

    confirmationIcon.textContent =
        "✅";

    confirmationTitle.textContent =
        "Reativar cliente";

    confirmationText.textContent =
        `Tem certeza de que deseja reativar o cliente "${clienteNome}"?`;

    confirmActionButton.textContent =
        "Reativar";

    confirmActionButton.classList.add(
        "reactivate"
    );

    abrirModalConfirmacao();
}


async function executarAcaoConfirmada() {
    if (
        !selectedClientId ||
        !confirmationAction
    ) {
        return;
    }

    const reativar =
        confirmationAction ===
        "reactivate";

    const endpoint =
        reativar
            ? "reativar"
            : "inativar";

    confirmActionButton.disabled =
        true;

    try {
        const resposta = await fetch(
            `${API_URL}/clientes/${selectedClientId}/${endpoint}`,
            {
                method: "PATCH",

                headers:
                    obterCabecalhosAutenticados()
            }
        );

        await processarResposta(
            resposta
        );

        fecharModalConfirmacao();

        mostrarMensagemPagina(
            reativar
                ? "Cliente reativado com sucesso."
                : "Cliente inativado com sucesso.",
            "success"
        );

        const pesquisando =
            searchInput.value
                .trim() !== "";

        if (pesquisando) {
            await pesquisarClientes();

        } else {
            await carregarClientes();
        }

    } catch (erro) {
        fecharModalConfirmacao();

        mostrarMensagemPagina(
            erro.message,
            "error"
        );

    } finally {
        confirmActionButton.disabled =
            false;
    }
}


async function processarResposta(
    resposta
) {
    const dados =
        await lerCorpoResposta(
            resposta
        );

    if (resposta.status === 401) {
        limparAutenticacao();
        redirecionarParaLogin();

        throw new Error(
            "Sua sessão expirou. Entre novamente."
        );
    }

    if (resposta.status === 403) {
        throw new Error(
            dados.mensagem ||
            dados.message ||
            "Você não possui permissão para realizar esta ação."
        );
    }

    if (!resposta.ok) {
        throw new Error(
            obterMensagemErro(
                dados
            )
        );
    }

    return dados;
}


async function lerCorpoResposta(
    resposta
) {
    const contentType =
        resposta.headers.get(
            "content-type"
        );

    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {
        return await resposta.json();
    }

    const texto =
        await resposta.text();

    return texto
        ? { mensagem: texto }
        : {};
}


function obterMensagemErro(dados) {
    if (!dados) {
        return "Não foi possível concluir a operação.";
    }

    if (typeof dados === "string") {
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

    return "Não foi possível concluir a operação.";
}


function mostrarCarregamento() {
    loadingContainer.classList.add(
        "visible"
    );

    tableContainer.style.display =
        "none";

    emptyState.classList.remove(
        "visible"
    );
}


function esconderCarregamento() {
    loadingContainer.classList.remove(
        "visible"
    );
}


function mostrarMensagemPagina(
    mensagem,
    tipo
) {
    pageMessage.textContent =
        mensagem;

    pageMessage.className =
        `message ${tipo}`;

    if (tipo === "success") {
        setTimeout(
            esconderMensagemPagina,
            4000
        );
    }
}


function esconderMensagemPagina() {
    pageMessage.textContent = "";

    pageMessage.className =
        "message";
}


function mostrarMensagemModal(
    mensagem,
    tipo
) {
    modalMessage.textContent =
        mensagem;

    modalMessage.className =
        `modal-message ${tipo}`;
}


function esconderMensagemModal() {
    modalMessage.textContent = "";

    modalMessage.className =
        "modal-message";
}


function tratarErroDaPagina(erro) {
    console.error(
        "Erro na página de clientes:",
        erro
    );

    tableContainer.style.display =
        "none";

    emptyState.classList.remove(
        "visible"
    );

    paginationInformation.textContent =
        "Página 0 de 0 · 0 cliente(s)";

    previousPageButton.disabled =
        true;

    nextPageButton.disabled =
        true;

    mostrarMensagemPagina(
        erro.message ||
        "Não foi possível carregar os clientes.",
        "error"
    );
}


function abrirModalCliente() {
    clientModal.classList.add(
        "visible"
    );

    clientModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


function fecharModalCliente() {
    clientModal.classList.remove(
        "visible"
    );

    clientModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

    selectedClientId = null;

    limparFormulario();
}


function abrirModalConfirmacao() {
    confirmationModal.classList.add(
        "visible"
    );

    confirmationModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


function fecharModalConfirmacao() {
    confirmationModal.classList.remove(
        "visible"
    );

    confirmationModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

    selectedClientId = null;
    confirmationAction = null;
}


function fecharModalAoClicarFora(
    evento
) {
    if (
        evento.target ===
        clientModal
    ) {
        fecharModalCliente();
    }
}


function fecharConfirmacaoAoClicarFora(
    evento
) {
    if (
        evento.target ===
        confirmationModal
    ) {
        fecharModalConfirmacao();
    }
}


function fecharModaisComEscape(
    evento
) {
    if (evento.key !== "Escape") {
        return;
    }

    if (
        confirmationModal.classList
            .contains("visible")
    ) {
        fecharModalConfirmacao();

        return;
    }

    if (
        clientModal.classList
            .contains("visible")
    ) {
        fecharModalCliente();
    }
}


function limparFormulario() {
    clientForm.reset();

    clientIdInput.value = "";

    esconderMensagemModal();
    limparErrosFormulario();
}


function desabilitarFormulario(
    desabilitado
) {
    clientForm
        .querySelectorAll(
            "input, button"
        )
        .forEach(elemento => {
            elemento.disabled =
                desabilitado;
        });

    closeModalButton.disabled =
        desabilitado;
}


function alterarEstadoBotaoSalvar(
    carregando
) {
    saveButton.disabled =
        carregando;

    saveButton.textContent =
        carregando
            ? "Salvando..."
            : selectedClientId
                ? "Salvar alterações"
                : "Salvar cliente";
}


function aplicarMascaraDocumento(
    evento
) {
    const numeros =
        obterSomenteNumeros(
            evento.target.value
        ).slice(0, 14);

    evento.target.value =
        formatarDocumento(
            numeros
        );
}


function formatarDocumento(
    documento
) {
    const numeros =
        obterSomenteNumeros(
            documento || ""
        );

    if (numeros.length <= 11) {
        return numeros
            .replace(
                /(\d{3})(\d)/,
                "$1.$2"
            )
            .replace(
                /(\d{3})(\d)/,
                "$1.$2"
            )
            .replace(
                /(\d{3})(\d{1,2})$/,
                "$1-$2"
            );
    }

    return numeros
        .replace(
            /^(\d{2})(\d)/,
            "$1.$2"
        )
        .replace(
            /^(\d{2})\.(\d{3})(\d)/,
            "$1.$2.$3"
        )
        .replace(
            /\.(\d{3})(\d)/,
            ".$1/$2"
        )
        .replace(
            /(\d{4})(\d)/,
            "$1-$2"
        );
}


function aplicarMascaraTelefone(
    evento
) {
    const numeros =
        obterSomenteNumeros(
            evento.target.value
        ).slice(0, 11);

    evento.target.value =
        formatarTelefone(
            numeros,
            false
        );
}


function formatarTelefone(
    telefone,
    valorPadrao = true
) {
    const numeros =
        obterSomenteNumeros(
            telefone || ""
        );

    if (numeros === "") {
        return valorPadrao
            ? "Não informado"
            : "";
    }

    if (numeros.length <= 10) {
        return numeros
            .replace(
                /^(\d{2})(\d)/,
                "($1) $2"
            )
            .replace(
                /(\d{4})(\d)/,
                "$1-$2"
            );
    }

    return numeros
        .replace(
            /^(\d{2})(\d)/,
            "($1) $2"
        )
        .replace(
            /(\d{5})(\d)/,
            "$1-$2"
        );
}


function obterSomenteNumeros(
    valor
) {
    return String(valor || "")
        .replace(
            /\D/g,
            ""
        );
}


function validarEmail(email) {
    const formatoEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return formatoEmail.test(
        email
    );
}


function escaparHtml(valor) {
    const elemento =
        document.createElement(
            "div"
        );

    elemento.textContent =
        valor == null
            ? ""
            : String(valor);

    return elemento.innerHTML;
}


function escaparAtributo(valor) {
    return escaparHtml(valor)
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function limparAutenticacao() {
    localStorage.removeItem(
        "serviceflow_token"
    );

    localStorage.removeItem(
        "serviceflow_usuario"
    );
}


function realizarLogout() {
    limparAutenticacao();

    redirecionarParaLogin();
}


function redirecionarParaLogin() {
    window.location.href =
        "../login.html";
}