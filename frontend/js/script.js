const formulario = document.getElementById("formCadastro");


formulario.addEventListener("submit", function(event){

    event.preventDefault();


    const nome = document.getElementById("usuario").value;
    const email = document.getElementById("email").value;
    const empresa = document.getElementById("empresa").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarsenha").value;


    if(senha !== confirmarSenha){
        alert("As senhas não são iguais!");
        return;
    }


    const usuario = {
        nome: nome,
        email: email,
        empresa: empresa,
        senha: senha
    };


    console.log(usuario);

});