const formLogin = document.getElementById("form-login");

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const erroEmail = document.getElementById("erro-email");
const erroSenha = document.getElementById("erro-senha");

const mensagemLogin = document.getElementById("mensagem-login");
const botaoLogin = document.getElementById("botao-login");


const URL_LOGIN = `${API_URL}/login`;
const URL_CADASTRO = `${API_URL}/empresas/cadastro`;

verificarUsuarioLogado();

formLogin.addEventListener("submit", realizarLogin);

const botaoDemo = document.getElementById("botao-demo");
botaoDemo.addEventListener("click", entrarNaDemonstracao);

async function entrarNaDemonstracao() {
    limparErros();

    botaoDemo.disabled = true;
    botaoLogin.disabled = true;
    botaoDemo.textContent = "Abrindo demonstração...";

    // Modo demonstração roda só no front-end (js/demo.js): não usa o back-end.
    SF_DEMO.entrar();

    await salvarPerfilDoUsuario(SF_DEMO.TOKEN);

    window.location.href = "./pages/dashboard.html";
}

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

        await salvarPerfilDoUsuario(token);

        mostrarMensagem(
            "Login realizado com sucesso.",
            "success"
        );

        setTimeout(() => {
            window.location.href =
                "./pages/dashboard.html";
        }, 700);

    } catch (erro) {
        const semConexao = erro instanceof TypeError;

        mostrarMensagem(
            semConexao
                ? "Não foi possível conectar ao servidor. " +
                  "Clique em \"Ver demonstração\" para explorar o projeto."
                : (erro.message || "Não foi possível entrar no sistema."),
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

async function verificarUsuarioLogado() {
    const token = localStorage.getItem("serviceflow_token");

    if (!token) {
        return;
    }

    if (window.SF_DEMO && SF_DEMO.ativo()) {
        window.location.href = "./pages/dashboard.html";
        return;
    }

    // Só redireciona se o token ainda for aceito pelo servidor. Token
    // vencido (ou servidor fora do ar) não pode esconder a tela de login.
    try {
        const resposta = await fetch(`${API_URL}/usuarios/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (resposta.ok) {
            window.location.href = "./pages/dashboard.html";
            return;
        }
    } catch (erro) {
        // sem conexão: cai na limpeza abaixo e mostra o login
    }

    localStorage.removeItem("serviceflow_token");
    localStorage.removeItem("serviceflow_usuario");
}

// O endpoint de login devolve apenas o token. Buscamos o perfil para que
// o menu lateral mostre o nome e o cargo corretos já na primeira tela.
async function salvarPerfilDoUsuario(token) {
    try {
        const resposta = await fetch(`${API_URL}/usuarios/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!resposta.ok) {
            return;
        }

        const perfil = await resposta.json();

        localStorage.setItem(
            "serviceflow_usuario",
            JSON.stringify(perfil)
        );
    } catch (erro) {
        // Falha ao buscar o perfil não deve impedir o login.
    }
}
