# ServiceFlow

**Plataforma web para gerenciamento de serviços técnicos, clientes e ordens de serviço.**

O ServiceFlow é um sistema Full Stack desenvolvido para centralizar a operação de empresas de assistência técnica e manutenção. A aplicação organiza o fluxo de atendimento, desde o gerenciamento de clientes e abertura de chamados até a atribuição de técnicos e acompanhamento das ordens de serviço.

<p align="center">
  <a href="https://service-flow-n9wv.vercel.app/login.html">
    <strong>Conheça a demonstração do ServiceFlow</strong>
  </a>
</p>

---

## Visão geral

Empresas que trabalham com atendimento técnico precisam acompanhar clientes, funcionários, solicitações e serviços em andamento. O ServiceFlow reúne essas informações em uma única aplicação, facilitando a organização das atividades e o acompanhamento dos atendimentos.

O sistema foi desenvolvido com uma arquitetura Full Stack, utilizando Java e Spring Boot no back-end e tecnologias web no front-end.

## Funcionalidades

**Gestão de acesso**
- Cadastro de empresas com validação de CNPJ.
- Autenticação utilizando JWT.
- Controle de acesso por perfil: administrador, técnico e atendente.
- Solicitação de acesso de funcionários, com fluxo de aprovação e rejeição.

**Gestão operacional**
- Cadastro e gerenciamento de clientes.
- Abertura e acompanhamento de chamados.
- Definição de prioridades e atribuição de técnicos.
- Criação e gerenciamento de ordens de serviço.
- Acompanhamento das atividades por meio de dashboard.
- Visualização e gerenciamento do perfil do usuário.

**Organização e segurança**
- Separação dos dados por empresa.
- Controle de permissões conforme o perfil do usuário.
- Integração entre front-end e API REST.

## Demonstração

A aplicação possui uma versão demonstrativa publicada na Vercel, acessível pela tela de login através da opção **Ver demonstração**.

Nesse modo, é possível navegar pelas principais telas e consultar registros utilizando dados fictícios.

| Recurso | Comportamento |
|---|---|
| Acesso | Disponível sem autenticação no back-end |
| Dados | Fictícios |
| Consultas | Simuladas no front-end |
| Alterações | Bloqueadas |
| Persistência | Não utiliza o banco de dados |

**Importante:** a demonstração tem finalidade de apresentação e não representa uma instância de produção conectada ao back-end.

## Tecnologias

| Área | Tecnologias |
|---|---|
| Back-end | Java 25, Spring Boot 4.1 |
| API | Spring Web MVC, REST |
| Segurança | Spring Security, JWT |
| Persistência | Spring Data JPA, Hibernate |
| Banco de dados | MySQL |
| Front-end | HTML5, CSS3, JavaScript |
| Documentação da API | Swagger / OpenAPI |
| Testes | JUnit 5, Mockito, H2 |
| Hospedagem | Vercel |

## Arquitetura

O back-end segue uma organização em camadas, separando as responsabilidades de cada parte da aplicação.

```text
                 FRONT-END
             HTML, CSS e JavaScript
                       |
                       | HTTP / JSON
                       | Autenticação JWT
                       v
                  API REST
                 Spring Boot
                       |
                +------+------+
                |             |
                v             v
           Controller      Security
                |
                v
             Service
                |
                v
            Repository
                |
                v
          Spring Data JPA
                |
                v
              MySQL
```

Essa separação facilita a manutenção, a organização das regras de negócio e a comunicação entre as camadas da aplicação.

## Organização do projeto

```text
ServiceFlow/
│
├── backend/
│   └── ServiceFlow/
│       └── ServiceFlow/
│           ├── src/
│           │   ├── main/
│           │   └── test/
│           ├── pom.xml
│           ├── mvnw
│           └── mvnw.cmd
│
└── frontend/
    ├── css/
    ├── js/
    ├── pages/
    ├── index.html
    └── login.html
```

## Ambiente de desenvolvimento

Para executar a aplicação localmente, são necessários:

- Java 25.
- MySQL 8 ou superior.
- Maven.
- Um servidor local para o front-end, como o Live Server.

**Back-end**

Entre na pasta do projeto Java:

```bash
cd backend/ServiceFlow/ServiceFlow
```

Configure as variáveis de ambiente para conexão com o MySQL e autenticação JWT.

Crie o banco de dados:

```sql
CREATE DATABASE serviceflow CHARACTER SET utf8mb4;
```

Inicie a aplicação:

```powershell
# Windows
.\mvnw.cmd spring-boot:run
```

```bash
# Linux / macOS
./mvnw spring-boot:run
```

**Front-end**

Abra a pasta `frontend` com um servidor local e utilize o endereço da API configurado em `frontend/js/config.js`.

**Testes**

```powershell
# Windows
.\mvnw.cmd test
```

```bash
# Linux / macOS
./mvnw test
```

A documentação interativa da API, quando o back-end estiver em execução, pode ser acessada pelo Swagger UI:

`http://localhost:8080/swagger-ui.html`

## Considerações técnicas

O desenvolvimento do ServiceFlow envolve conceitos e práticas utilizados na construção de aplicações Full Stack, como:

- Desenvolvimento de APIs REST com Spring Boot.
- Organização de código em camadas.
- Persistência de dados com Spring Data JPA.
- Autenticação e autorização com Spring Security e JWT.
- Integração entre front-end e back-end.
- Modelagem e relacionamento de dados em banco relacional.
- Testes automatizados.

---

**ServiceFlow** — Projeto Full Stack desenvolvido para estudo e portfólio, com foco em Java, Spring Boot e desenvolvimento de aplicações web.
