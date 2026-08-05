const API_URL = "https://serviceflow-production-a083.up.railway.app";
const PAGE_SIZE = 10;

let currentPage = 0;
let totalPages = 0;
let selectedTicketId = null;

let clients = [];
let technicians = [];

const ticketsTableBody =
    document.getElementById(
        "tickets-table-body"
    );

const tableContainer =
    document.getElementById(
        "table-container"
    );

const emptyState =
    document.getElementById(
        "empty-state"
    );

const loadingContainer =
    document.getElementById(
        "loading-container"
    );

const pageMessage =
    document.getElementById(
        "page-message"
    );

const paginationInformation =
    document.getElementById(
        "pagination-information"
    );

const previousPageButton =
    document.getElementById(
        "previous-page-button"
    );

const nextPageButton =
    document.getElementById(
        "next-page-button"
    );

const statusFilter =
    document.getElementById(
        "status-filter"
    );

const priorityFilter =
    document.getElementById(
        "priority-filter"
    );

const clearFiltersButton =
    document.getElementById(
        "clear-filters-button"
    );

const refreshButton =
    document.getElementById(
        "refresh-button"
    );

const newTicketButton =
    document.getElementById(
        "new-ticket-button"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );

const userName =
    document.getElementById(
        "user-name"
    );

const userRole =
    document.getElementById(
        "user-role"
    );

const userAvatar =
    document.getElementById(
        "user-avatar"
    );

const ticketModal =
    document.getElementById(
        "ticket-modal"
    );

const closeModalButton =
    document.getElementById(
        "close-modal-button"
    );

const cancelButton =
    document.getElementById(
        "cancel-button"
    );

const ticketForm =
    document.getElementById(
        "ticket-form"
    );

const modalTitle =
    document.getElementById(
        "modal-title"
    );

const modalMessage =
    document.getElementById(
        "modal-message"
    );

const saveButton =
    document.getElementById(
        "save-button"
    );

const ticketIdInput =
    document.getElementById(
        "ticket-id"
    );

const ticketTitleInput =
    document.getElementById(
        "ticket-title"
    );

const ticketDescriptionInput =
    document.getElementById(
        "ticket-description"
    );

const ticketClientInput =
    document.getElementById(
        "ticket-client"
    );

const ticketPriorityInput =
    document.getElementById(
        "ticket-priority"
    );

const ticketTechnicianInput =
    document.getElementById(
        "ticket-technician"
    );


document.addEventListener(
    "DOMContentLoaded",
    initializePage
);

newTicketButton.addEventListener(
    "click",
    openCreateModal
);

refreshButton.addEventListener(
    "click",
    loadTickets
);

clearFiltersButton.addEventListener(
    "click",
    clearFilters
);

statusFilter.addEventListener(
    "change",
    applyFilters
);

priorityFilter.addEventListener(
    "change",
    applyFilters
);

previousPageButton.addEventListener(
    "click",
    loadPreviousPage
);

nextPageButton.addEventListener(
    "click",
    loadNextPage
);

logoutButton.addEventListener(
    "click",
    logout
);

closeModalButton.addEventListener(
    "click",
    closeTicketModal
);

cancelButton.addEventListener(
    "click",
    closeTicketModal
);

ticketForm.addEventListener(
    "submit",
    saveTicket
);

ticketModal.addEventListener(
    "click",
    event => {
        if (
            event.target === ticketModal
        ) {
            closeTicketModal();
        }
    }
);

document.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Escape" &&
            ticketModal.classList.contains(
                "visible"
            )
        ) {
            closeTicketModal();
        }
    }
);

ticketsTableBody.addEventListener(
    "click",
    handleTableAction
);


async function initializePage() {
    if (!getToken()) {
        redirectToLogin();
        return;
    }

    loadStoredUser();

    await Promise.all([
        loadClients(),
        loadTechnicians()
    ]);

    await loadTickets();
}


function getToken() {
    return localStorage.getItem(
        "serviceflow_token"
    );
}


function loadStoredUser() {
    const storedUser =
        localStorage.getItem(
            "serviceflow_usuario"
        );

    if (!storedUser) {
        setDefaultUser();
        return;
    }

    try {
        const user =
            JSON.parse(storedUser);

        const name =
            user.nome || "Usuário";

        const role =
            formatUserRole(
                user.cargo
            );

        if (userName) {
            userName.textContent =
                name;
        }

        if (userRole) {
            userRole.textContent =
                role;
        }

        if (userAvatar) {
            userAvatar.textContent =
                getUserInitial(name);
        }

    } catch (error) {
        console.error(
            "Erro ao carregar usuário salvo:",
            error
        );

        localStorage.removeItem(
            "serviceflow_usuario"
        );

        setDefaultUser();
    }
}


function setDefaultUser() {
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


function formatUserRole(role) {
    const roles = {
        ADMIN: "Administrador",
        ATENDENTE: "Atendente",
        TECNICO: "Técnico"
    };

    return roles[role] ||
        formatText(role) ||
        "ServiceFlow";
}


function getUserInitial(name) {
    const normalizedName =
        String(name || "").trim();

    if (!normalizedName) {
        return "U";
    }

    return normalizedName
        .charAt(0)
        .toUpperCase();
}


function formatText(value) {
    if (!value) {
        return "";
    }

    return String(value)
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );
}


function getHeaders() {
    return {
        "Content-Type":
            "application/json",

        "Accept":
            "application/json",

        "Authorization":
            `Bearer ${getToken()}`
    };
}


async function loadTickets() {
    hidePageMessage();
    showLoading();

    try {
        const parameters =
            new URLSearchParams();

        parameters.set(
            "pagina",
            currentPage
        );

        parameters.set(
            "tamanho",
            PAGE_SIZE
        );

        if (statusFilter.value) {
            parameters.set(
                "status",
                statusFilter.value
            );
        }

        if (priorityFilter.value) {
            parameters.set(
                "prioridade",
                priorityFilter.value
            );
        }

        const response = await fetch(
            `${API_URL}/chamados?${parameters.toString()}`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const data =
            await processResponse(
                response
            );

        const tickets =
            Array.isArray(data.content)
                ? data.content
                : [];

        totalPages =
            Number(data.totalPages) || 0;

        renderTickets(tickets);

        updatePagination(
            data.number ??
                currentPage,

            totalPages,

            data.totalElements ??
                tickets.length
        );

    } catch (error) {
        handlePageError(error);

    } finally {
        hideLoading();
    }
}


function renderTickets(tickets) {
    ticketsTableBody.innerHTML = "";

    if (tickets.length === 0) {
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

    tickets.forEach(ticket => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                <span class="ticket-title">
                    ${escapeHtml(
                        ticket.titulo
                    )}
                </span>

                <span class="ticket-description">
                    ${escapeHtml(
                        ticket.descricao
                    )}
                </span>
            </td>

            <td>
                ${escapeHtml(
                    ticket.clienteNome ||
                    "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    ticket
                        .tecnicoResponsavelNome ||
                    "Não atribuído"
                )}
            </td>

            <td>
                <span
                    class="
                        priority
                        ${getPriorityClass(
                            ticket.prioridade
                        )}
                    "
                >
                    ${formatPriority(
                        ticket.prioridade
                    )}
                </span>
            </td>

            <td>
                <span
                    class="
                        status
                        ${getStatusClass(
                            ticket.status
                        )}
                    "
                >
                    ${formatStatus(
                        ticket.status
                    )}
                </span>
            </td>

            <td>
                ${formatDate(
                    ticket.dataAbertura
                )}
            </td>

            <td>
                <div class="table-actions">

                    <button
                        type="button"
                        class="action-button"
                        data-action="edit"
                        data-id="${ticket.id}"
                    >
                        Editar
                    </button>

                    <button
                        type="button"
                        class="action-button"
                        data-action="technician"
                        data-id="${ticket.id}"
                    >
                        Técnico
                    </button>

                    <button
                        type="button"
                        class="action-button"
                        data-action="priority"
                        data-id="${ticket.id}"
                    >
                        Prioridade
                    </button>

                    <button
                        type="button"
                        class="action-button"
                        data-action="status"
                        data-id="${ticket.id}"
                    >
                        Status
                    </button>

                </div>
            </td>
        `;

        ticketsTableBody.appendChild(
            row
        );
    });
}


function handleTableAction(event) {
    const button =
        event.target.closest(
            "[data-action]"
        );

    if (!button) {
        return;
    }

    const id =
        Number(button.dataset.id);

    const action =
        button.dataset.action;

    if (action === "edit") {
        openEditModal(id);
        return;
    }

    if (action === "technician") {
        changeTechnician(id);
        return;
    }

    if (action === "priority") {
        changePriority(id);
        return;
    }

    if (action === "status") {
        changeStatus(id);
    }
}


async function loadClients() {
    try {
        const response = await fetch(
            `${API_URL}/clientes?pagina=0&tamanho=100`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const data =
            await processResponse(
                response
            );

        clients =
            Array.isArray(data.content)
                ? data.content.filter(
                    client =>
                        client.ativo !== false
                )
                : [];

        fillClientSelect();

    } catch (error) {
        console.error(
            "Erro ao carregar clientes:",
            error
        );
    }
}


async function loadTechnicians() {
    try {
        const response = await fetch(
            `${API_URL}/funcionarios?pagina=0&tamanho=100`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const data =
            await processResponse(
                response
            );

        technicians =
            Array.isArray(data.content)
                ? data.content.filter(
                    employee =>
                        employee.cargo ===
                            "TECNICO" &&
                        employee.status ===
                            "ATIVO"
                )
                : [];

        fillTechnicianSelect();

    } catch (error) {
        console.error(
            "Erro ao carregar técnicos:",
            error
        );
    }
}


function fillClientSelect() {
    ticketClientInput.innerHTML = `
        <option value="">
            Selecione um cliente
        </option>
    `;

    clients.forEach(client => {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            client.id;

        option.textContent =
            client.nome;

        ticketClientInput.appendChild(
            option
        );
    });
}


function fillTechnicianSelect() {
    ticketTechnicianInput.innerHTML = `
        <option value="">
            Nenhum técnico atribuído
        </option>
    `;

    technicians.forEach(
        technician => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                technician.id;

            option.textContent =
                technician.nome;

            ticketTechnicianInput
                .appendChild(option);
        }
    );
}


function openCreateModal() {
    selectedTicketId = null;

    clearForm();

    modalTitle.textContent =
        "Novo chamado";

    saveButton.textContent =
        "Salvar chamado";

    openTicketModal();

    ticketTitleInput.focus();
}


async function openEditModal(id) {
    selectedTicketId = id;

    clearForm();

    modalTitle.textContent =
        "Editar chamado";

    saveButton.textContent =
        "Salvar alterações";

    openTicketModal();

    showModalMessage(
        "Carregando chamado...",
        "success"
    );

    setFormDisabled(true);

    try {
        const response = await fetch(
            `${API_URL}/chamados/${id}`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        const ticket =
            await processResponse(
                response
            );

        ticketIdInput.value =
            ticket.id;

        ticketTitleInput.value =
            ticket.titulo || "";

        ticketDescriptionInput.value =
            ticket.descricao || "";

        ticketClientInput.value =
            ticket.clienteId || "";

        ticketPriorityInput.value =
            ticket.prioridade || "";

        ticketTechnicianInput.value =
            ticket.tecnicoResponsavelId ||
            "";

        hideModalMessage();

    } catch (error) {
        showModalMessage(
            error.message,
            "error"
        );

    } finally {
        setFormDisabled(false);
    }
}


async function saveTicket(event) {
    event.preventDefault();

    clearFieldErrors();
    hideModalMessage();

    const data = {
        titulo:
            ticketTitleInput.value
                .trim(),

        descricao:
            ticketDescriptionInput.value
                .trim(),

        prioridade:
            ticketPriorityInput.value,

        clienteId:
            ticketClientInput.value
                ? Number(
                    ticketClientInput
                        .value
                )
                : null,

        tecnicoResponsavelId:
            ticketTechnicianInput.value
                ? Number(
                    ticketTechnicianInput
                        .value
                )
                : null
    };

    if (!validateForm(data)) {
        showModalMessage(
            "Verifique os campos destacados.",
            "error"
        );

        return;
    }

    const editing =
        selectedTicketId !== null;

    const url =
        editing
            ? `${API_URL}/chamados/${selectedTicketId}`
            : `${API_URL}/chamados`;

    const method =
        editing
            ? "PUT"
            : "POST";

    setSaveButtonLoading(true);

    try {
        const response = await fetch(
            url,
            {
                method,
                headers: getHeaders(),
                body: JSON.stringify(
                    data
                )
            }
        );

        await processResponse(response);

        closeTicketModal();

        showPageMessage(
            editing
                ? "Chamado atualizado com sucesso."
                : "Chamado cadastrado com sucesso.",
            "success"
        );

        currentPage = 0;

        await loadTickets();

    } catch (error) {
        showModalMessage(
            error.message,
            "error"
        );

    } finally {
        setSaveButtonLoading(false);
    }
}


function validateForm(data) {
    let valid = true;

    if (!data.titulo) {
        setFieldError(
            ticketTitleInput,
            "ticket-title-error",
            "O título é obrigatório."
        );

        valid = false;
    }

    if (!data.descricao) {
        setFieldError(
            ticketDescriptionInput,
            "ticket-description-error",
            "A descrição é obrigatória."
        );

        valid = false;
    }

    if (!data.clienteId) {
        setFieldError(
            ticketClientInput,
            "ticket-client-error",
            "Selecione um cliente."
        );

        valid = false;
    }

    if (!data.prioridade) {
        setFieldError(
            ticketPriorityInput,
            "ticket-priority-error",
            "Selecione uma prioridade."
        );

        valid = false;
    }

    return valid;
}


async function changeTechnician(id) {
    if (technicians.length === 0) {
        alert(
            "Nenhum técnico ativo encontrado."
        );

        return;
    }

    const options =
        technicians.map(
            technician =>
                `${technician.id} - ${technician.nome}`
        ).join("\n");

    const value = prompt(
        `Digite o ID do técnico:\n\n${options}`
    );

    if (value === null) {
        return;
    }

    const technicianId =
        Number(value);

    const validTechnician =
        technicians.some(
            technician =>
                technician.id ===
                    technicianId
        );

    if (
        !technicianId ||
        !validTechnician
    ) {
        alert(
            "Informe um técnico válido."
        );

        return;
    }

    await sendPatch(
        `${API_URL}/chamados/${id}/atribuir-tecnico`,
        {
            tecnicoId: technicianId
        },
        "Técnico atribuído com sucesso."
    );
}


async function changePriority(id) {
    const value = prompt(
        "Digite a prioridade:\nBAIXA, MEDIA, ALTA ou CRITICA"
    );

    if (!value) {
        return;
    }

    const priority =
        value
            .trim()
            .toUpperCase();

    const validPriorities = [
        "BAIXA",
        "MEDIA",
        "ALTA",
        "CRITICA"
    ];

    if (
        !validPriorities.includes(
            priority
        )
    ) {
        alert(
            "Prioridade inválida."
        );

        return;
    }

    await sendPatch(
        `${API_URL}/chamados/${id}/prioridade`,
        {
            prioridade: priority
        },
        "Prioridade alterada com sucesso."
    );
}


async function changeStatus(id) {
    const value = prompt(
        "Digite o status:\nABERTO, EM_ANDAMENTO, CONCLUIDO ou CANCELADO"
    );

    if (!value) {
        return;
    }

    const status =
        value
            .trim()
            .toUpperCase();

    const validStatuses = [
        "ABERTO",
        "EM_ANDAMENTO",
        "CONCLUIDO",
        "CANCELADO"
    ];

    if (
        !validStatuses.includes(
            status
        )
    ) {
        alert(
            "Status inválido."
        );

        return;
    }

    await sendPatch(
        `${API_URL}/chamados/${id}/status`,
        {
            status
        },
        "Status alterado com sucesso."
    );
}


async function sendPatch(
    url,
    body,
    successMessage
) {
    try {
        const response = await fetch(
            url,
            {
                method: "PATCH",
                headers: getHeaders(),
                body: JSON.stringify(
                    body
                )
            }
        );

        await processResponse(response);

        showPageMessage(
            successMessage,
            "success"
        );

        await loadTickets();

    } catch (error) {
        showPageMessage(
            error.message,
            "error"
        );
    }
}


function applyFilters() {
    currentPage = 0;
    loadTickets();
}


function clearFilters() {
    statusFilter.value = "";
    priorityFilter.value = "";
    currentPage = 0;

    loadTickets();
}


function updatePagination(
    page,
    pages,
    total
) {
    currentPage = page;

    const displayedPage =
        pages === 0
            ? 0
            : page + 1;

    paginationInformation.textContent =
        `Página ${displayedPage} de ${pages} · ${total} chamado(s)`;

    previousPageButton.disabled =
        page <= 0;

    nextPageButton.disabled =
        pages === 0 ||
        page >= pages - 1;
}


function loadPreviousPage() {
    if (currentPage <= 0) {
        return;
    }

    currentPage--;

    loadTickets();
}


function loadNextPage() {
    if (
        totalPages === 0 ||
        currentPage >= totalPages - 1
    ) {
        return;
    }

    currentPage++;

    loadTickets();
}


async function processResponse(
    response
) {
    const data =
        await readResponseBody(
            response
        );

    if (response.status === 401) {
        clearAuthentication();
        redirectToLogin();

        throw new Error(
            "Sua sessão expirou."
        );
    }

    if (response.status === 403) {
        throw new Error(
            data.mensagem ||
            data.message ||
            "Você não possui permissão para realizar esta ação."
        );
    }

    if (!response.ok) {
        throw new Error(
            getErrorMessage(data)
        );
    }

    return data;
}


async function readResponseBody(
    response
) {
    const contentType =
        response.headers.get(
            "content-type"
        );

    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {
        return await response.json();
    }

    const text =
        await response.text();

    return text
        ? { mensagem: text }
        : {};
}


function getErrorMessage(data) {
    return (
        data?.mensagem ||
        data?.message ||
        data?.erro ||
        data?.error ||
        "Não foi possível concluir a operação."
    );
}


function formatPriority(priority) {
    const names = {
        BAIXA: "Baixa",
        MEDIA: "Média",
        ALTA: "Alta",
        CRITICA: "Crítica"
    };

    return names[priority] ||
        priority ||
        "-";
}


function formatStatus(status) {
    const names = {
        ABERTO: "Aberto",
        EM_ANDAMENTO:
            "Em andamento",
        CONCLUIDO: "Concluído",
        CANCELADO: "Cancelado"
    };

    return names[status] ||
        status ||
        "-";
}


function getPriorityClass(priority) {
    const classes = {
        BAIXA: "priority-low",
        MEDIA: "priority-medium",
        ALTA: "priority-high",
        CRITICA: "priority-critical"
    };

    return classes[priority] || "";
}


function getStatusClass(status) {
    const classes = {
        ABERTO: "status-open",
        EM_ANDAMENTO:
            "status-progress",
        CONCLUIDO:
            "status-completed",
        CANCELADO:
            "status-cancelled"
    };

    return classes[status] || "";
}


function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (Number.isNaN(
        date.getTime()
    )) {
        return "-";
    }

    return date.toLocaleString(
        "pt-BR"
    );
}


function setFieldError(
    field,
    errorId,
    message
) {
    field.classList.add(
        "input-error"
    );

    const errorElement =
        document.getElementById(
            errorId
        );

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}


function clearFieldErrors() {
    document
        .querySelectorAll(
            ".input-error"
        )
        .forEach(element => {
            element.classList.remove(
                "input-error"
            );
        });

    document
        .querySelectorAll(
            ".field-error"
        )
        .forEach(element => {
            element.textContent = "";
        });
}


function openTicketModal() {
    ticketModal.classList.add(
        "visible"
    );

    ticketModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


function closeTicketModal() {
    ticketModal.classList.remove(
        "visible"
    );

    ticketModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";

    selectedTicketId = null;

    clearForm();
}


function clearForm() {
    ticketForm.reset();

    ticketIdInput.value = "";

    clearFieldErrors();
    hideModalMessage();
}


function setFormDisabled(disabled) {
    ticketForm
        .querySelectorAll(
            "input, textarea, select, button"
        )
        .forEach(element => {
            element.disabled =
                disabled;
        });

    closeModalButton.disabled =
        disabled;
}


function setSaveButtonLoading(
    loading
) {
    saveButton.disabled =
        loading;

    saveButton.textContent =
        loading
            ? "Salvando..."
            : selectedTicketId
                ? "Salvar alterações"
                : "Salvar chamado";
}


function showLoading() {
    loadingContainer.classList.add(
        "visible"
    );

    tableContainer.style.display =
        "none";

    emptyState.classList.remove(
        "visible"
    );
}


function hideLoading() {
    loadingContainer.classList.remove(
        "visible"
    );
}


function showPageMessage(
    message,
    type
) {
    pageMessage.textContent =
        message;

    pageMessage.className =
        `message ${type}`;

    if (type === "success") {
        setTimeout(
            hidePageMessage,
            4000
        );
    }
}


function hidePageMessage() {
    pageMessage.textContent = "";

    pageMessage.className =
        "message";
}


function showModalMessage(
    message,
    type
) {
    modalMessage.textContent =
        message;

    modalMessage.className =
        `modal-message ${type}`;
}


function hideModalMessage() {
    modalMessage.textContent = "";

    modalMessage.className =
        "modal-message";
}


function handlePageError(error) {
    console.error(
        "Erro na página de chamados:",
        error
    );

    tableContainer.style.display =
        "none";

    emptyState.classList.remove(
        "visible"
    );

    paginationInformation.textContent =
        "Página 0 de 0 · 0 chamado(s)";

    previousPageButton.disabled = true;
    nextPageButton.disabled = true;

    showPageMessage(
        error.message ||
        "Não foi possível carregar os chamados.",
        "error"
    );
}


function escapeHtml(value) {
    const element =
        document.createElement("div");

    element.textContent =
        value == null
            ? ""
            : String(value);

    return element.innerHTML;
}


function clearAuthentication() {
    localStorage.removeItem(
        "serviceflow_token"
    );

    localStorage.removeItem(
        "serviceflow_usuario"
    );
}


function logout() {
    clearAuthentication();
    redirectToLogin();
}


function redirectToLogin() {
    window.location.href =
        "../login.html";
}