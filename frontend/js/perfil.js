const API_URL = "http://localhost:8080";

const PROFILE_URL =
    `${API_URL}/usuarios/me`;

const PASSWORD_URL =
    `${API_URL}/usuarios/me/senha`;


/* ELEMENTOS DA PÁGINA */

const loadingContainer =
    document.getElementById(
        "loading-container"
    );

const profileContent =
    document.getElementById(
        "profile-content"
    );

const pageMessage =
    document.getElementById(
        "page-message"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );


/* USUÁRIO DA TOPBAR */

const topbarUserName =
    document.getElementById(
        "topbar-user-name"
    );

const topbarUserRole =
    document.getElementById(
        "topbar-user-role"
    );

const topbarUserAvatar =
    document.getElementById(
        "topbar-user-avatar"
    );


/* CARD DO PERFIL */

const profileAvatar =
    document.getElementById(
        "profile-avatar"
    );

const profileName =
    document.getElementById(
        "profile-name"
    );

const profileEmail =
    document.getElementById(
        "profile-email"
    );

const profileRole =
    document.getElementById(
        "profile-role"
    );

const profileStatus =
    document.getElementById(
        "profile-status"
    );

const profileCompany =
    document.getElementById(
        "profile-company"
    );

const profileId =
    document.getElementById(
        "profile-id"
    );


/* FORMULÁRIO DO PERFIL */

const profileForm =
    document.getElementById(
        "profile-form"
    );

const profileFormMessage =
    document.getElementById(
        "profile-form-message"
    );

const profileNameInput =
    document.getElementById(
        "profile-name-input"
    );

const profileEmailInput =
    document.getElementById(
        "profile-email-input"
    );

const profileNameError =
    document.getElementById(
        "profile-name-error"
    );

const saveProfileButton =
    document.getElementById(
        "save-profile-button"
    );


/* FORMULÁRIO DE SENHA */

const passwordForm =
    document.getElementById(
        "password-form"
    );

const passwordFormMessage =
    document.getElementById(
        "password-form-message"
    );

const currentPasswordInput =
    document.getElementById(
        "current-password"
    );

const newPasswordInput =
    document.getElementById(
        "new-password"
    );

const confirmPasswordInput =
    document.getElementById(
        "confirm-password"
    );

const currentPasswordError =
    document.getElementById(
        "current-password-error"
    );

const newPasswordError =
    document.getElementById(
        "new-password-error"
    );

const confirmPasswordError =
    document.getElementById(
        "confirm-password-error"
    );

const savePasswordButton =
    document.getElementById(
        "save-password-button"
    );


/* EVENTOS */

document.addEventListener(
    "DOMContentLoaded",
    initializePage
);

if (profileForm) {
    profileForm.addEventListener(
        "submit",
        updateProfile
    );
}

if (passwordForm) {
    passwordForm.addEventListener(
        "submit",
        updatePassword
    );
}

if (logoutButton) {
    logoutButton.addEventListener(
        "click",
        logout
    );
}


/* INICIALIZAÇÃO */

function initializePage() {
    if (!getToken()) {
        redirectToLogin();
        return;
    }

    loadStoredUser();
    loadProfile();
}


/* AUTENTICAÇÃO */

function getToken() {
    return localStorage.getItem(
        "serviceflow_token"
    );
}


function getAuthenticatedHeaders() {
    return {
        "Content-Type":
            "application/json",

        "Accept":
            "application/json",

        "Authorization":
            `Bearer ${getToken()}`
    };
}


/* USUÁRIO SALVO NO LOCALSTORAGE */

function loadStoredUser() {
    const storedUserText =
        localStorage.getItem(
            "serviceflow_usuario"
        );

    if (!storedUserText) {
        renderDefaultTopbarUser();
        return;
    }

    try {
        const storedUser =
            JSON.parse(
                storedUserText
            );

        const name =
            storedUser.nome ||
            "Usuário";

        const role =
            formatRole(
                storedUser.cargo
            );

        const initial =
            getInitial(name);

        if (topbarUserName) {
            topbarUserName.textContent =
                name;
        }

        if (topbarUserRole) {
            topbarUserRole.textContent =
                role;
        }

        if (topbarUserAvatar) {
            topbarUserAvatar.textContent =
                initial;
        }

    } catch (error) {
        console.error(
            "Erro ao carregar usuário salvo:",
            error
        );

        localStorage.removeItem(
            "serviceflow_usuario"
        );

        renderDefaultTopbarUser();
    }
}


function renderDefaultTopbarUser() {
    if (topbarUserName) {
        topbarUserName.textContent =
            "Usuário";
    }

    if (topbarUserRole) {
        topbarUserRole.textContent =
            "ServiceFlow";
    }

    if (topbarUserAvatar) {
        topbarUserAvatar.textContent =
            "U";
    }
}


/* CARREGAR PERFIL */

async function loadProfile() {
    hidePageMessage();
    showLoading();

    let loadedSuccessfully =
        false;

    try {
        const response = await fetch(
            PROFILE_URL,
            {
                method: "GET",

                headers:
                    getAuthenticatedHeaders()
            }
        );

        const user =
            await processResponse(
                response
            );

        renderProfile(user);
        fillProfileForm(user);
        updateStoredUser(user);

        loadedSuccessfully =
            true;

    } catch (error) {
        console.error(
            "Erro ao carregar perfil:",
            error
        );

        showPageMessage(
            error.message ||
            "Não foi possível carregar seus dados.",
            "error"
        );

    } finally {
        hideLoading(
            loadedSuccessfully
        );
    }
}


/* RENDERIZAR PERFIL */

function renderProfile(user) {
    const name =
        user?.nome ||
        "Usuário";

    const email =
        user?.email ||
        "-";

    const role =
        formatRole(
            user?.cargo
        );

    const initial =
        getInitial(name);

    if (profileAvatar) {
        profileAvatar.textContent =
            initial;
    }

    if (profileName) {
        profileName.textContent =
            name;
    }

    if (profileEmail) {
        profileEmail.textContent =
            email;
    }

    if (profileRole) {
        profileRole.textContent =
            role;
    }

    if (profileCompany) {
        profileCompany.textContent =
            getCompanyName(user);
    }

    if (profileId) {
        profileId.textContent =
            user?.id ?? "-";
    }

    renderStatus(
        user?.status
    );

    if (topbarUserName) {
        topbarUserName.textContent =
            name;
    }

    if (topbarUserRole) {
        topbarUserRole.textContent =
            role;
    }

    if (topbarUserAvatar) {
        topbarUserAvatar.textContent =
            initial;
    }
}


function getCompanyName(user) {
    if (!user) {
        return "-";
    }

    if (user.empresaNome) {
        return user.empresaNome;
    }

    if (
        user.empresa &&
        typeof user.empresa === "object"
    ) {
        return (
            user.empresa.nome ||
            user.empresa.razaoSocial ||
            `Empresa #${user.empresa.id ?? "-"}`
        );
    }

    if (user.empresaId) {
        return `Empresa #${user.empresaId}`;
    }

    return "-";
}


function fillProfileForm(user) {
    if (profileNameInput) {
        profileNameInput.value =
            user?.nome || "";
    }

    if (profileEmailInput) {
        profileEmailInput.value =
            user?.email || "";
    }
}


function renderStatus(status) {
    if (!profileStatus) {
        return;
    }

    profileStatus.textContent =
        formatText(status);

    profileStatus.className =
        "status-badge";

    if (status === "ATIVO") {
        profileStatus.classList.add(
            "active"
        );

        return;
    }

    profileStatus.classList.add(
        "inactive"
    );
}


/* ATUALIZAR PERFIL */

async function updateProfile(event) {
    event.preventDefault();

    clearProfileErrors();
    hideProfileFormMessage();

    const name =
        profileNameInput.value.trim();

    let valid =
        true;

    if (name.length < 3) {
        setFieldError(
            profileNameInput,
            profileNameError,
            "O nome deve possuir pelo menos 3 caracteres."
        );

        valid =
            false;
    }

    if (name.length > 120) {
        setFieldError(
            profileNameInput,
            profileNameError,
            "O nome deve possuir no máximo 120 caracteres."
        );

        valid =
            false;
    }

    if (!valid) {
        showProfileFormMessage(
            "Verifique os campos destacados.",
            "error"
        );

        return;
    }

    setProfileButtonLoading(
        true
    );

    try {
        const response = await fetch(
            PROFILE_URL,
            {
                method: "PUT",

                headers:
                    getAuthenticatedHeaders(),

                body: JSON.stringify({
                    nome: name
                })
            }
        );

        const user =
            await processResponse(
                response
            );

        renderProfile(user);
        fillProfileForm(user);
        updateStoredUser(user);

        showProfileFormMessage(
            "Perfil atualizado com sucesso.",
            "success"
        );

    } catch (error) {
        console.error(
            "Erro ao atualizar perfil:",
            error
        );

        showProfileFormMessage(
            error.message ||
            "Não foi possível atualizar o perfil.",
            "error"
        );

    } finally {
        setProfileButtonLoading(
            false
        );
    }
}


/* ATUALIZAR SENHA */

async function updatePassword(event) {
    event.preventDefault();

    clearPasswordErrors();
    hidePasswordFormMessage();

    const currentPassword =
        currentPasswordInput.value;

    const newPassword =
        newPasswordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;

    let valid =
        true;

    if (!currentPassword) {
        setFieldError(
            currentPasswordInput,
            currentPasswordError,
            "Informe sua senha atual."
        );

        valid =
            false;
    }

    if (!newPassword) {
        setFieldError(
            newPasswordInput,
            newPasswordError,
            "Informe a nova senha."
        );

        valid =
            false;

    } else if (
        newPassword.length < 6
    ) {
        setFieldError(
            newPasswordInput,
            newPasswordError,
            "A nova senha deve possuir pelo menos 6 caracteres."
        );

        valid =
            false;
    }

    if (!confirmPassword) {
        setFieldError(
            confirmPasswordInput,
            confirmPasswordError,
            "Confirme a nova senha."
        );

        valid =
            false;

    } else if (
        newPassword !==
        confirmPassword
    ) {
        setFieldError(
            confirmPasswordInput,
            confirmPasswordError,
            "As senhas não são iguais."
        );

        valid =
            false;
    }

    if (
        currentPassword &&
        newPassword &&
        currentPassword === newPassword
    ) {
        setFieldError(
            newPasswordInput,
            newPasswordError,
            "A nova senha deve ser diferente da senha atual."
        );

        valid =
            false;
    }

    if (!valid) {
        showPasswordFormMessage(
            "Verifique os campos destacados.",
            "error"
        );

        return;
    }

    setPasswordButtonLoading(
        true
    );

    try {
        const response = await fetch(
            PASSWORD_URL,
            {
                method: "PATCH",

                headers:
                    getAuthenticatedHeaders(),

                body: JSON.stringify({
                    senhaAtual:
                        currentPassword,

                    novaSenha:
                        newPassword
                })
            }
        );

        const data =
            await processResponse(
                response
            );

        passwordForm.reset();

        showPasswordFormMessage(
            data?.mensagem ||
            "Senha alterada com sucesso.",
            "success"
        );

    } catch (error) {
        console.error(
            "Erro ao alterar senha:",
            error
        );

        showPasswordFormMessage(
            error.message ||
            "Não foi possível alterar a senha.",
            "error"
        );

    } finally {
        setPasswordButtonLoading(
            false
        );
    }
}


/* ATUALIZAR LOCALSTORAGE */

function updateStoredUser(user) {
    const currentStoredUserText =
        localStorage.getItem(
            "serviceflow_usuario"
        );

    let storedUser = {};

    if (currentStoredUserText) {
        try {
            storedUser =
                JSON.parse(
                    currentStoredUserText
                );

        } catch (error) {
            storedUser = {};
        }
    }

    storedUser.id =
        user?.id ??
        storedUser.id;

    storedUser.nome =
        user?.nome ??
        storedUser.nome;

    storedUser.email =
        user?.email ??
        storedUser.email;

    storedUser.cargo =
        user?.cargo ??
        storedUser.cargo;

    storedUser.status =
        user?.status ??
        storedUser.status;

    storedUser.empresaId =
        user?.empresaId ??
        user?.empresa?.id ??
        storedUser.empresaId;

    storedUser.empresaNome =
        user?.empresaNome ??
        user?.empresa?.nome ??
        user?.empresa?.razaoSocial ??
        storedUser.empresaNome;

    localStorage.setItem(
        "serviceflow_usuario",
        JSON.stringify(
            storedUser
        )
    );
}


/* PROCESSAR RESPOSTAS */

async function processResponse(response) {
    const data =
        await readResponseBody(
            response
        );

    if (response.status === 401) {
        clearAuthentication();
        redirectToLogin();

        throw new Error(
            "Sua sessão expirou. Entre novamente."
        );
    }

    if (response.status === 403) {
        throw new Error(
            data?.mensagem ||
            data?.message ||
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
        try {
            return await response.json();

        } catch (error) {
            return {};
        }
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


/* ERROS DOS CAMPOS */

function setFieldError(
    field,
    errorElement,
    message
) {
    if (field) {
        field.classList.add(
            "input-error"
        );
    }

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}


function clearProfileErrors() {
    if (profileNameInput) {
        profileNameInput.classList.remove(
            "input-error"
        );
    }

    if (profileNameError) {
        profileNameError.textContent =
            "";
    }
}


function clearPasswordErrors() {
    const passwordFields = [
        currentPasswordInput,
        newPasswordInput,
        confirmPasswordInput
    ];

    passwordFields.forEach(
        field => {
            if (field) {
                field.classList.remove(
                    "input-error"
                );
            }
        }
    );

    if (currentPasswordError) {
        currentPasswordError.textContent =
            "";
    }

    if (newPasswordError) {
        newPasswordError.textContent =
            "";
    }

    if (confirmPasswordError) {
        confirmPasswordError.textContent =
            "";
    }
}


/* ESTADO DOS BOTÕES */

function setProfileButtonLoading(loading) {
    if (!saveProfileButton) {
        return;
    }

    saveProfileButton.disabled =
        loading;

    saveProfileButton.textContent =
        loading
            ? "Salvando..."
            : "Salvar alterações";
}


function setPasswordButtonLoading(loading) {
    if (!savePasswordButton) {
        return;
    }

    savePasswordButton.disabled =
        loading;

    savePasswordButton.textContent =
        loading
            ? "Alterando..."
            : "Alterar senha";
}


/* CARREGAMENTO */

function showLoading() {
    if (loadingContainer) {
        loadingContainer.classList.add(
            "visible"
        );
    }

    if (profileContent) {
        profileContent.classList.add(
            "hidden"
        );
    }
}


function hideLoading(showContent = true) {
    if (loadingContainer) {
        loadingContainer.classList.remove(
            "visible"
        );
    }

    if (
        showContent &&
        profileContent
    ) {
        profileContent.classList.remove(
            "hidden"
        );
    }
}


/* MENSAGENS DA PÁGINA */

function showPageMessage(
    message,
    type
) {
    if (!pageMessage) {
        return;
    }

    pageMessage.textContent =
        message;

    pageMessage.className =
        `page-message ${type}`;
}


function hidePageMessage() {
    if (!pageMessage) {
        return;
    }

    pageMessage.textContent =
        "";

    pageMessage.className =
        "page-message";
}


/* MENSAGENS DO FORMULÁRIO DE PERFIL */

function showProfileFormMessage(
    message,
    type
) {
    if (!profileFormMessage) {
        return;
    }

    profileFormMessage.textContent =
        message;

    profileFormMessage.className =
        `form-message ${type}`;

    if (type === "success") {
        setTimeout(
            hideProfileFormMessage,
            4000
        );
    }
}


function hideProfileFormMessage() {
    if (!profileFormMessage) {
        return;
    }

    profileFormMessage.textContent =
        "";

    profileFormMessage.className =
        "form-message";
}


/* MENSAGENS DO FORMULÁRIO DE SENHA */

function showPasswordFormMessage(
    message,
    type
) {
    if (!passwordFormMessage) {
        return;
    }

    passwordFormMessage.textContent =
        message;

    passwordFormMessage.className =
        `form-message ${type}`;

    if (type === "success") {
        setTimeout(
            hidePasswordFormMessage,
            4000
        );
    }
}


function hidePasswordFormMessage() {
    if (!passwordFormMessage) {
        return;
    }

    passwordFormMessage.textContent =
        "";

    passwordFormMessage.className =
        "form-message";
}


/* FORMATAÇÃO */

function formatRole(role) {
    const roles = {
        ADMIN: "Administrador",
        ATENDENTE: "Atendente",
        TECNICO: "Técnico"
    };

    if (!role) {
        return "ServiceFlow";
    }

    return (
        roles[role] ||
        formatText(role)
    );
}


function formatText(value) {
    if (!value) {
        return "-";
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


function getInitial(name) {
    const normalizedName =
        String(name || "").trim();

    if (!normalizedName) {
        return "U";
    }

    return normalizedName
        .charAt(0)
        .toUpperCase();
}


/* LOGOUT */

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