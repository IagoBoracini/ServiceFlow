const API_URL = "https://serviceflow-production-a083.up.railway.app";


const registerForm =
    document.getElementById("register-form");

const registerButton =
    document.getElementById("register-button");

const registerMessage =
    document.getElementById("register-message");


const nomeInput =
    document.getElementById("nome");

const emailInput =
    document.getElementById("email");

const empresaInput =
    document.getElementById("empresa");

const cnpjInput =
    document.getElementById("cnpj");

const telefoneEmpresaInput =
    document.getElementById("telefone-empresa");

const emailEmpresaInput =
    document.getElementById("email-empresa");

const senhaInput =
    document.getElementById("senha");

const confirmarSenhaInput =
    document.getElementById("confirmar-senha");

const termosInput =
    document.getElementById("termos");

const passwordButtons =
    document.querySelectorAll(".show-password");


registerForm.addEventListener(
    "submit",
    realizarCadastro
);


passwordButtons.forEach((button) => {

    button.addEventListener(
        "click",
        alternarVisibilidadeSenha
    );
});


cnpjInput.addEventListener(
    "input",
    aplicarMascaraCnpj
);


telefoneEmpresaInput.addEventListener(
    "input",
    aplicarMascaraTelefone
);


async function realizarCadastro(evento) {

    evento.preventDefault();

    limparErros();

    const dadosCadastro =
        obterDadosFormulario();

    const formularioValido =
        validarFormulario(dadosCadastro);

    if (!formularioValido) {

        mostrarMensagem(
            "Verifique os campos destacados.",
            "error"
        );

        return;
    }

    mostrarCarregamento();

    const dadosParaBackend = {

        nomeEmpresa:
            dadosCadastro.nomeEmpresa,

        cnpj:
            dadosCadastro.cnpj,

        telefoneEmpresa:
            dadosCadastro.telefoneEmpresa,

        emailEmpresa:
            dadosCadastro.emailEmpresa,

        nomeAdministrador:
            dadosCadastro.nomeAdministrador,

        emailAdministrador:
            dadosCadastro.emailAdministrador,

        senhaAdministrador:
            dadosCadastro.senhaAdministrador
    };

    try {

        const resposta = await fetch(
            URL_CADASTRO,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"
                },

                body: JSON.stringify(
                    dadosParaBackend
                )
            }
        );

        const dadosResposta =
            await lerResposta(resposta);

        if (!resposta.ok) {

            const mensagemErro =
                obterMensagemErro(
                    dadosResposta
                );

            throw new Error(
                mensagemErro
            );
        }

        mostrarMensagem(
            "Empresa e administrador cadastrados com sucesso! Você será direcionado para o login.",
            "success"
        );

        registerForm.reset();

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 2000);

    } catch (erro) {

        console.error(
            "Erro no cadastro:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Não foi possível realizar o cadastro.",
            "error"
        );

    } finally {

        finalizarCarregamento();
    }
}


function obterDadosFormulario() {

    return {

        nomeAdministrador:
            nomeInput.value.trim(),

        emailAdministrador:
            emailInput.value
                .trim()
                .toLowerCase(),

        nomeEmpresa:
            empresaInput.value.trim(),

        cnpj:
            cnpjInput.value.trim(),

        telefoneEmpresa:
            telefoneEmpresaInput.value.trim(),

        emailEmpresa:
            emailEmpresaInput.value
                .trim()
                .toLowerCase(),

        senhaAdministrador:
            senhaInput.value,

        confirmarSenha:
            confirmarSenhaInput.value,

        termos:
            termosInput.checked
    };
}


function validarFormulario(dados) {

    let formularioValido = true;


    if (dados.nomeAdministrador === "") {

        definirErro(
            nomeInput,
            "nome-error",
            "Informe o nome do administrador."
        );

        formularioValido = false;

    } else if (
        dados.nomeAdministrador.length < 3
    ) {

        definirErro(
            nomeInput,
            "nome-error",
            "O nome deve possuir pelo menos 3 caracteres."
        );

        formularioValido = false;
    }


    if (dados.emailAdministrador === "") {

        definirErro(
            emailInput,
            "email-error",
            "Informe o e-mail do administrador."
        );

        formularioValido = false;

    } else if (
        !validarEmail(
            dados.emailAdministrador
        )
    ) {

        definirErro(
            emailInput,
            "email-error",
            "Digite um e-mail válido."
        );

        formularioValido = false;
    }


    if (dados.nomeEmpresa === "") {

        definirErro(
            empresaInput,
            "empresa-error",
            "Informe o nome da empresa."
        );

        formularioValido = false;

    } else if (
        dados.nomeEmpresa.length < 2
    ) {

        definirErro(
            empresaInput,
            "empresa-error",
            "O nome da empresa deve possuir pelo menos 2 caracteres."
        );

        formularioValido = false;
    }


    if (dados.cnpj === "") {

        definirErro(
            cnpjInput,
            "cnpj-error",
            "Informe o CNPJ da empresa."
        );

        formularioValido = false;

    } else if (
        obterSomenteNumeros(
            dados.cnpj
        ).length !== 14
    ) {

        definirErro(
            cnpjInput,
            "cnpj-error",
            "O CNPJ deve possuir 14 números."
        );

        formularioValido = false;
    }


    if (
        dados.telefoneEmpresa !== "" &&
        obterSomenteNumeros(
            dados.telefoneEmpresa
        ).length < 10
    ) {

        definirErro(
            telefoneEmpresaInput,
            "telefone-empresa-error",
            "Digite um telefone válido."
        );

        formularioValido = false;
    }


    if (dados.emailEmpresa === "") {

        definirErro(
            emailEmpresaInput,
            "email-empresa-error",
            "Informe o e-mail da empresa."
        );

        formularioValido = false;

    } else if (
        !validarEmail(
            dados.emailEmpresa
        )
    ) {

        definirErro(
            emailEmpresaInput,
            "email-empresa-error",
            "Digite um e-mail válido para a empresa."
        );

        formularioValido = false;
    }


    if (dados.senhaAdministrador === "") {

        definirErro(
            senhaInput,
            "senha-error",
            "Informe uma senha."
        );

        formularioValido = false;

    } else if (
        dados.senhaAdministrador.length < 6
    ) {

        definirErro(
            senhaInput,
            "senha-error",
            "A senha deve possuir pelo menos 6 caracteres."
        );

        formularioValido = false;
    }


    if (dados.confirmarSenha === "") {

        definirErro(
            confirmarSenhaInput,
            "confirmar-senha-error",
            "Confirme sua senha."
        );

        formularioValido = false;

    } else if (
        dados.senhaAdministrador !==
        dados.confirmarSenha
    ) {

        definirErro(
            confirmarSenhaInput,
            "confirmar-senha-error",
            "As senhas não são iguais."
        );

        formularioValido = false;
    }


    if (!dados.termos) {

        document.getElementById(
            "termos-error"
        ).textContent =
            "Você precisa aceitar os termos para continuar.";

        formularioValido = false;
    }


    return formularioValido;
}


function validarEmail(email) {

    const formatoEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return formatoEmail.test(email);
}


function obterSomenteNumeros(valor) {

    return valor.replace(/\D/g, "");
}


function definirErro(
    input,
    errorId,
    mensagem
) {

    input.classList.add(
        "input-error"
    );

    document.getElementById(
        errorId
    ).textContent = mensagem;
}


function limparErros() {

    const inputsComErro =
        document.querySelectorAll(
            ".input-error"
        );

    inputsComErro.forEach((input) => {

        input.classList.remove(
            "input-error"
        );
    });


    const mensagensDeErro =
        document.querySelectorAll(
            ".field-error"
        );

    mensagensDeErro.forEach(
        (mensagem) => {

            mensagem.textContent = "";
        }
    );


    limparMensagem();
}


function mostrarMensagem(
    mensagem,
    tipo
) {

    registerMessage.textContent =
        mensagem;

    registerMessage.className =
        `register-message ${tipo}`;

    registerMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function limparMensagem() {

    registerMessage.textContent = "";

    registerMessage.className =
        "register-message";
}


function mostrarCarregamento() {

    registerButton.disabled = true;

    registerButton.textContent =
        "Criando conta...";
}


function finalizarCarregamento() {

    registerButton.disabled = false;

    registerButton.textContent =
        "Criar conta";
}


function alternarVisibilidadeSenha(evento) {

    const button =
        evento.currentTarget;

    const inputId =
        button.dataset.input;

    const passwordInput =
        document.getElementById(
            inputId
        );

    const senhaEstaOculta =
        passwordInput.type ===
        "password";

    passwordInput.type =
        senhaEstaOculta
            ? "text"
            : "password";

    button.textContent =
        senhaEstaOculta
            ? "🙈"
            : "👁";

    button.setAttribute(
        "aria-label",
        senhaEstaOculta
            ? "Ocultar senha"
            : "Mostrar senha"
    );
}


function aplicarMascaraCnpj(evento) {

    let valor =
        obterSomenteNumeros(
            evento.target.value
        );

    valor = valor.slice(0, 14);

    valor = valor.replace(
        /^(\d{2})(\d)/,
        "$1.$2"
    );

    valor = valor.replace(
        /^(\d{2})\.(\d{3})(\d)/,
        "$1.$2.$3"
    );

    valor = valor.replace(
        /\.(\d{3})(\d)/,
        ".$1/$2"
    );

    valor = valor.replace(
        /(\d{4})(\d)/,
        "$1-$2"
    );

    evento.target.value = valor;
}


function aplicarMascaraTelefone(evento) {

    let valor =
        obterSomenteNumeros(
            evento.target.value
        );

    valor = valor.slice(0, 11);

    if (valor.length <= 10) {

        valor = valor.replace(
            /^(\d{2})(\d)/,
            "($1) $2"
        );

        valor = valor.replace(
            /(\d{4})(\d)/,
            "$1-$2"
        );

    } else {

        valor = valor.replace(
            /^(\d{2})(\d)/,
            "($1) $2"
        );

        valor = valor.replace(
            /(\d{5})(\d)/,
            "$1-$2"
        );
    }

    evento.target.value = valor;
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


function obterMensagemErro(dados) {

    if (!dados) {

        return "Não foi possível realizar o cadastro.";
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


    /*
        Alguns GlobalExceptionHandlers retornam
        os erros dos campos dentro de um objeto.
    */

    if (
        dados.erros &&
        typeof dados.erros === "object"
    ) {

        return Object.values(
            dados.erros
        ).join(" ");
    }


    return "Não foi possível realizar o cadastro.";
}