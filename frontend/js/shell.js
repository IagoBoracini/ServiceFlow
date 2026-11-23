/*
 * Estrutura comum do app (menu lateral).
 * Centraliza em um só lugar a lista de páginas do menu, o item ativo,
 * o botão de recolher e o menu mobile — antes repetidos em cada HTML.
 * Mantém os ids usados pelos scripts de cada página.
 */
(function () {
    "use strict";

    const ICONES = {
        dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
        clientes: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5a3 3 0 0 1 0 6M18.5 14.8c1.5.8 2.5 2.4 2.5 5.2"/>',
        funcionarios: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
        chamados: '<path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3z"/><path d="M14 6v12" stroke-dasharray="2 2.5"/>',
        ordens: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
        conta: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>',
        sair: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="M16 8l4 4-4 4M20 12H9"/>',
        voltar: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
        recolher: '<path d="m13 6-6 6 6 6M19 6l-6 6 6 6"/>'
    };

    const ITENS = [
        { arquivo: "dashboard.html", rotulo: "Dashboard", icone: "dashboard" },
        { arquivo: "clientes.html", rotulo: "Clientes", icone: "clientes" },
        { arquivo: "funcionarios.html", rotulo: "Funcionários", icone: "funcionarios", tambem: ["pendentes.html"] },
        { arquivo: "chamados.html", rotulo: "Chamados", icone: "chamados" },
        { arquivo: "ordens-servico.html", rotulo: "Ordens de serviço", icone: "ordens" },
        { arquivo: "perfil.html", rotulo: "Minha conta", icone: "conta" }
    ];

    const CHAVE_RECOLHIDO = "serviceflow_menu_recolhido";

    function svg(nome) {
        return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" ' +
            'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            ICONES[nome] + "</svg>";
    }

    function arquivoAtual() {
        const partes = window.location.pathname.split("/");
        return partes[partes.length - 1] || "dashboard.html";
    }

    function montarMenu(sidebar) {
        const nav = sidebar.querySelector(".sidebar-menu");
        if (!nav) return;

        const atual = arquivoAtual();

        nav.innerHTML = ITENS.map(item => {
            const ativo = item.arquivo === atual || (item.tambem || []).includes(atual);
            return '<a href="' + item.arquivo + '" class="menu-item' + (ativo ? " active" : "") + '"' +
                (ativo ? ' aria-current="page"' : "") + ">" +
                '<span class="menu-icon">' + svg(item.icone) + "</span>" +
                "<span>" + item.rotulo + "</span></a>";
        }).join("");
    }

    function trocarIconesDoRodape(sidebar) {
        // botões de saída têm ids diferentes por página: identifica pelo texto
        sidebar.querySelectorAll(".logout-button").forEach(botao => {
            if (/sair/i.test(botao.textContent)) {
                botao.innerHTML = '<span class="sf-ico">' + svg("sair") + "</span><span>Sair</span>";
            }
        });

        const voltar = sidebar.querySelector("#botaoVoltar");
        if (voltar) {
            voltar.innerHTML = '<span class="sf-ico">' + svg("voltar") + "</span><span>Voltar</span>";
        }
    }

    function adicionarBotaoRecolher(sidebar) {
        const rodape = sidebar.querySelector(".sidebar-footer");
        if (!rodape) return;

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "sf-collapse";
        botao.setAttribute("aria-label", "Recolher ou expandir o menu");
        botao.innerHTML = '<span class="sf-ico">' + svg("recolher") + "</span><span>Recolher menu</span>";
        rodape.insertBefore(botao, rodape.firstChild);

        try {
            if (localStorage.getItem(CHAVE_RECOLHIDO) === "1") {
                document.body.classList.add("sf-collapsed");
            }
        } catch (e) { /* sem acesso ao armazenamento: segue expandido */ }

        botao.addEventListener("click", () => {
            const recolhido = document.body.classList.toggle("sf-collapsed");
            try {
                localStorage.setItem(CHAVE_RECOLHIDO, recolhido ? "1" : "0");
            } catch (e) { /* ignora */ }
        });
    }

    // Só o dashboard tinha botão/overlay do menu mobile; nas demais páginas
    // o menu ficava inacessível em telas pequenas. Aqui garantimos para todas.
    const ICONE_MENU = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';

    function garantirMenuMobile(sidebar) {
        const existente = document.getElementById("menu-button");
        if (existente) {
            existente.innerHTML = ICONE_MENU;   // mesmo ícone em todas as páginas
            existente.style.placeItems = "center";
            return;
        }

        const topbar = document.querySelector(".topbar");
        if (!topbar) return;

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "menu-button";
        botao.id = "menu-button";
        botao.setAttribute("aria-label", "Abrir menu");
        botao.setAttribute("aria-controls", "sidebar");
        botao.innerHTML = ICONE_MENU;
        botao.style.placeItems = "center";

        const alvo = topbar.querySelector(".topbar-left") || topbar;
        alvo.insertBefore(botao, alvo.firstChild);

        let overlay = document.getElementById("sidebar-overlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "sidebar-overlay";
            overlay.id = "sidebar-overlay";
            sidebar.insertAdjacentElement("afterend", overlay);
        }

        const abrir = () => { sidebar.classList.add("open"); overlay.classList.add("active"); };
        const fechar = () => { sidebar.classList.remove("open"); overlay.classList.remove("active"); };

        botao.addEventListener("click", abrir);
        overlay.addEventListener("click", fechar);
        document.addEventListener("keydown", e => { if (e.key === "Escape") fechar(); });
        sidebar.addEventListener("click", e => { if (e.target.closest(".menu-item, #close-sidebar")) fechar(); });
    }

    function iniciar() {
        // algumas páginas não tinham id no menu lateral
        const sidebar = document.getElementById("sidebar") || document.querySelector("aside.sidebar");
        if (!sidebar) return;
        if (!sidebar.id) sidebar.id = "sidebar";

        montarMenu(sidebar);
        trocarIconesDoRodape(sidebar);
        adicionarBotaoRecolher(sidebar);
        garantirMenuMobile(sidebar);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }
})();
