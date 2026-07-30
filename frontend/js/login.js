const formLogin = document.getElementById("form-login");

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const erroEmail = document.getElementById("erro-email");
const erroSenha = document.getElementById("erro-senha");

const mensagemLogin = document.getElementById("mensagem-login");
const botaoLogin = document.getElementById("botao-login");

const URL_LOGIN = "http://localhost:8080/login";

verificarUsuarioLogado();

formLogin.addEventListener("submit", realizarLogin);

async function realizarLogin(evento) {
    evento.preventDefault();

    limparErros();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    const formularioValido = validarFormulario(email, senha);

    if (!formularioValido) {
        return;
    }

    alterarEstadoCarregamento(true);

    try {
        const resposta = await fetch(URL_LOGIN, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const dados = await lerResposta(resposta);

        if (!resposta.ok) {
            const mensagemErro =
                dados?.mensagem ||
                dados?.erro ||
                "E-mail ou senha inválidos.";

            throw new Error(mensagemErro);
        }

        const token =
            dados.token ||
            dados.accessToken ||
            dados.jwt;

        if (!token) {
            throw new Error(
                "O backend não retornou o token de autenticação."
            );
        }

        localStorage.setItem(
            "serviceflow_token",
            token
        );

        if (dados.usuario) {
            localStorage.setItem(
                "serviceflow_usuario",
                JSON.stringify(dados.usuario)
            );
        }

        mostrarMensagem(
            "Login realizado com sucesso.",
            "success"
        );

        setTimeout(() => {
            window.location.href = "./frontend/pages/dashboard.html";
        }, 700);

    } catch (erro) {
        mostrarMensagem(
            erro.message ||
            "Não foi possível entrar no sistema.",
            "error"
        );

    } finally {
        alterarEstadoCarregamento(false);
    }
}

function validarFormulario(email, senha) {
    let valido = true;

    if (email === "") {
        erroEmail.textContent =
            "Informe seu e-mail.";

        emailInput.classList.add("error");

        valido = false;

    } else if (!emailValido(email)) {
        erroEmail.textContent =
            "Informe um e-mail válido.";

        emailInput.classList.add("error");

        valido = false;
    }

    if (senha === "") {
        erroSenha.textContent =
            "Informe sua senha.";

        senhaInput.classList.add("error");

        valido = false;
    }

    return valido;
}

function emailValido(email) {
    const formatoEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return formatoEmail.test(email);
}

function limparErros() {
    erroEmail.textContent = "";
    erroSenha.textContent = "";

    emailInput.classList.remove("error");
    senhaInput.classList.remove("error");

    mensagemLogin.textContent = "";
    mensagemLogin.className = "login-message";
}

function mostrarMensagem(mensagem, tipo) {
    mensagemLogin.textContent = mensagem;

    mensagemLogin.className =
        `login-message ${tipo}`;
}

function alterarEstadoCarregamento(carregando) {
    botaoLogin.disabled = carregando;

    if (carregando) {
        botaoLogin.textContent =
            "Entrando...";
    } else {
        botaoLogin.textContent =
            "Entrar";
    }
}

async function lerResposta(resposta) {
    const tipoConteudo =
        resposta.headers.get("content-type");

    if (
        tipoConteudo &&
        tipoConteudo.includes("application/json")
    ) {
        return await resposta.json();
    }

    const texto = await resposta.text();

    if (!texto) {
        return {};
    }

    return {
        mensagem: texto
    };
}

function verificarUsuarioLogado() {
const token = localStorage.getItem("token");

if (token) {
    window.location.href =
        "./frontend/pages/dashboard.html";
}
}