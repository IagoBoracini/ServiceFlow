/*
 * Modo demonstração (somente front-end).
 *
 * Quando o visitante clica em "Ver demonstração", o token especial abaixo é
 * gravado e este arquivo passa a responder as chamadas à API com dados
 * fictícios, sem precisar do back-end. Ao sair (token removido), o modo
 * demo termina sozinho. Alterações (POST/PUT/PATCH/DELETE) são bloqueadas.
 */
(function () {
    "use strict";

    var TOKEN_DEMO = "serviceflow-demo-token";
    var CHAVE_TOKEN = "serviceflow_token";

    function lerToken() {
        try { return localStorage.getItem(CHAVE_TOKEN); } catch (e) { return null; }
    }

    function ativo() {
        return lerToken() === TOKEN_DEMO;
    }

    function entrar() {
        localStorage.setItem(CHAVE_TOKEN, TOKEN_DEMO);
        localStorage.removeItem("serviceflow_usuario");
    }

    window.SF_DEMO = { ativo: ativo, entrar: entrar, TOKEN: TOKEN_DEMO };

    /* ---------------- dados fictícios ---------------- */

    var AGORA = Date.now();
    function quando(dias, horas) {
        var d = new Date(AGORA - dias * 86400000 - (horas || 0) * 3600000);
        return d.toISOString().slice(0, 19);
    }

    var EMPRESA_ID = 1;

    var USUARIOS = [
        { id: 1, nome: "Administrador Demo", email: "demo@serviceflow.app", cargo: "ADMIN", status: "ATIVO" },
        { id: 2, nome: "Carlos Mendes", email: "carlos@demo.serviceflow.app", cargo: "TECNICO", status: "ATIVO" },
        { id: 3, nome: "Fernanda Lima", email: "fernanda@demo.serviceflow.app", cargo: "TECNICO", status: "ATIVO" },
        { id: 4, nome: "Paulo Ribeiro", email: "paulo@demo.serviceflow.app", cargo: "ATENDENTE", status: "ATIVO" }
    ];

    var CLIENTES = [
        { id: 1, nome: "Restaurante Sabor da Praça", documento: "11111111000111", email: "contato@saborpraca.example", telefone: "11911110001", endereco: "Rua das Flores, 120 - São Paulo/SP", ativo: true },
        { id: 2, nome: "Hotel Vista Mar", documento: "22222222000122", email: "manutencao@vistamar.example", telefone: "11911110002", endereco: "Av. Atlântica, 800 - Santos/SP", ativo: true },
        { id: 3, nome: "Padaria Pão Quente", documento: "33333333000133", email: "padaria@paoquente.example", telefone: "11911110003", endereco: "Rua do Comércio, 45 - Osasco/SP", ativo: true },
        { id: 4, nome: "Clínica Bem Viver", documento: "44444444000144", email: "admin@bemviver.example", telefone: "11911110004", endereco: "Rua da Saúde, 300 - São Paulo/SP", ativo: true }
    ];

    function nomeCliente(id) { return CLIENTES.filter(function (c) { return c.id === id; })[0].nome; }
    function nomeUsuario(id) {
        if (!id) { return null; }
        return USUARIOS.filter(function (u) { return u.id === id; })[0].nome;
    }

    function chamado(id, titulo, descricao, prioridade, status, clienteId, tecnicoId, dias, concluido) {
        return {
            id: id, titulo: titulo, descricao: descricao, prioridade: prioridade, status: status,
            dataAbertura: quando(dias), dataConclusao: concluido ? quando(dias - 1) : null,
            clienteId: clienteId, clienteNome: nomeCliente(clienteId),
            tecnicoResponsavelId: tecnicoId, tecnicoResponsavelNome: nomeUsuario(tecnicoId)
        };
    }

    var CHAMADOS = [
        chamado(1, "Máquina de lavar louça não aquece", "A máquina não atinge a temperatura de lavagem durante o serviço.", "ALTA", "EM_ANDAMENTO", 1, 2, 2, false),
        chamado(2, "Manutenção preventiva trimestral", "Revisão programada das máquinas da cozinha.", "BAIXA", "CONCLUIDO", 2, 3, 12, true),
        chamado(3, "Vazamento na entrada de água", "Vazamento visível na conexão de entrada de água da máquina.", "URGENTE", "ABERTO", 3, null, 0, false),
        chamado(4, "Ruído excessivo na bomba", "Ruído alto durante o ciclo de enxágue.", "MEDIA", "AGUARDANDO_CLIENTE", 4, 2, 4, false),
        chamado(5, "Solicitação de orçamento de peças", "Cliente pede orçamento para reposição de peças de desgaste.", "BAIXA", "ABERTO", 2, null, 1, false),
        chamado(6, "Troca de resistência", "Resistência de aquecimento queimada.", "MEDIA", "CONCLUIDO", 1, 3, 9, true)
    ];

    function chamadoPorId(id) { return CHAMADOS.filter(function (c) { return c.id === id; })[0]; }

    var ANO = new Date().getFullYear();

    function ordem(id, codigo, status, chamadoId, tecnicoId, diagnostico, servico, dias) {
        var ch = chamadoPorId(chamadoId);
        return {
            id: id, numero: "OS-" + ANO + "-" + codigo, status: status,
            diagnostico: diagnostico, servicoRealizado: servico, observacoes: null,
            dataCriacao: quando(dias),
            dataInicio: status === "ABERTA" ? null : quando(dias, -2),
            dataFinalizacao: status === "FINALIZADA" ? quando(dias - 1) : null,
            chamadoId: ch.id, chamadoTitulo: ch.titulo,
            clienteId: ch.clienteId, clienteNome: ch.clienteNome,
            tecnicoId: tecnicoId, tecnicoNome: nomeUsuario(tecnicoId)
        };
    }

    var ORDENS = [
        ordem(1, "DEMO0001", "EM_EXECUCAO", 1, 2, "Suspeita de falha na resistência do boiler.", null, 2),
        ordem(2, "DEMO0002", "FINALIZADA", 2, 3, "Equipamento em bom estado geral.", "Limpeza, inspeção e teste de ciclos.", 12),
        ordem(3, "DEMO0003", "ABERTA", 4, 2, null, null, 4),
        ordem(4, "DEMO0004", "FINALIZADA", 6, 3, "Resistência de aquecimento queimada.", "Substituição da resistência e teste de temperatura.", 9)
    ];

    /* ---------------- respostas ---------------- */

    function pagina(lista, params) {
        var tamanho = parseInt(params.get("tamanho"), 10) || 10;
        var atual = parseInt(params.get("pagina"), 10) || 0;
        var total = lista.length;
        var totalPaginas = Math.max(1, Math.ceil(total / tamanho));
        var conteudo = lista.slice(atual * tamanho, atual * tamanho + tamanho);
        return {
            content: conteudo, totalElements: total, totalPages: totalPaginas,
            number: atual, size: tamanho, numberOfElements: conteudo.length,
            first: atual === 0, last: atual >= totalPaginas - 1, empty: conteudo.length === 0
        };
    }

    function contar(lista, campo, valor) {
        return lista.filter(function (i) { return i[campo] === valor; }).length;
    }

    function porIdDesc(a, b) { return b.id - a.id; }

    function dashboard() {
        var recentesChamados = CHAMADOS.slice().sort(function (a, b) {
            return a.dataAbertura < b.dataAbertura ? 1 : -1;
        }).slice(0, 5).map(function (c) {
            return { id: c.id, titulo: c.titulo, status: c.status, prioridade: c.prioridade,
                     clienteNome: c.clienteNome, tecnicoNome: c.tecnicoResponsavelNome, dataAbertura: c.dataAbertura };
        });
        var recentesOrdens = ORDENS.slice().sort(function (a, b) {
            return a.dataCriacao < b.dataCriacao ? 1 : -1;
        }).slice(0, 5).map(function (o) {
            return { id: o.id, numero: o.numero, status: o.status, chamadoTitulo: o.chamadoTitulo,
                     clienteNome: o.clienteNome, tecnicoNome: o.tecnicoNome, dataCriacao: o.dataCriacao };
        });
        return {
            clientes: CLIENTES.length,
            funcionarios: USUARIOS.length - 1,
            tecnicos: contar(USUARIOS, "cargo", "TECNICO"),
            chamadosAbertos: contar(CHAMADOS, "status", "ABERTO"),
            chamadosEmAndamento: contar(CHAMADOS, "status", "EM_ANDAMENTO"),
            chamadosAguardandoCliente: contar(CHAMADOS, "status", "AGUARDANDO_CLIENTE"),
            chamadosConcluidos: contar(CHAMADOS, "status", "CONCLUIDO"),
            chamadosCancelados: contar(CHAMADOS, "status", "CANCELADO"),
            chamadosPrioridadeBaixa: contar(CHAMADOS, "prioridade", "BAIXA"),
            chamadosPrioridadeMedia: contar(CHAMADOS, "prioridade", "MEDIA"),
            chamadosPrioridadeAlta: contar(CHAMADOS, "prioridade", "ALTA"),
            chamadosPrioridadeUrgente: contar(CHAMADOS, "prioridade", "URGENTE"),
            ordensAbertas: contar(ORDENS, "status", "ABERTA"),
            ordensEmExecucao: contar(ORDENS, "status", "EM_EXECUCAO"),
            ordensFinalizadas: contar(ORDENS, "status", "FINALIZADA"),
            ordensCanceladas: contar(ORDENS, "status", "CANCELADA"),
            ultimosChamados: recentesChamados,
            ultimasOrdens: recentesOrdens
        };
    }

    function responder(status, corpo, caminho) {
        var erro = status >= 400;
        var json = erro ? {
            status: status,
            erro: status === 403 ? "Modo demonstração" : "Não encontrado",
            mensagem: corpo,
            caminho: caminho,
            dataHora: quando(0)
        } : corpo;
        return new Response(JSON.stringify(json), {
            status: status,
            headers: { "Content-Type": "application/json" }
        });
    }

    function porId(lista, id) {
        return lista.filter(function (i) { return i.id === id; })[0];
    }

    function tratar(metodo, caminho, params) {
        if (metodo !== "GET") {
            return responder(403,
                "Esta é uma demonstração somente leitura. Cadastre sua empresa para testar alterações.",
                caminho);
        }

        if (caminho === "/usuarios/me") {
            var u = USUARIOS[0];
            return responder(200, { id: u.id, nome: u.nome, email: u.email, cargo: u.cargo, status: u.status, empresaId: EMPRESA_ID }, caminho);
        }

        if (caminho === "/dashboard") { return responder(200, dashboard(), caminho); }

        if (caminho === "/clientes") {
            return responder(200, pagina(CLIENTES.slice().sort(function (a, b) { return a.nome.localeCompare(b.nome); }), params), caminho);
        }
        if (caminho === "/clientes/buscar") {
            var termo = (params.get("nome") || "").toLowerCase();
            return responder(200, CLIENTES.filter(function (c) { return c.nome.toLowerCase().indexOf(termo) !== -1; }), caminho);
        }

        if (caminho === "/chamados") {
            var st = params.get("status"), pr = params.get("prioridade");
            var lc = CHAMADOS.filter(function (c) {
                return (!st || c.status === st) && (!pr || c.prioridade === pr);
            }).sort(porIdDesc);
            return responder(200, pagina(lc, params), caminho);
        }

        if (caminho === "/ordens-servico") {
            var so = params.get("status");
            var lo = ORDENS.filter(function (o) { return !so || o.status === so; }).sort(porIdDesc);
            return responder(200, pagina(lo, params), caminho);
        }

        if (caminho === "/funcionarios") {
            var equipe = USUARIOS.filter(function (x) { return x.cargo !== "ADMIN"; });
            return responder(200, pagina(equipe, params), caminho);
        }
        if (caminho === "/funcionarios/pendentes") { return responder(200, [], caminho); }

        var m = caminho.match(/^\/(clientes|chamados|ordens-servico)\/(\d+)$/);
        if (m) {
            var base = { "clientes": CLIENTES, "chamados": CHAMADOS, "ordens-servico": ORDENS }[m[1]];
            var item = porId(base, parseInt(m[2], 10));
            return item ? responder(200, item, caminho) : responder(404, "Registro não encontrado.", caminho);
        }

        return responder(404, "O recurso solicitado não existe na demonstração.", caminho);
    }

    /* ---------------- interceptador do fetch ---------------- */

    var fetchOriginal = window.fetch.bind(window);

    window.fetch = function (entrada, opcoes) {
        try {
            if (ativo() && typeof API_URL === "string") {
                var url = typeof entrada === "string" ? entrada : (entrada && entrada.url) || "";
                if (url.indexOf(API_URL) === 0) {
                    var metodo = ((opcoes && opcoes.method) || (entrada && entrada.method) || "GET").toUpperCase();
                    var analisada = new URL(url);
                    var caminho = analisada.pathname.replace(/\/+$/, "") || "/";
                    return Promise.resolve(tratar(metodo, caminho, analisada.searchParams));
                }
            }
        } catch (e) { /* em caso de falha, segue para o fetch normal */ }

        return fetchOriginal(entrada, opcoes);
    };

    /* ---------------- aviso visual ---------------- */

    document.addEventListener("DOMContentLoaded", function () {
        if (!ativo() || document.getElementById("form-login")) { return; }

        var selo = document.createElement("div");
        selo.textContent = "Modo demonstração · somente leitura";
        selo.setAttribute("role", "status");
        selo.style.cssText =
            "position:fixed;right:16px;bottom:16px;z-index:9999;padding:8px 14px;" +
            "border-radius:999px;font:600 12px Inter,system-ui,sans-serif;color:#bfdbfe;" +
            "background:rgba(15,23,42,.88);border:1px solid rgba(147,197,253,.45);" +
            "backdrop-filter:blur(8px);pointer-events:none;";
        document.body.appendChild(selo);
    });
})();
