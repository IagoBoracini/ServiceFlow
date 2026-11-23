/*
 * Gráficos do dashboard em SVG puro (sem bibliotecas externas).
 * Usa somente os números reais retornados por GET /dashboard.
 * Sem dados, mostra um estado vazio — nunca valores inventados.
 */
(function () {
    "use strict";

    const SVG_NS = "http://www.w3.org/2000/svg";

    const STATUS_CHAMADOS = [
        { campo: "chamadosAbertos", rotulo: "Abertos", cor: "#3b82f6" },
        { campo: "chamadosEmAndamento", rotulo: "Em andamento", cor: "#f59e0b" },
        { campo: "chamadosAguardandoCliente", rotulo: "Aguardando cliente", cor: "#a78bfa" },
        { campo: "chamadosConcluidos", rotulo: "Concluídos", cor: "#22c55e" },
        { campo: "chamadosCancelados", rotulo: "Cancelados", cor: "#64748b" }
    ];

    const PRIORIDADES = [
        { campo: "chamadosPrioridadeBaixa", rotulo: "Baixa", cor: "#38bdf8" },
        { campo: "chamadosPrioridadeMedia", rotulo: "Média", cor: "#3b82f6" },
        { campo: "chamadosPrioridadeAlta", rotulo: "Alta", cor: "#f59e0b" },
        { campo: "chamadosPrioridadeUrgente", rotulo: "Urgente", cor: "#ef4444" }
    ];

    const ORDENS = [
        { campo: "ordensAbertas", rotulo: "Abertas", cor: "#3b82f6" },
        { campo: "ordensEmExecucao", rotulo: "Em execução", cor: "#f59e0b" },
        { campo: "ordensFinalizadas", rotulo: "Finalizadas", cor: "#22c55e" },
        { campo: "ordensCanceladas", rotulo: "Canceladas", cor: "#64748b" }
    ];

    function numero(valor) {
        const n = Number(valor);
        return Number.isFinite(n) && n > 0 ? n : 0;
    }

    function criar(tag, atributos, filhos) {
        const el = document.createElementNS(SVG_NS, tag);
        Object.entries(atributos || {}).forEach(([k, v]) => el.setAttribute(k, v));
        (filhos || []).forEach(f => el.appendChild(f));
        return el;
    }

    function html(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto !== undefined) el.textContent = texto;
        return el;
    }

    function estadoVazio(container, mensagem) {
        container.replaceChildren(html("p", "chart-empty", mensagem));
    }

    function legenda(itens, dados) {
        const lista = html("ul", "chart-legend");
        itens.forEach(item => {
            const li = html("li");
            const ponto = html("span", "chart-dot");
            ponto.style.background = item.cor;
            li.append(
                ponto,
                html("span", "chart-legend-label", item.rotulo),
                html("strong", "chart-legend-value", String(numero(dados[item.campo])))
            );
            lista.appendChild(li);
        });
        return lista;
    }

    function rosca(container, itens, dados, rotuloCentral) {
        const total = itens.reduce((soma, i) => soma + numero(dados[i.campo]), 0);

        if (total === 0) {
            estadoVazio(container, "Ainda não há chamados para exibir.");
            return;
        }

        const raio = 54;
        const circunferencia = 2 * Math.PI * raio;
        const svg = criar("svg", {
            viewBox: "0 0 140 140",
            class: "chart-donut",
            role: "img",
            "aria-label": `${rotuloCentral}: ${total} no total`
        });

        svg.appendChild(criar("circle", {
            cx: 70, cy: 70, r: raio, fill: "none",
            stroke: "rgba(148,163,184,0.12)", "stroke-width": 16
        }));

        let acumulado = 0;
        itens.forEach(item => {
            const valor = numero(dados[item.campo]);
            if (valor === 0) return;

            const comprimento = (valor / total) * circunferencia;
            const lacuna = itens.filter(i => numero(dados[i.campo]) > 0).length > 1 ? 2 : 0;

            const arco = criar("circle", {
                cx: 70, cy: 70, r: raio, fill: "none",
                stroke: item.cor, "stroke-width": 16, "stroke-linecap": "butt",
                "stroke-dasharray": `0 ${circunferencia}`,
                "stroke-dashoffset": -acumulado,
                transform: "rotate(-90 70 70)",
                class: "chart-arc"
            });
            arco.appendChild(criar("title", {}, []));
            arco.firstChild.textContent = `${item.rotulo}: ${valor}`;
            svg.appendChild(arco);

            requestAnimationFrame(() => requestAnimationFrame(() => {
                arco.style.transition = "stroke-dasharray 0.9s cubic-bezier(.2,.7,.2,1)";
                arco.setAttribute(
                    "stroke-dasharray",
                    `${Math.max(comprimento - lacuna, 0)} ${circunferencia}`
                );
            }));

            acumulado += comprimento;
        });

        const centro = criar("text", {
            x: 70, y: 68, "text-anchor": "middle", class: "chart-center-value"
        });
        centro.textContent = String(total);
        const sub = criar("text", {
            x: 70, y: 86, "text-anchor": "middle", class: "chart-center-label"
        });
        sub.textContent = "chamados";
        svg.append(centro, sub);

        const caixa = html("div", "chart-donut-wrap");
        caixa.append(svg, legenda(itens, dados));
        container.replaceChildren(caixa);
    }

    function barras(container, itens, dados, vazio) {
        const maximo = Math.max(...itens.map(i => numero(dados[i.campo])));

        if (maximo === 0) {
            estadoVazio(container, vazio);
            return;
        }

        const lista = html("ul", "chart-bars");

        itens.forEach(item => {
            const valor = numero(dados[item.campo]);

            const trilho = html("div", "chart-bar-track");
            const barra = html("div", "chart-bar-fill");
            barra.style.background = `linear-gradient(90deg, ${item.cor}, ${item.cor}cc)`;
            barra.style.width = "0%";
            trilho.appendChild(barra);

            const linha = html("li", "chart-bar-row");
            const topo = html("div", "chart-bar-head");
            topo.append(
                html("span", "chart-bar-label", item.rotulo),
                html("strong", "chart-bar-value", String(valor))
            );
            linha.append(topo, trilho);
            lista.appendChild(linha);

            requestAnimationFrame(() => requestAnimationFrame(() => {
                barra.style.width = `${(valor / maximo) * 100}%`;
            }));
        });

        container.replaceChildren(lista);
    }

    function renderizar(dados) {
        if (!dados) return;

        const status = document.getElementById("grafico-status");
        const prioridade = document.getElementById("grafico-prioridade");
        const ordens = document.getElementById("grafico-ordens");

        if (status) rosca(status, STATUS_CHAMADOS, dados, "Chamados por status");
        if (prioridade) barras(prioridade, PRIORIDADES, dados, "Ainda não há chamados para exibir.");
        if (ordens) barras(ordens, ORDENS, dados, "Ainda não há ordens de serviço para exibir.");
    }

    window.ServiceFlowCharts = { renderizar };
})();
