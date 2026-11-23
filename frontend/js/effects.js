/*
 * Microinterações do ServiceFlow (sem bibliotecas externas):
 *  - brilho de luz que segue o mouse nas superfícies de vidro
 *  - inclinação 3D dos cartões de resumo e do cartão de login
 *  - entrada escalonada dos blocos ao rolar a página
 *  - linhas de tabela entrando em sequência
 *  - contagem animada dos números do dashboard
 * Tudo é desligado para quem prefere menos movimento, e a inclinação
 * também em telas de toque.
 */
(function () {
    "use strict";

    const reduzirMovimento =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mousePreciso =
        window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const SUPERFICIES =
        ".summary-card, .dashboard-panel, .table-container, .content-card, " +
        ".profile-card, .form-card, .chart-panel";

    const BLOCOS_ENTRADA =
        ".page-header, .welcome-section, .summary-card, .dashboard-panel, " +
        ".chart-panel, .table-container, .content-card, .profile-card, .form-card";

    /* ---------- luz que segue o mouse + inclinação 3D ---------- */
    function ativarLuz() {
        if (reduzirMovimento || !mousePreciso) return;

        let quadro = null;
        let ultimo = null;

        document.addEventListener("pointermove", evento => {
            ultimo = evento;
            if (quadro) return;

            quadro = requestAnimationFrame(() => {
                quadro = null;
                const alvo = ultimo.target.closest
                    ? ultimo.target.closest(SUPERFICIES + ", .sf-tilt")
                    : null;
                if (!alvo) return;

                const caixa = alvo.getBoundingClientRect();
                const x = ultimo.clientX - caixa.left;
                const y = ultimo.clientY - caixa.top;

                alvo.style.setProperty("--px", x + "px");
                alvo.style.setProperty("--py", y + "px");

                if (alvo.matches(".summary-card, .sf-tilt")) {
                    // cartões de formulário inclinam menos, para não atrapalhar a digitação
                    const f = alvo.classList.contains("sf-tilt") ? 0.4 : 1;
                    const rx = (0.5 - y / caixa.height) * 8 * f;
                    const ry = (x / caixa.width - 0.5) * 10 * f;
                    alvo.style.transform =
                        "perspective(800px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-3px)";
                }
            });
        }, { passive: true });

        document.addEventListener("pointerout", evento => {
            const alvo = evento.target.closest
                ? evento.target.closest(".summary-card, .sf-tilt")
                : null;
            if (alvo && !alvo.contains(evento.relatedTarget)) {
                alvo.style.transform = "";
            }
        });
    }

    /* ---------- entrada escalonada ---------- */
    function ativarEntrada() {
        const blocos = Array.from(document.querySelectorAll(BLOCOS_ENTRADA));
        if (!blocos.length || reduzirMovimento || !("IntersectionObserver" in window)) return;

        blocos.forEach((el, i) => {
            el.classList.add("sf-reveal");
            el.style.setProperty("--sf-delay", Math.min(i, 8) * 70 + "ms");
        });

        const observador = new IntersectionObserver(entradas => {
            entradas.forEach(entrada => {
                if (!entrada.isIntersecting) return;
                const alvo = entrada.target;
                alvo.classList.add("sf-in");
                observador.unobserve(alvo);
                // após a entrada, devolve o elemento ao estado normal para que
                // o atraso da animação não atrase hover e inclinação
                setTimeout(() => alvo.classList.remove("sf-reveal", "sf-in"), 1500);
            });
        }, { threshold: 0.08 });

        blocos.forEach(el => observador.observe(el));

        // rede de segurança: nada fica invisível se algo falhar
        setTimeout(() => blocos.forEach(el => el.classList.add("sf-in")), 1600);
        setTimeout(() => blocos.forEach(el => el.classList.remove("sf-reveal", "sf-in")), 3200);
    }

    /* ---------- linhas de tabela e listas entrando em sequência ---------- */
    function ativarLinhas() {
        if (reduzirMovimento) return;

        const marcar = corpo => {
            corpo.querySelectorAll("tr:not(.sf-row)").forEach((linha, i) => {
                if (linha.querySelector("th")) return;
                linha.style.setProperty("--i", Math.min(i, 12));
                linha.classList.add("sf-row");
            });
        };

        document.querySelectorAll("tbody").forEach(corpo => {
            marcar(corpo);
            new MutationObserver(() => marcar(corpo))
                .observe(corpo, { childList: true });
        });
    }

    /* ---------- números que contam até o valor real ---------- */
    function animarNumero(elemento, destino) {
        const duracao = 900;
        const inicio = performance.now();

        function passo(agora) {
            const progresso = Math.min((agora - inicio) / duracao, 1);
            const suave = 1 - Math.pow(1 - progresso, 3);

            elemento.textContent = String(Math.round(destino * suave));

            if (progresso < 1) requestAnimationFrame(passo);
        }

        requestAnimationFrame(passo);
    }

    function observarNumeros() {
        if (reduzirMovimento) return;

        document.querySelectorAll(".card-value").forEach(elemento => {
            // Último valor real recebido da API. Mudanças causadas pela
            // própria animação são ignoradas para a contagem não reiniciar.
            let destinoAtual = null;
            let escrevendo = false;

            new MutationObserver(() => {
                if (escrevendo) return;

                const texto = elemento.textContent.trim();
                if (!/^\d+$/.test(texto)) return;

                const valor = Number(texto);
                if (valor === destinoAtual) return;

                destinoAtual = valor;
                if (valor === 0) return;

                escrevendo = true;
                elemento.textContent = "0";
                animarNumero(elemento, valor);
                setTimeout(() => { escrevendo = false; }, 950);
            }).observe(elemento, { childList: true, characterData: true, subtree: true });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".form-container, .register-card")
            .forEach(el => el.classList.add("sf-tilt"));
        ativarLuz();
        ativarEntrada();
        ativarLinhas();
        observarNumeros();
    });
})();
