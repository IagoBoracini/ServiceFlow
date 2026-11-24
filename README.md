
# ServiceFlow

Sistema web para gestão de serviços técnicos. O ServiceFlow centraliza clientes, funcionários, chamados e ordens de serviço em uma única plataforma, acompanhando o atendimento desde a abertura até a conclusão.

<p align="center">
  <a href="https://service-flow-n9wv.vercel.app/login.html">
    <strong>Acessar demonstração online</strong>
  </a>
</p>

## Sobre o projeto

O ServiceFlow foi desenvolvido para representar a rotina de uma empresa de serviços e manutenção técnica, organizando informações e facilitando o acompanhamento dos atendimentos.

## Funcionalidades

- Cadastro de empresas com validação de CNPJ.
- Autenticação de usuários com JWT.
- Perfis de acesso: administrador, técnico e atendente.
- Gerenciamento de funcionários.
- Cadastro, consulta, edição e inativação de clientes.
- Abertura e acompanhamento de chamados.
- Atribuição de técnicos e definição de prioridades.
- Criação e gerenciamento de ordens de serviço.
- Dashboard com indicadores, gráficos e atividades recentes.
- Gerenciamento de perfil do usuário.
- Separação de dados por empresa.

## Modo demonstração

O projeto possui um botão **Ver demonstração** na tela de login, permitindo acessar o sistema sem depender de um back-end hospedado.

O modo de demonstração:

- Utiliza dados fictícios.
- Simula respostas da API diretamente no front-end.
- Permite navegar pelas páginas e consultar registros.
- Bloqueia operações de escrita.
- Não exige autenticação no back-end.

**Observação:** a demonstração funciona em modo somente leitura. Os dados são fictícios e não são persistidos no banco de dados.

## Tecnologias utilizadas

| Camada | Tecnologias |
|---|---|
| Front-end | HTML5, CSS3 e JavaScript |
| Back-end | Java 25 e Spring Boot 4.1 |
| API | Spring Web MVC |
| Segurança | Spring Security e JWT |
| Persistência | Spring Data JPA |
| Banco de dados | MySQL |
| Documentação | Swagger / OpenAPI |
| Testes | JUnit 5, Mockito e H2 |
| Hospedagem Front-end | Vercel |

## Arquitetura

O sistema utiliza uma arquitetura baseada em API REST, com separação de responsabilidades no back-end.

```text
Front-end (HTML, CSS e JavaScript)
              |
              | HTTP / JSON + JWT
              v
           API REST
         (Spring Boot)
              |
          Controller
              |
            Service
              |
          Repository
              |
       Spring Data JPA
              |
             MySQL
```

## Estrutura do projeto

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

## Executar localmente

### Pré-requisitos

- Java 25
- MySQL 8 ou superior
- Maven
- Servidor local para o front-end (Live Server, por exemplo)

### 1. Criar o banco de dados

```sql
CREATE DATABASE serviceflow CHARACTER SET utf8mb4;
```

### 2. Configurar o back-end

Acesse a pasta:

```bash
cd backend/ServiceFlow/ServiceFlow
```

Configure as variáveis de ambiente necessárias para conexão com o MySQL e autenticação JWT, utilizando o arquivo `.env.example` como referência.

Não compartilhe credenciais ou segredos reais.

### 3. Iniciar o back-end

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Linux ou macOS:

```bash
./mvnw spring-boot:run
```

A API ficará disponível em:

```text
http://localhost:8080
```

### 4. Iniciar o front-end

Abra a pasta `frontend` utilizando um servidor local, como o Live Server.

O arquivo `frontend/js/config.js` configura a URL da API para o ambiente local.

### 5. Executar os testes

Windows:

```powershell
.\mvnw.cmd test
```

Linux ou macOS:

```bash
./mvnw test
```

## Demonstração online

O front-end está publicado na Vercel:

**https://service-flow-n9wv.vercel.app/login.html**

A versão de demonstração utiliza dados fictícios e não depende do back-end para as consultas simuladas.

O login convencional e as operações reais dependem da API e do banco de dados.

## Documentação da API

Com o back-end em execução, acesse:

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

OpenAPI:

```text
http://localhost:8080/v3/api-docs
```

## Melhorias futuras

- Ampliar a cobertura de testes.
- Implementar migrations com Flyway.
- Adicionar filtros e buscas avançadas.
- Desenvolver relatórios exportáveis.
- Ampliar o histórico de atividades das ordens de serviço.

---

Desenvolvido como projeto de estudo e portfólio, com foco no desenvolvimento Full Stack utilizando Java e tecnologias web.
