# ServiceFlow

Sistema web de gestão de serviços técnicos: centraliza clientes, equipe, chamados e ordens de serviço de uma empresa em um só lugar.

- **Demonstração online:** https://service-flow-n9wv.vercel.app/login.html
- **API (Swagger):** `/swagger-ui.html` no backend (ver [Documentação da API](#documentação-da-api))

## Problema que resolve

Empresas de manutenção e atendimento técnico costumam controlar chamados e ordens de serviço em planilhas e mensagens soltas. O ServiceFlow organiza esse fluxo: do registro do chamado até a conclusão da ordem de serviço, com responsáveis, prioridades e status acompanháveis.

## Funcionalidades

- Cadastro de empresa (com validação de CNPJ) e autenticação com JWT
- Perfis de acesso: administrador, técnico e atendente
- Solicitação de entrada de funcionários, com aprovação/rejeição pelo administrador
- Clientes: cadastro, edição, busca, inativação e reativação
- Chamados: abertura, edição, atribuição de técnico, prioridade e status
- Ordens de serviço: criação, edição e controle de status
- Dashboard com indicadores, gráficos e atividades recentes
- Perfil do usuário: edição de dados e troca de senha
- Isolamento de dados por empresa (cada empresa só acessa os próprios registros)

## Tecnologias

| Camada | Tecnologias |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (sem framework) |
| Backend | Java 21, Spring Boot 4.1, Spring Security, Spring Data JPA, Bean Validation |
| Banco | MySQL |
| Autenticação | JWT (jjwt) + BCrypt |
| Documentação | OpenAPI / Swagger UI (springdoc) |
| Testes | JUnit 5, Mockito |
| Deploy | Vercel (frontend) e Railway (backend) |

## Arquitetura

```
Navegador (HTML/CSS/JS)  ──HTTPS + JWT──▶  API REST (Spring Boot)  ──JPA──▶  MySQL
```

O backend segue a separação em camadas: `controller` (HTTP) → `service` (regras de negócio) → `repository` (acesso a dados), com `dto` para entrada/saída, `model` para entidades, `exception` para o tratamento global de erros e `security` para JWT, filtro e respostas 401/403 em JSON.

Decisões técnicas relevantes:

- O segredo do JWT vem de variável de ambiente; a aplicação não inicia sem ele.
- Todas as consultas de dados de negócio filtram pela empresa do usuário autenticado.
- O login responde sempre com a mesma mensagem para e-mail inexistente ou senha incorreta, e só informa o status da conta depois de a senha ser validada.
- O frontend escapa dados do usuário antes de inseri-los no HTML.

## Identidade visual (design "Flux")

O visual parte de uma ideia: o **fluxo** de um serviço, do chamado à ordem concluída.

- **Design system** em `frontend/css/flux.css`: tokens de cor e tipografia (Sora, Inter e JetBrains Mono), superfícies de vidro com borda de luz, botões, formulários, tabelas, modais e gráficos, aplicados a todas as páginas.
- **Menu lateral flutuante e recolhível**, montado por `js/shell.js` a partir de uma única lista de páginas; inclui o menu mobile em todas as telas.
- **Microinterações** em `js/effects.js`: brilho que segue o mouse, inclinação 3D dos cartões, entrada escalonada, linhas de tabela em sequência e números que contam até o valor.
- **Cena 3D** do login e do cadastro em `js/scene.js` (canvas, sem bibliotecas): engrenagem em aramado, partículas com profundidade e linhas de fluxo.
- **Transições entre páginas** com a View Transitions API do navegador (sem efeito nos navegadores sem suporte).
- Respeita `prefers-reduced-motion`: com a opção ativa, as animações são desligadas e a cena 3D vira um quadro estático.

## Estrutura de pastas

```
ServiceFlow/
├── backend/ServiceFlow/ServiceFlow/   # API Spring Boot (pom.xml, src/main, src/test)
└── frontend/
    ├── login.html, index.html         # login e cadastro
    ├── pages/                         # dashboard, chamados, clientes, funcionários, OS, perfil
    ├── css/                           # flux.css (design system), auth.css (login/cadastro) e estilos por página
    └── js/                            # config.js (URL da API), shell.js (menu), effects.js, scene.js e scripts por página
```

## Pré-requisitos

- Java 21 e Maven (ou o wrapper `mvnw` do projeto)
- MySQL 8+
- Um servidor estático para o frontend (por exemplo, a extensão Live Server do VS Code, porta 5500)

## Como executar

### 1. Banco de dados

```sql
CREATE DATABASE serviceflow CHARACTER SET utf8mb4;
```

### 2. Variáveis de ambiente do backend

Use `backend/ServiceFlow/ServiceFlow/.env.example` como modelo. Não faça commit de valores reais.

| Variável | Descrição |
|---|---|
| `SPRING_DATASOURCE_URL` | URL JDBC do MySQL |
| `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` | Credenciais do banco |
| `JWT_SECRET` | Segredo de assinatura, mínimo de 32 caracteres (`openssl rand -base64 48`) |
| `JWT_EXPIRATION_MINUTES` | Validade do token (padrão: 60) |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas, separadas por vírgula |
| `JPA_DDL_AUTO` | `update` (padrão) ou `validate` |
| `JPA_SHOW_SQL` | `false` (padrão) |

### 3. Backend

```bash
cd backend/ServiceFlow/ServiceFlow
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`.

### 4. Frontend

Em `frontend/js/config.js`, ajuste `API_URL` para `http://localhost:8080` e sirva a pasta `frontend` em `http://localhost:5500`.

## Testes

```bash
cd backend/ServiceFlow/ServiceFlow
./mvnw test
```

Os testes usam banco H2 em memória (`src/test/resources/application.properties`) e cobrem autenticação, geração/validação de JWT e validação de CNPJ.

## Documentação da API

Com o backend em execução: `http://localhost:8080/swagger-ui.html` (JSON em `/v3/api-docs`). Para testar rotas protegidas, faça login em `POST /login` e use o token no botão **Authorize**.

Grupos de endpoints: `/login`, `/empresas`, `/usuarios`, `/funcionarios`, `/clientes`, `/chamados`, `/ordens-servico` e `/dashboard`.

## Capturas de tela

Adicione capturas reais em `docs/screenshots/` (login, dashboard, chamados, ordens de serviço, versão mobile) e referencie-as aqui.

## Melhorias futuras

- Ampliar a cobertura de testes para clientes, chamados e ordens de serviço
- Migrations com Flyway no lugar de `ddl-auto=update`
- Filtro por período e busca global no dashboard
- Relatórios exportáveis (CSV/PDF)
- Histórico de atividades por ordem de serviço
