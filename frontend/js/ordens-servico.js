const API_URL = "http://localhost:8080";
const PAGE_SIZE = 10;

let currentPage = 0;
let totalPages = 0;

let orders = [];
let availableTickets = [];

let selectedOrderId = null;

const ordersTableBody =
    document.getElementById("orders-table-body");

const tableContainer =
    document.getElementById("table-container");

const emptyState =
    document.getElementById("empty-state");

const loadingContainer =
    document.getElementById("loading-container");

const pageMessage =
    document.getElementById("page-message");

const searchInput =
    document.getElementById("search-input");

const statusFilter =
    document.getElementById("status-filter");

const clearFiltersButton =
    document.getElementById("clear-filters-button");

const refreshButton =
    document.getElementById("refresh-button");

const newOrderButton =
    document.getElementById("new-order-button");

const logoutButton =
    document.getElementById("logout-button");

const userName =
    document.getElementById("user-name");

const userRole =
    document.getElementById("user-role");

const userAvatar =
    document.getElementById("user-avatar");

const paginationInformation =
    document.getElementById("pagination-information");

const previousPageButton =
    document.getElementById("previous-page-button");

const nextPageButton =
    document.getElementById("next-page-button");

const createOrderModal =
    document.getElementById("create-order-modal");

const closeCreateModalButton =
    document.getElementById("close-create-modal-button");

const cancelCreateButton =
    document.getElementById("cancel-create-button");

const createOrderForm =
    document.getElementById("create-order-form");

const ticketSelect =
    document.getElementById("ticket-select");

const ticketSelectError =
    document.getElementById("ticket-select-error");

const selectedTicketCard =
    document.getElementById("selected-ticket-card");

const createOrderButton =
    document.getElementById("create-order-button");

const createModalMessage =
    document.getElementById("create-modal-message");

const attendanceModal =
    document.getElementById("attendance-modal");

const closeAttendanceModalButton =
    document.getElementById("close-attendance-modal-button");

const cancelAttendanceButton =
    document.getElementById("cancel-attendance-button");

const attendanceForm =
    document.getElementById("attendance-form");

const attendanceModalDescription =
    document.getElementById("attendance-modal-description");

const attendanceModalMessage =
    document.getElementById("attendance-modal-message");

const orderIdInput =
    document.getElementById("order-id");

const diagnosisInput =
    document.getElementById("diagnosis");

const servicePerformedInput =
    document.getElementById("service-performed");

const observationsInput =
    document.getElementById("observations");

const saveAttendanceButton =
    document.getElementById("save-attendance-button");

const detailsModal =
    document.getElementById("details-modal");

const closeDetailsModalButton =
    document.getElementById("close-details-modal-button");

const closeDetailsButton =
    document.getElementById("close-details-button");

const detailsOrderNumber =
    document.getElementById("details-order-number");

const detailsContent =
    document.getElementById("details-content");

const statusModal =
    document.getElementById("status-modal");

const closeStatusModalButton =
    document.getElementById("close-status-modal-button");

const cancelStatusButton =
    document.getElementById("cancel-status-button");

const statusForm =
    document.getElementById("status-form");

const orderStatusInput =
    document.getElementById("order-status");

const orderStatusError =
    document.getElementById("order-status-error");

const statusModalMessage =
    document.getElementById("status-modal-message");

const saveStatusButton =
    document.getElementById("save-status-button");


document.addEventListener(
    "DOMContentLoaded",
    initializePage
);

newOrderButton.addEventListener(
    "click",
    openCreateOrderModal
);

refreshButton.addEventListener(
    "click",
    refreshOrders
);

clearFiltersButton.addEventListener(
    "click",
    clearFilters
);

statusFilter.addEventListener(
    "change",
    applyStatusFilter
);

searchInput.addEventListener(
    "input",
    applyLocalSearch
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

ordersTableBody.addEventListener(
    "click",
    handleTableAction
);

closeCreateModalButton.addEventListener(
    "click",
    closeCreateOrderModal
);

cancelCreateButton.addEventListener(
    "click",
    closeCreateOrderModal
);

createOrderForm.addEventListener(
    "submit",
    createOrder
);

ticketSelect.addEventListener(
    "change",
    showSelectedTicket
);

closeAttendanceModalButton.addEventListener(
    "click",
    closeAttendanceModal
);

cancelAttendanceButton.addEventListener(
    "click",
    closeAttendanceModal
);

attendanceForm.addEventListener(
    "submit",
    saveAttendance
);

closeDetailsModalButton.addEventListener(
    "click",
    closeDetailsModal
);

closeDetailsButton.addEventListener(
    "click",
    closeDetailsModal
);

closeStatusModalButton.addEventListener(
    "click",
    closeStatusModal
);

cancelStatusButton.addEventListener(
    "click",
    closeStatusModal
);

statusForm.addEventListener(
    "submit",
    saveOrderStatus
);

createOrderModal.addEventListener(
    "click",
    event => {
        if (event.target === createOrderModal) {
            closeCreateOrderModal();
        }
    }
);

attendanceModal.addEventListener(
    "click",
    event => {
        if (event.target === attendanceModal) {
            closeAttendanceModal();
        }
    }
);

detailsModal.addEventListener(
    "click",
    event => {
        if (event.target === detailsModal) {
            closeDetailsModal();
        }
    }
);

statusModal.addEventListener(
    "click",
    event => {
        if (event.target === statusModal) {
            closeStatusModal();
        }
    }
);

document.addEventListener(
    "keydown",
    closeModalsWithEscape
);


async function initializePage() {
    if (!getToken()) {
        redirectToLogin();
        return;
    }

    loadStoredUser();

    await loadOrders();
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
            formatUserRole(user.cargo);

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

    if (!role) {
        return "ServiceFlow";
    }

    return roles[role] ||
        formatText(role);
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


function getAuthenticatedHeaders() {
    return {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };
}


async function loadOrders() {
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

        const response = await fetch(
            `${API_URL}/ordens-servico?${parameters.toString()}`,
            {
                method: "GET",
                headers: getAuthenticatedHeaders()
            }
        );

        const data =
            await processResponse(response);

        orders =
            Array.isArray(data.content)
                ? data.content
                : [];

        totalPages =
            Number(data.totalPages) || 0;

        applyLocalSearch();

        updatePagination(
            data.number ?? currentPage,
            totalPages,
            data.totalElements ?? orders.length
        );

    } catch (error) {
        handlePageError(error);

    } finally {
        hideLoading();
    }
}


function renderOrders(orderList) {
    ordersTableBody.innerHTML = "";

    if (
        !Array.isArray(orderList) ||
        orderList.length === 0
    ) {
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

    orderList.forEach(order => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                <span class="order-number">
                    ${escapeHtml(order.numero || "-")}
                </span>

                <span class="order-date">
                    ${formatDate(order.dataCriacao)}
                </span>
            </td>

            <td>
                <span class="ticket-title">
                    ${escapeHtml(order.chamadoTitulo || "-")}
                </span>

                <span class="secondary-information">
                    Chamado #${escapeHtml(order.chamadoId ?? "-")}
                </span>
            </td>

            <td>
                <span class="client-name">
                    ${escapeHtml(order.clienteNome || "-")}
                </span>
            </td>

            <td>
                <span class="technician-name">
                    ${escapeHtml(
                        order.tecnicoNome ||
                        "Não atribuído"
                    )}
                </span>
            </td>

            <td>
                <span
                    class="status ${getStatusClass(order.status)}"
                >
                    ${formatStatus(order.status)}
                </span>
            </td>

            <td>
                ${formatDate(order.dataCriacao)}
            </td>

            <td>
                <div class="table-actions">

                    <button
                        type="button"
                        class="action-button"
                        data-action="details"
                        data-id="${order.id}"
                    >
                        Detalhes
                    </button>

                    <button
                        type="button"
                        class="action-button primary"
                        data-action="attendance"
                        data-id="${order.id}"
                    >
                        Atendimento
                    </button>

                    <button
                        type="button"
                        class="action-button"
                        data-action="status"
                        data-id="${order.id}"
                    >
                        Status
                    </button>

                </div>
            </td>
        `;

        ordersTableBody.appendChild(row);
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

    const orderId =
        Number(button.dataset.id);

    const action =
        button.dataset.action;

    if (!orderId) {
        return;
    }

    if (action === "details") {
        openOrderDetails(orderId);
        return;
    }

    if (action === "attendance") {
        openAttendanceModal(orderId);
        return;
    }

    if (action === "status") {
        openStatusModal(orderId);
    }
}


function applyLocalSearch() {
    const text =
        searchInput.value
            .trim()
            .toLowerCase();

    if (text === "") {
        renderOrders(orders);
        return;
    }

    const filteredOrders =
        orders.filter(order => {
            const number =
                String(
                    order.numero || ""
                ).toLowerCase();

            const client =
                String(
                    order.clienteNome || ""
                ).toLowerCase();

            const ticket =
                String(
                    order.chamadoTitulo || ""
                ).toLowerCase();

            const technician =
                String(
                    order.tecnicoNome || ""
                ).toLowerCase();

            return (
                number.includes(text) ||
                client.includes(text) ||
                ticket.includes(text) ||
                technician.includes(text)
            );
        });

    renderOrders(filteredOrders);
}


function applyStatusFilter() {
    currentPage = 0;
    searchInput.value = "";

    loadOrders();
}


function clearFilters() {
    searchInput.value = "";
    statusFilter.value = "";

    currentPage = 0;

    loadOrders();
}


function refreshOrders() {
    searchInput.value = "";

    loadOrders();
}


async function openCreateOrderModal() {
    clearCreateForm();

    openModal(createOrderModal);

    showCreateModalMessage(
        "Carregando chamados disponíveis...",
        "success"
    );

    setCreateButtonLoading(true);

    try {
        await loadAvailableTickets();

        hideCreateModalMessage();

        if (availableTickets.length === 0) {
            showCreateModalMessage(
                "Não existem chamados disponíveis. O chamado precisa possuir um técnico e não pode estar concluído ou cancelado.",
                "error"
            );

            return;
        }

        ticketSelect.focus();

    } catch (error) {
        showCreateModalMessage(
            error.message,
            "error"
        );

    } finally {
        setCreateButtonLoading(false);
    }
}


async function loadAvailableTickets() {
    const response = await fetch(
        `${API_URL}/chamados?pagina=0&tamanho=100`,
        {
            method: "GET",
            headers: getAuthenticatedHeaders()
        }
    );

    const data =
        await processResponse(response);

    const tickets =
        Array.isArray(data.content)
            ? data.content
            : [];

    availableTickets =
        tickets.filter(ticket => {
            const statusAllowed =
                ticket.status !== "CONCLUIDO" &&
                ticket.status !== "CANCELADO";

            const hasTechnician =
                ticket.tecnicoResponsavelId != null;

            return (
                statusAllowed &&
                hasTechnician
            );
        });

    fillTicketSelect();
}


function fillTicketSelect() {
    ticketSelect.innerHTML = `
        <option value="">
            Selecione um chamado
        </option>
    `;

    availableTickets.forEach(ticket => {
        const option =
            document.createElement("option");

        option.value =
            ticket.id;

        option.textContent =
            `#${ticket.id} — ${ticket.titulo} — ${ticket.clienteNome}`;

        ticketSelect.appendChild(
            option
        );
    });
}


function showSelectedTicket() {
    const ticketId =
        Number(ticketSelect.value);

    const ticket =
        availableTickets.find(
            item =>
                Number(item.id) === ticketId
        );

    if (!ticket) {
        selectedTicketCard.classList.remove(
            "visible"
        );

        selectedTicketCard.innerHTML = `
            <p>
                Selecione um chamado para ver os detalhes.
            </p>
        `;

        return;
    }

    selectedTicketCard.innerHTML = `
        <h3>
            ${escapeHtml(ticket.titulo)}
        </h3>

        <p>
            <strong>Cliente:</strong>
            ${escapeHtml(ticket.clienteNome || "-")}
        </p>

        <p>
            <strong>Técnico:</strong>
            ${escapeHtml(
                ticket.tecnicoResponsavelNome ||
                "Não atribuído"
            )}
        </p>

        <p>
            <strong>Prioridade:</strong>
            ${formatTicketPriority(ticket.prioridade)}
        </p>

        <p>
            <strong>Status:</strong>
            ${formatTicketStatus(ticket.status)}
        </p>
    `;

    selectedTicketCard.classList.add(
        "visible"
    );
}


async function createOrder(event) {
    event.preventDefault();

    clearCreateFormErrors();
    hideCreateModalMessage();

    const ticketId =
        ticketSelect.value
            ? Number(ticketSelect.value)
            : null;

    if (!ticketId) {
        ticketSelect.classList.add(
            "input-error"
        );

        ticketSelectError.textContent =
            "Selecione um chamado.";

        return;
    }

    setCreateButtonLoading(true);

    try {
        const response = await fetch(
            `${API_URL}/ordens-servico`,
            {
                method: "POST",
                headers:
                    getAuthenticatedHeaders(),

                body: JSON.stringify({
                    chamadoId: ticketId
                })
            }
        );

        await processResponse(response);

        closeCreateOrderModal();

        showPageMessage(
            "Ordem de serviço criada com sucesso.",
            "success"
        );

        currentPage = 0;

        await loadOrders();

    } catch (error) {
        showCreateModalMessage(
            error.message,
            "error"
        );

    } finally {
        setCreateButtonLoading(false);
    }
}


function closeCreateOrderModal() {
    closeModal(createOrderModal);

    clearCreateForm();
}


function clearCreateForm() {
    createOrderForm.reset();

    clearCreateFormErrors();

    hideCreateModalMessage();

    selectedTicketCard.classList.remove(
        "visible"
    );

    selectedTicketCard.innerHTML = `
        <p>
            Selecione um chamado para ver os detalhes.
        </p>
    `;
}


function clearCreateFormErrors() {
    ticketSelect.classList.remove(
        "input-error"
    );

    ticketSelectError.textContent = "";
}


function setCreateButtonLoading(loading) {
    createOrderButton.disabled =
        loading;

    ticketSelect.disabled =
        loading;

    createOrderButton.textContent =
        loading
            ? "Carregando..."
            : "Criar ordem";
}


async function openAttendanceModal(orderId) {
    selectedOrderId = orderId;

    clearAttendanceForm();

    openModal(attendanceModal);

    showAttendanceModalMessage(
        "Carregando dados da ordem...",
        "success"
    );

    setAttendanceFormDisabled(true);

    try {
        const order =
            await getOrderById(orderId);

        orderIdInput.value =
            order.id;

        diagnosisInput.value =
            order.diagnostico || "";

        servicePerformedInput.value =
            order.servicoRealizado || "";

        observationsInput.value =
            order.observacoes || "";

        attendanceModalDescription.textContent =
            `${order.numero || "Ordem"} — ${order.clienteNome || "-"}`;

        hideAttendanceModalMessage();

        diagnosisInput.focus();

    } catch (error) {
        showAttendanceModalMessage(
            error.message,
            "error"
        );

    } finally {
        setAttendanceFormDisabled(false);
    }
}


async function saveAttendance(event) {
    event.preventDefault();

    clearAttendanceErrors();
    hideAttendanceModalMessage();

    const diagnosis =
        diagnosisInput.value.trim();

    const servicePerformed =
        servicePerformedInput.value.trim();

    const observations =
        observationsInput.value.trim();

    let valid = true;

    if (!diagnosis) {
        setFieldError(
            diagnosisInput,
            "diagnosis-error",
            "O diagnóstico é obrigatório."
        );

        valid = false;
    }

    if (!servicePerformed) {
        setFieldError(
            servicePerformedInput,
            "service-performed-error",
            "O serviço realizado é obrigatório."
        );

        valid = false;
    }

    if (!valid) {
        showAttendanceModalMessage(
            "Verifique os campos destacados.",
            "error"
        );

        return;
    }

    setAttendanceButtonLoading(true);

    try {
        const response = await fetch(
            `${API_URL}/ordens-servico/${selectedOrderId}`,
            {
                method: "PUT",
                headers:
                    getAuthenticatedHeaders(),

                body: JSON.stringify({
                    diagnostico:
                        diagnosis,

                    servicoRealizado:
                        servicePerformed,

                    observacoes:
                        observations || null
                })
            }
        );

        await processResponse(response);

        closeAttendanceModal();

        showPageMessage(
            "Atendimento atualizado com sucesso.",
            "success"
        );

        await loadOrders();

    } catch (error) {
        showAttendanceModalMessage(
            error.message,
            "error"
        );

    } finally {
        setAttendanceButtonLoading(false);
    }
}


function closeAttendanceModal() {
    closeModal(attendanceModal);

    selectedOrderId = null;

    clearAttendanceForm();
}


function clearAttendanceForm() {
    attendanceForm.reset();

    orderIdInput.value = "";

    attendanceModalDescription.textContent =
        "Informe o diagnóstico e o serviço realizado.";

    clearAttendanceErrors();

    hideAttendanceModalMessage();
}


function clearAttendanceErrors() {
    diagnosisInput.classList.remove(
        "input-error"
    );

    servicePerformedInput.classList.remove(
        "input-error"
    );

    observationsInput.classList.remove(
        "input-error"
    );

    const diagnosisError =
        document.getElementById(
            "diagnosis-error"
        );

    const serviceError =
        document.getElementById(
            "service-performed-error"
        );

    const observationsError =
        document.getElementById(
            "observations-error"
        );

    if (diagnosisError) {
        diagnosisError.textContent = "";
    }

    if (serviceError) {
        serviceError.textContent = "";
    }

    if (observationsError) {
        observationsError.textContent = "";
    }
}


function setAttendanceFormDisabled(disabled) {
    attendanceForm
        .querySelectorAll(
            "textarea, button"
        )
        .forEach(element => {
            element.disabled =
                disabled;
        });

    closeAttendanceModalButton.disabled =
        disabled;
}


function setAttendanceButtonLoading(loading) {
    saveAttendanceButton.disabled =
        loading;

    saveAttendanceButton.textContent =
        loading
            ? "Salvando..."
            : "Salvar atendimento";
}


async function openOrderDetails(orderId) {
    openModal(detailsModal);

    detailsOrderNumber.textContent =
        "Carregando ordem...";

    detailsContent.innerHTML = `
        <div class="detail-card full-width">
            Carregando detalhes...
        </div>
    `;

    try {
        const order =
            await getOrderById(orderId);

        detailsOrderNumber.textContent =
            order.numero ||
            "Ordem de serviço";

        detailsContent.innerHTML = `
            ${createDetailCard(
                "Status",
                formatStatus(order.status)
            )}

            ${createDetailCard(
                "Chamado",
                order.chamadoTitulo || "-"
            )}

            ${createDetailCard(
                "Cliente",
                order.clienteNome || "-"
            )}

            ${createDetailCard(
                "Técnico",
                order.tecnicoNome ||
                "Não atribuído"
            )}

            ${createDetailCard(
                "Data de criação",
                formatDate(order.dataCriacao)
            )}

            ${createDetailCard(
                "Data de início",
                formatDate(order.dataInicio)
            )}

            ${createDetailCard(
                "Data de finalização",
                formatDate(order.dataFinalizacao)
            )}

            ${createDetailCard(
                "Diagnóstico",
                order.diagnostico ||
                "Não informado",
                true
            )}

            ${createDetailCard(
                "Serviço realizado",
                order.servicoRealizado ||
                "Não informado",
                true
            )}

            ${createDetailCard(
                "Observações",
                order.observacoes ||
                "Não informado",
                true
            )}
        `;

    } catch (error) {
        detailsOrderNumber.textContent =
            "Erro ao carregar ordem";

        detailsContent.innerHTML = `
            <div class="detail-card full-width">
                ${escapeHtml(
                    error.message ||
                    "Não foi possível carregar os detalhes."
                )}
            </div>
        `;
    }
}


function createDetailCard(
    label,
    value,
    fullWidth = false
) {
    return `
        <div
            class="detail-card ${fullWidth ? "full-width" : ""}"
        >
            <span class="detail-label">
                ${escapeHtml(label)}
            </span>

            <div class="detail-value">
                ${escapeHtml(value)}
            </div>
        </div>
    `;
}


function closeDetailsModal() {
    closeModal(detailsModal);

    detailsOrderNumber.textContent =
        "Ordem de serviço";

    detailsContent.innerHTML = "";
}


async function openStatusModal(orderId) {
    selectedOrderId = orderId;

    statusForm.reset();

    clearStatusError();

    hideStatusModalMessage();

    openModal(statusModal);

    showStatusModalMessage(
        "Carregando status da ordem...",
        "success"
    );

    setStatusFormDisabled(true);

    try {
        const order =
            await getOrderById(orderId);

        orderStatusInput.value =
            order.status || "";

        hideStatusModalMessage();

        orderStatusInput.focus();

    } catch (error) {
        showStatusModalMessage(
            error.message,
            "error"
        );

    } finally {
        setStatusFormDisabled(false);
    }
}


async function saveOrderStatus(event) {
    event.preventDefault();

    clearStatusError();
    hideStatusModalMessage();

    const status =
        orderStatusInput.value;

    if (!status) {
        orderStatusInput.classList.add(
            "input-error"
        );

        orderStatusError.textContent =
            "Selecione o novo status.";

        return;
    }

    if (!selectedOrderId) {
        showStatusModalMessage(
            "Ordem de serviço não identificada.",
            "error"
        );

        return;
    }

    setStatusButtonLoading(true);

    try {
        const response = await fetch(
            `${API_URL}/ordens-servico/${selectedOrderId}/status`,
            {
                method: "PATCH",
                headers:
                    getAuthenticatedHeaders(),

                body: JSON.stringify({
                    status
                })
            }
        );

        await processResponse(response);

        closeStatusModal();

        showPageMessage(
            "Status da ordem alterado com sucesso.",
            "success"
        );

        await loadOrders();

    } catch (error) {
        showStatusModalMessage(
            error.message,
            "error"
        );

    } finally {
        setStatusButtonLoading(false);
    }
}


function closeStatusModal() {
    closeModal(statusModal);

    selectedOrderId = null;

    statusForm.reset();

    clearStatusError();

    hideStatusModalMessage();
}


function clearStatusError() {
    orderStatusInput.classList.remove(
        "input-error"
    );

    orderStatusError.textContent = "";
}


function setStatusFormDisabled(disabled) {
    orderStatusInput.disabled =
        disabled;

    saveStatusButton.disabled =
        disabled;

    cancelStatusButton.disabled =
        disabled;

    closeStatusModalButton.disabled =
        disabled;
}


function setStatusButtonLoading(loading) {
    saveStatusButton.disabled =
        loading;

    saveStatusButton.textContent =
        loading
            ? "Alterando..."
            : "Alterar status";
}


async function getOrderById(orderId) {
    const response = await fetch(
        `${API_URL}/ordens-servico/${orderId}`,
        {
            method: "GET",
            headers:
                getAuthenticatedHeaders()
        }
    );

    return await processResponse(
        response
    );
}


function updatePagination(
    page,
    pages,
    total
) {
    currentPage =
        Number(page) || 0;

    const displayedPage =
        pages === 0
            ? 0
            : currentPage + 1;

    paginationInformation.textContent =
        `Página ${displayedPage} de ${pages} · ${total} ordem(ns)`;

    previousPageButton.disabled =
        currentPage <= 0;

    nextPageButton.disabled =
        pages === 0 ||
        currentPage >= pages - 1;
}


function loadPreviousPage() {
    if (currentPage <= 0) {
        return;
    }

    currentPage--;

    searchInput.value = "";

    loadOrders();
}


function loadNextPage() {
    if (
        totalPages === 0 ||
        currentPage >= totalPages - 1
    ) {
        return;
    }

    currentPage++;

    searchInput.value = "";

    loadOrders();
}


async function processResponse(response) {
    const data =
        await readResponseBody(response);

    if (response.status === 401) {
        clearAuthentication();

        redirectToLogin();

        throw new Error(
            "Sua sessão expirou. Entre novamente."
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


async function readResponseBody(response) {
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
    if (!data) {
        return "Não foi possível concluir a operação.";
    }

    if (typeof data === "string") {
        return data;
    }

    if (data.mensagem) {
        return data.mensagem;
    }

    if (data.message) {
        return data.message;
    }

    if (data.erro) {
        return data.erro;
    }

    if (data.error) {
        return data.error;
    }

    if (
        data.erros &&
        typeof data.erros === "object"
    ) {
        return Object.values(
            data.erros
        ).join(" ");
    }

    return "Não foi possível concluir a operação.";
}


function formatStatus(status) {
    const statusNames = {
        ABERTA: "Aberta",
        EM_EXECUCAO: "Em execução",
        FINALIZADA: "Finalizada",
        CANCELADA: "Cancelada"
    };

    return statusNames[status] ||
        status ||
        "-";
}


function getStatusClass(status) {
    const classes = {
        ABERTA: "status-open",
        EM_EXECUCAO: "status-progress",
        FINALIZADA: "status-completed",
        CANCELADA: "status-cancelled"
    };

    return classes[status] || "";
}


function formatTicketPriority(priority) {
    const priorities = {
        BAIXA: "Baixa",
        MEDIA: "Média",
        ALTA: "Alta",
        CRITICA: "Crítica",
        URGENTE: "Urgente"
    };

    return priorities[priority] ||
        priority ||
        "-";
}


function formatTicketStatus(status) {
    const statuses = {
        ABERTO: "Aberto",
        EM_ANDAMENTO: "Em andamento",
        AGUARDANDO_CLIENTE:
            "Aguardando cliente",
        CONCLUIDO: "Concluído",
        CANCELADO: "Cancelado"
    };

    return statuses[status] ||
        status ||
        "-";
}


function formatDate(value) {
    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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


function openModal(modal) {
    modal.classList.add(
        "visible"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";
}


function closeModal(modal) {
    modal.classList.remove(
        "visible"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        !document.querySelector(
            ".modal-overlay.visible"
        )
    ) {
        document.body.style.overflow =
            "";
    }
}


function closeModalsWithEscape(event) {
    if (event.key !== "Escape") {
        return;
    }

    if (
        statusModal.classList.contains(
            "visible"
        )
    ) {
        closeStatusModal();
        return;
    }

    if (
        detailsModal.classList.contains(
            "visible"
        )
    ) {
        closeDetailsModal();
        return;
    }

    if (
        attendanceModal.classList.contains(
            "visible"
        )
    ) {
        closeAttendanceModal();
        return;
    }

    if (
        createOrderModal.classList.contains(
            "visible"
        )
    ) {
        closeCreateOrderModal();
    }
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


function showCreateModalMessage(
    message,
    type
) {
    createModalMessage.textContent =
        message;

    createModalMessage.className =
        `modal-message ${type}`;
}


function hideCreateModalMessage() {
    createModalMessage.textContent = "";

    createModalMessage.className =
        "modal-message";
}


function showAttendanceModalMessage(
    message,
    type
) {
    attendanceModalMessage.textContent =
        message;

    attendanceModalMessage.className =
        `modal-message ${type}`;
}


function hideAttendanceModalMessage() {
    attendanceModalMessage.textContent =
        "";

    attendanceModalMessage.className =
        "modal-message";
}


function showStatusModalMessage(
    message,
    type
) {
    statusModalMessage.textContent =
        message;

    statusModalMessage.className =
        `modal-message ${type}`;
}


function hideStatusModalMessage() {
    statusModalMessage.textContent = "";

    statusModalMessage.className =
        "modal-message";
}


function handlePageError(error) {
    console.error(
        "Erro na página de ordens:",
        error
    );

    tableContainer.style.display =
        "none";

    emptyState.classList.remove(
        "visible"
    );

    paginationInformation.textContent =
        "Página 0 de 0 · 0 ordem(ns)";

    previousPageButton.disabled =
        true;

    nextPageButton.disabled =
        true;

    showPageMessage(
        error.message ||
        "Não foi possível carregar as ordens de serviço.",
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