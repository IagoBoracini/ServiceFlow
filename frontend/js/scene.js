/*
 * Cena 3D das telas de entrada (login e cadastro).
 * Canvas 2D com projeção em perspectiva — sem bibliotecas externas:
 *  - engrenagem em aramado luminoso (referência à manutenção técnica)
 *  - campo de partículas com profundidade e parallax pelo mouse
 *  - "linhas de fluxo" com pontos de luz viajando (identidade do ServiceFlow)
 * Respeita prefers-reduced-motion (desenha um quadro estático), pausa quando
 * a aba fica oculta e usa menos elementos em telas pequenas.
 */
(function () {
    "use strict";

    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pequena = window.matchMedia("(max-width: 800px)").matches;

    const canvas = document.createElement("canvas");
    canvas.id = "sf-scene";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let L = 0, A = 0, dpr = 1;
    const mouse = { x: 0, y: 0, alvoX: 0, alvoY: 0 };

    /* ---------- geometria ---------- */
    const DENTES = 14;
    const R_EXT = 1.0, R_INT = 0.82, R_FURO = 0.34, ESPESSURA = 0.28;
    const gear = [];            // [x, y] do contorno (dentes)
    for (let i = 0; i < DENTES; i++) {
        const a0 = (i / DENTES) * Math.PI * 2;
        const passo = (Math.PI * 2) / DENTES;
        [[0.0, R_INT], [0.18, R_EXT], [0.5, R_EXT], [0.68, R_INT]].forEach(([f, r]) => {
            const a = a0 + f * passo;
            gear.push([Math.cos(a) * r, Math.sin(a) * r]);
        });
    }
    const furo = [];
    for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        furo.push([Math.cos(a) * R_FURO, Math.sin(a) * R_FURO]);
    }
    const aro = [];
    for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        aro.push([Math.cos(a) * 0.6, Math.sin(a) * 0.6]);
    }

    const N = pequena ? 70 : 150;
    const particulas = Array.from({ length: N }, () => ({
        x: (Math.random() - 0.5) * 3.2,
        y: (Math.random() - 0.5) * 2.2,
        z: Math.random() * 2 + 0.2,
        v: 0.0006 + Math.random() * 0.0012
    }));

    const fluxos = [0, 1, 2].map(i => ({
        base: 0.28 + i * 0.22,
        amp: 0.05 + i * 0.015,
        freq: 1.4 + i * 0.5,
        fase: i * 1.7,
        ponto: Math.random(),
        vel: 0.0014 + i * 0.0004
    }));

    /* ---------- projeção ---------- */
    function projetar(x, y, z, ay, ax, cx, cy, escala) {
        // rotação em Y e depois em X
        let x1 = x * Math.cos(ay) + z * Math.sin(ay);
        let z1 = -x * Math.sin(ay) + z * Math.cos(ay);
        let y1 = y * Math.cos(ax) - z1 * Math.sin(ax);
        let z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
        const f = 3.2 / (3.2 + z2);
        return [cx + x1 * escala * f, cy + y1 * escala * f, z2];
    }

    function tracarContorno(pontos, z, ay, ax, cx, cy, escala, fechar) {
        ctx.beginPath();
        pontos.forEach((p, i) => {
            const [sx, sy] = projetar(p[0], p[1], z, ay, ax, cx, cy, escala);
            if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        });
        if (fechar) ctx.closePath();
        ctx.stroke();
    }

    function desenharEngrenagem(t) {
        // grande, ancorada no canto inferior: aparece ao lado do cartão sem competir com ele
        const larga = L > 900;
        const cx = L * (larga ? 0.9 : 0.5) + mouse.x * 18;
        const cy = A * (larga ? 0.86 : 0.9) + mouse.y * 12;
        const escala = Math.min(L, A) * (larga ? 0.46 : 0.34);

        const giroY = 0.55 + mouse.x * 0.35 + Math.sin(t * 0.0003) * 0.18;
        const giroX = -0.42 + mouse.y * 0.25 + Math.cos(t * 0.00025) * 0.1;
        const rot = t * 0.00022;

        const rodar = lista => lista.map(([x, y]) => [
            x * Math.cos(rot) - y * Math.sin(rot),
            x * Math.sin(rot) + y * Math.cos(rot)
        ]);
        const dentes = rodar(gear), buraco = rodar(furo), anel = rodar(aro);

        ctx.lineJoin = "round";

        // faces de trás e da frente
        [-ESPESSURA / 2, ESPESSURA / 2].forEach((z, i) => {
            ctx.lineWidth = i ? 1.6 : 1;
            ctx.strokeStyle = i ? "rgba(96, 190, 255, 0.85)" : "rgba(79, 140, 255, 0.4)";
            tracarContorno(dentes, z, giroY, giroX, cx, cy, escala, true);
            ctx.strokeStyle = i ? "rgba(34, 211, 238, 0.75)" : "rgba(34, 211, 238, 0.3)";
            tracarContorno(buraco, z, giroY, giroX, cx, cy, escala, true);
            ctx.lineWidth = 1;
            ctx.strokeStyle = i ? "rgba(120, 160, 255, 0.35)" : "rgba(120, 160, 255, 0.16)";
            tracarContorno(anel, z, giroY, giroX, cx, cy, escala, true);
        });

        // arestas que ligam as duas faces (dão volume)
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(79, 140, 255, 0.28)";
        ctx.beginPath();
        dentes.forEach((p, i) => {
            if (i % 2) return;
            const [ax1, ay1] = projetar(p[0], p[1], -ESPESSURA / 2, giroY, giroX, cx, cy, escala);
            const [ax2, ay2] = projetar(p[0], p[1], ESPESSURA / 2, giroY, giroX, cx, cy, escala);
            ctx.moveTo(ax1, ay1); ctx.lineTo(ax2, ay2);
        });
        ctx.stroke();

        // raios do miolo
        ctx.strokeStyle = "rgba(34, 211, 238, 0.22)";
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const a = rot + (i / 6) * Math.PI * 2;
            const [x1, y1] = projetar(Math.cos(a) * R_FURO, Math.sin(a) * R_FURO, ESPESSURA / 2, giroY, giroX, cx, cy, escala);
            const [x2, y2] = projetar(Math.cos(a) * 0.6, Math.sin(a) * 0.6, ESPESSURA / 2, giroY, giroX, cx, cy, escala);
            ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        }
        ctx.stroke();
    }

    function desenharParticulas(t, movimento) {
        const ay = mouse.x * 0.5, ax = mouse.y * 0.3;
        particulas.forEach(p => {
            if (movimento) {
                p.y -= p.v;
                if (p.y < -1.1) { p.y = 1.1; p.x = (Math.random() - 0.5) * 3.2; }
            }
            const [sx, sy, z] = projetar(p.x, p.y, p.z - 1, ay, ax, L / 2, A / 2, Math.min(L, A) * 0.62);
            if (sx < -10 || sx > L + 10 || sy < -10 || sy > A + 10) return;
            const prof = Math.max(0, Math.min(1, 1 - (z + 1) / 3));
            const tam = 0.6 + prof * 1.7;
            ctx.fillStyle = "rgba(" + (110 + prof * 40) + "," + (170 + prof * 60) + ",255," + (0.15 + prof * 0.55) + ")";
            ctx.beginPath();
            ctx.arc(sx, sy, tam, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function desenharFluxos(movimento) {
        fluxos.forEach(f => {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgba(79, 140, 255, 0.1)";
            ctx.beginPath();
            const passos = 60;
            for (let i = 0; i <= passos; i++) {
                const u = i / passos;
                const x = u * L;
                const y = A * (f.base + Math.sin(u * f.freq * Math.PI + f.fase) * f.amp) + mouse.y * 10 * (f.base * 2);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();

            if (movimento) f.ponto = (f.ponto + f.vel) % 1;
            const x = f.ponto * L;
            const y = A * (f.base + Math.sin(f.ponto * f.freq * Math.PI + f.fase) * f.amp) + mouse.y * 10 * (f.base * 2);
            const brilho = ctx.createRadialGradient(x, y, 0, x, y, 26);
            brilho.addColorStop(0, "rgba(34, 211, 238, 0.95)");
            brilho.addColorStop(0.25, "rgba(79, 140, 255, 0.4)");
            brilho.addColorStop(1, "rgba(79, 140, 255, 0)");
            ctx.fillStyle = brilho;
            ctx.beginPath();
            ctx.arc(x, y, 26, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /* ---------- laço principal ---------- */
    let rodando = false, quadro = 0;

    function desenhar(t, movimento) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, L, A);

        mouse.x += (mouse.alvoX - mouse.x) * 0.05;
        mouse.y += (mouse.alvoY - mouse.y) * 0.05;

        ctx.globalCompositeOperation = "lighter";
        desenharFluxos(movimento);
        desenharParticulas(t, movimento);
        desenharEngrenagem(t);
        ctx.globalCompositeOperation = "source-over";
    }

    function laco(t) {
        if (!rodando) return;
        desenhar(t, true);
        quadro = requestAnimationFrame(laco);
    }

    function iniciar() {
        if (rodando || reduzir) return;
        rodando = true;
        quadro = requestAnimationFrame(laco);
    }

    function parar() {
        rodando = false;
        cancelAnimationFrame(quadro);
    }

    function medir() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        L = window.innerWidth;
        A = window.innerHeight;
        canvas.width = Math.round(L * dpr);
        canvas.height = Math.round(A * dpr);
        canvas.style.width = L + "px";
        canvas.style.height = A + "px";
        if (reduzir) desenhar(2200, false);
    }

    window.addEventListener("resize", medir);
    window.addEventListener("pointermove", e => {
        mouse.alvoX = (e.clientX / L - 0.5) * 2;
        mouse.alvoY = (e.clientY / A - 0.5) * 2;
    }, { passive: true });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) parar(); else iniciar();
    });

    medir();
    iniciar();
})();
