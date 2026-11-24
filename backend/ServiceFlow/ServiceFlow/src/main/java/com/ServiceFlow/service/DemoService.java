package com.ServiceFlow.service;

import com.ServiceFlow.dto.LoginResponse;
import com.ServiceFlow.model.*;
import com.ServiceFlow.repository.*;
import com.ServiceFlow.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.Optional;
import java.util.UUID;

/**
 * Modo demonstração: cria dados fictícios na subida (se habilitado) e
 * emite token para a conta demo, que é somente leitura (ver JwtFilter).
 */
@Service
public class DemoService implements ApplicationRunner {

    public static final String CNPJ_DEMO = "99999999000199";

    private final boolean habilitado;
    private final String emailDemo;
    private final EmpresaRepository empresaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final ChamadoRepository chamadoRepository;
    private final OrdemServicoRepository ordemServicoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public DemoService(
            @Value("${app.demo.enabled:false}") boolean habilitado,
            @Value("${app.demo.email:demo@serviceflow.app}") String emailDemo,
            EmpresaRepository empresaRepository,
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            ChamadoRepository chamadoRepository,
            OrdemServicoRepository ordemServicoRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.habilitado = habilitado;
        this.emailDemo = emailDemo.trim().toLowerCase();
        this.empresaRepository = empresaRepository;
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.chamadoRepository = chamadoRepository;
        this.ordemServicoRepository = ordemServicoRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Optional<LoginResponse> entrar() {
        if (!habilitado) {
            return Optional.empty();
        }

        return usuarioRepository
                .findByEmail(emailDemo)
                .filter(u -> u.getStatus() == StatusUsuario.ATIVO)
                .map(u -> new LoginResponse(
                        jwtService.gerarToken(u.getEmail())
                ));
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!habilitado
                || empresaRepository.existsByCnpj(CNPJ_DEMO)
                || usuarioRepository.existsByEmail(emailDemo)) {
            return;
        }

        Empresa empresa = new Empresa();
        empresa.setNome("TecnoServ Assistência Técnica (Demo)");
        empresa.setCnpj(CNPJ_DEMO);
        empresa.setTelefone("11900000000");
        empresa.setEmail("contato@demo.serviceflow.app");
        empresa = empresaRepository.save(empresa);

        Usuario admin = criarUsuario(empresa, "Administrador Demo", emailDemo, Cargo.ADMIN);
        Usuario carlos = criarUsuario(empresa, "Carlos Mendes", "carlos@demo.serviceflow.app", Cargo.TECNICO);
        Usuario fernanda = criarUsuario(empresa, "Fernanda Lima", "fernanda@demo.serviceflow.app", Cargo.TECNICO);
        Usuario paulo = criarUsuario(empresa, "Paulo Ribeiro", "paulo@demo.serviceflow.app", Cargo.ATENDENTE);

        Cliente c1 = criarCliente(empresa, "Restaurante Sabor da Praça", "11111111000111",
                "contato@saborpraca.example", "11911110001", "Rua das Flores, 120 - São Paulo/SP");
        Cliente c2 = criarCliente(empresa, "Hotel Vista Mar", "22222222000122",
                "manutencao@vistamar.example", "11911110002", "Av. Atlântica, 800 - Santos/SP");
        Cliente c3 = criarCliente(empresa, "Padaria Pão Quente", "33333333000133",
                "padaria@paoquente.example", "11911110003", "Rua do Comércio, 45 - Osasco/SP");
        Cliente c4 = criarCliente(empresa, "Clínica Bem Viver", "44444444000144",
                "admin@bemviver.example", "11911110004", "Rua da Saúde, 300 - São Paulo/SP");

        Chamado ch1 = criarChamado(empresa, c1, paulo, carlos,
                "Máquina de lavar louça não aquece",
                "A máquina não atinge a temperatura de lavagem durante o serviço.",
                PrioridadeChamado.ALTA, StatusChamado.EM_ANDAMENTO);
        Chamado ch2 = criarChamado(empresa, c2, paulo, fernanda,
                "Manutenção preventiva trimestral",
                "Revisão programada das máquinas da cozinha.",
                PrioridadeChamado.BAIXA, StatusChamado.CONCLUIDO);
        criarChamado(empresa, c3, paulo, null,
                "Vazamento na entrada de água",
                "Vazamento visível na conexão de entrada de água da máquina.",
                PrioridadeChamado.URGENTE, StatusChamado.ABERTO);
        Chamado ch4 = criarChamado(empresa, c4, paulo, carlos,
                "Ruído excessivo na bomba",
                "Ruído alto durante o ciclo de enxágue.",
                PrioridadeChamado.MEDIA, StatusChamado.AGUARDANDO_CLIENTE);
        criarChamado(empresa, c2, paulo, null,
                "Solicitação de orçamento de peças",
                "Cliente pede orçamento para reposição de peças de desgaste.",
                PrioridadeChamado.BAIXA, StatusChamado.ABERTO);
        Chamado ch6 = criarChamado(empresa, c1, paulo, fernanda,
                "Troca de resistência",
                "Resistência de aquecimento queimada.",
                PrioridadeChamado.MEDIA, StatusChamado.CONCLUIDO);

        criarOrdem(empresa, ch1, carlos, admin, "DEMO0001", StatusOrdemServico.EM_EXECUCAO,
                "Suspeita de falha na resistência do boiler.", null);
        criarOrdem(empresa, ch2, fernanda, admin, "DEMO0002", StatusOrdemServico.FINALIZADA,
                "Equipamento em bom estado geral.", "Limpeza, inspeção e teste de ciclos.");
        criarOrdem(empresa, ch4, carlos, admin, "DEMO0003", StatusOrdemServico.ABERTA,
                null, null);
        criarOrdem(empresa, ch6, fernanda, admin, "DEMO0004", StatusOrdemServico.FINALIZADA,
                "Resistência de aquecimento queimada.", "Substituição da resistência e teste de temperatura.");
    }

    private Usuario criarUsuario(Empresa empresa, String nome, String email, Cargo cargo) {
        Usuario u = new Usuario();
        u.setNome(nome);
        u.setEmail(email.toLowerCase());
        // senha aleatória: ninguém consegue logar por /login com estas contas
        u.setSenha(passwordEncoder.encode(UUID.randomUUID().toString()));
        u.setCargo(cargo);
        u.setStatus(StatusUsuario.ATIVO);
        u.setEmpresa(empresa);
        return usuarioRepository.save(u);
    }

    private Cliente criarCliente(Empresa empresa, String nome, String documento,
                                 String email, String telefone, String endereco) {
        Cliente c = new Cliente();
        c.setNome(nome);
        c.setDocumento(documento);
        c.setEmail(email);
        c.setTelefone(telefone);
        c.setEndereco(endereco);
        c.setAtivo(true);
        c.setEmpresa(empresa);
        return clienteRepository.save(c);
    }

    private Chamado criarChamado(Empresa empresa, Cliente cliente, Usuario abertoPor,
                                 Usuario tecnico, String titulo, String descricao,
                                 PrioridadeChamado prioridade, StatusChamado status) {
        Chamado ch = new Chamado();
        ch.setTitulo(titulo);
        ch.setDescricao(descricao);
        ch.setPrioridade(prioridade);
        ch.setStatus(status);
        ch.setCliente(cliente);
        ch.setEmpresa(empresa);
        ch.setAbertoPor(abertoPor);
        ch.setTecnicoResponsavel(tecnico);
        if (status == StatusChamado.CONCLUIDO) {
            ch.setDataConclusao(LocalDateTime.now());
        }
        return chamadoRepository.save(ch);
    }

    private void criarOrdem(Empresa empresa, Chamado chamado, Usuario tecnico, Usuario criadoPor,
                            String codigo, StatusOrdemServico status,
                            String diagnostico, String servicoRealizado) {
        OrdemServico os = new OrdemServico();
        os.setNumero("OS-" + Year.now().getValue() + "-" + codigo);
        os.setStatus(status);
        os.setDiagnostico(diagnostico);
        os.setServicoRealizado(servicoRealizado);
        os.setEmpresa(empresa);
        os.setChamado(chamado);
        os.setTecnico(tecnico);
        os.setCriadoPor(criadoPor);
        if (status != StatusOrdemServico.ABERTA) {
            os.setDataInicio(LocalDateTime.now());
        }
        if (status == StatusOrdemServico.FINALIZADA) {
            os.setDataFinalizacao(LocalDateTime.now());
        }
        ordemServicoRepository.save(os);
    }
}