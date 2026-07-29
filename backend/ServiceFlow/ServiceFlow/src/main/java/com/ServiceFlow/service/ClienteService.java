package com.ServiceFlow.service;

import com.ServiceFlow.dto.ClienteRequest;
import com.ServiceFlow.dto.ClienteResponse;
import com.ServiceFlow.model.Cliente;
import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.ClienteRepository;
import com.ServiceFlow.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;

    public ClienteService(
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ClienteResponse cadastrar(
            ClienteRequest request,
            Authentication authentication
    ) {

        Usuario usuario = buscarUsuarioAutenticado(authentication);

        Long empresaId = usuario.getEmpresa().getId();

        String documentoNormalizado =
                limparNumero(request.getDocumento());

        if (
                clienteRepository.existsByDocumentoAndEmpresaId(
                        documentoNormalizado,
                        empresaId
                )
        ) {
            throw new IllegalArgumentException(
                    "Já existe um cliente com este CPF ou CNPJ."
            );
        }

        Cliente cliente = new Cliente();

        cliente.setNome(request.getNome().trim());
        cliente.setDocumento(documentoNormalizado);
        cliente.setEmail(normalizarTexto(request.getEmail()));
        cliente.setTelefone(limparNumero(request.getTelefone()));
        cliente.setEndereco(normalizarTexto(request.getEndereco()));
        cliente.setAtivo(true);
        cliente.setEmpresa(usuario.getEmpresa());

        Cliente clienteSalvo =
                clienteRepository.save(cliente);

        return converterParaResponse(clienteSalvo);
    }

    @Transactional(readOnly = true)
    public Page<ClienteResponse> listar(
            int pagina,
            int tamanho,
            Authentication authentication
    ) {

        Usuario usuario = buscarUsuarioAutenticado(authentication);

        validarPaginacao(pagina, tamanho);

        Pageable pageable = PageRequest.of(
                pagina,
                tamanho,
                Sort.by("nome").ascending()
        );

        Page<Cliente> clientes =
                clienteRepository.findByEmpresaId(
                        usuario.getEmpresa().getId(),
                        pageable
                );

        return clientes.map(this::converterParaResponse);
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscarPorId(
            Long clienteId,
            Authentication authentication
    ) {

        Cliente cliente =
                buscarClienteDaEmpresa(
                        clienteId,
                        authentication
                );

        return converterParaResponse(cliente);
    }

    @Transactional
    public ClienteResponse atualizar(
            Long clienteId,
            ClienteRequest request,
            Authentication authentication
    ) {

        Usuario usuario = buscarUsuarioAutenticado(authentication);

        Long empresaId = usuario.getEmpresa().getId();

        Cliente cliente = clienteRepository
                .findByIdAndEmpresaId(
                        clienteId,
                        empresaId
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Cliente não encontrado."
                        )
                );

        String documentoNormalizado =
                limparNumero(request.getDocumento());

        boolean documentoAlterado =
                !cliente.getDocumento().equals(documentoNormalizado);

        if (
                documentoAlterado &&
                clienteRepository.existsByDocumentoAndEmpresaId(
                        documentoNormalizado,
                        empresaId
                )
        ) {
            throw new IllegalArgumentException(
                    "Já existe outro cliente com este CPF ou CNPJ."
            );
        }

        cliente.setNome(request.getNome().trim());
        cliente.setDocumento(documentoNormalizado);
        cliente.setEmail(normalizarTexto(request.getEmail()));
        cliente.setTelefone(limparNumero(request.getTelefone()));
        cliente.setEndereco(normalizarTexto(request.getEndereco()));

        Cliente clienteAtualizado =
                clienteRepository.save(cliente);

        return converterParaResponse(clienteAtualizado);
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> pesquisarPorNome(
            String nome,
            Authentication authentication
    ) {

        Usuario usuario = buscarUsuarioAutenticado(authentication);

        String nomePesquisado =
                nome == null ? "" : nome.trim();

        return clienteRepository
                .findByEmpresaIdAndNomeContainingIgnoreCaseOrderByNomeAsc(
                        usuario.getEmpresa().getId(),
                        nomePesquisado
                )
                .stream()
                .map(this::converterParaResponse)
                .toList();
    }

    @Transactional
    public ClienteResponse inativar(
            Long clienteId,
            Authentication authentication
    ) {

        Cliente cliente =
                buscarClienteDaEmpresa(
                        clienteId,
                        authentication
                );

        if (!cliente.isAtivo()) {
            throw new IllegalArgumentException(
                    "Este cliente já está inativo."
            );
        }

        cliente.setAtivo(false);

        Cliente clienteAtualizado =
                clienteRepository.save(cliente);

        return converterParaResponse(clienteAtualizado);
    }

    @Transactional
    public ClienteResponse reativar(
            Long clienteId,
            Authentication authentication
    ) {

        Cliente cliente =
                buscarClienteDaEmpresa(
                        clienteId,
                        authentication
                );

        if (cliente.isAtivo()) {
            throw new IllegalArgumentException(
                    "Este cliente já está ativo."
            );
        }

        cliente.setAtivo(true);

        Cliente clienteAtualizado =
                clienteRepository.save(cliente);

        return converterParaResponse(clienteAtualizado);
    }

    private Cliente buscarClienteDaEmpresa(
            Long clienteId,
            Authentication authentication
    ) {

        Usuario usuario = buscarUsuarioAutenticado(authentication);

        return clienteRepository
                .findByIdAndEmpresaId(
                        clienteId,
                        usuario.getEmpresa().getId()
                )
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Cliente não encontrado."
                        )
                );
    }

    private Usuario buscarUsuarioAutenticado(
            Authentication authentication
    ) {

        if (
                authentication == null ||
                authentication.getName() == null ||
                authentication.getName().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Usuário não autenticado."
            );
        }

        return usuarioRepository
                .findByEmail(authentication.getName())
                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "Usuário autenticado não encontrado."
                        )
                );
    }

    private ClienteResponse converterParaResponse(
            Cliente cliente
    ) {

        return new ClienteResponse(
                cliente.getId(),
                cliente.getNome(),
                cliente.getDocumento(),
                cliente.getEmail(),
                cliente.getTelefone(),
                cliente.getEndereco(),
                cliente.isAtivo()
        );
    }

    private void validarPaginacao(
            int pagina,
            int tamanho
    ) {

        if (pagina < 0) {
            throw new IllegalArgumentException(
                    "A página não pode ser negativa."
            );
        }

        if (tamanho < 1 || tamanho > 100) {
            throw new IllegalArgumentException(
                    "O tamanho da página deve estar entre 1 e 100."
            );
        }
    }

    private String limparNumero(String valor) {

        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.replaceAll("\\D", "");
    }

    private String normalizarTexto(String valor) {

        if (valor == null || valor.isBlank()) {
            return null;
        }

        return valor.trim();
    }
}