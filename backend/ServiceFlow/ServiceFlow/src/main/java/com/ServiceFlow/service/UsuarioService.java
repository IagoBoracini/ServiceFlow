package com.ServiceFlow.service;

import com.ServiceFlow.dto.AlterarSenhaRequest;
import com.ServiceFlow.dto.AtualizarPerfilRequest;
import com.ServiceFlow.dto.MensagemResponse;
import com.ServiceFlow.dto.UsuarioPerfilResponse;
import com.ServiceFlow.model.StatusUsuario;
import com.ServiceFlow.model.Usuario;
import com.ServiceFlow.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UsuarioPerfilResponse buscarPerfil(
            Authentication authentication
    ) {
        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        return converterParaResponse(usuario);
    }

    @Transactional
    public UsuarioPerfilResponse atualizarPerfil(
            AtualizarPerfilRequest request,
            Authentication authentication
    ) {
        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        usuario.setNome(
                request.getNome().trim()
        );

        Usuario usuarioAtualizado =
                usuarioRepository.save(usuario);

        return converterParaResponse(
                usuarioAtualizado
        );
    }

    @Transactional
    public MensagemResponse alterarSenha(
            AlterarSenhaRequest request,
            Authentication authentication
    ) {
        Usuario usuario =
                buscarUsuarioAutenticado(authentication);

        boolean senhaAtualCorreta =
                passwordEncoder.matches(
                        request.getSenhaAtual(),
                        usuario.getSenha()
                );

        if (!senhaAtualCorreta) {
            throw new IllegalArgumentException(
                    "A senha atual está incorreta."
            );
        }

        boolean novaSenhaIgualAtual =
                passwordEncoder.matches(
                        request.getNovaSenha(),
                        usuario.getSenha()
                );

        if (novaSenhaIgualAtual) {
            throw new IllegalArgumentException(
                    "A nova senha deve ser diferente da senha atual."
            );
        }

        usuario.setSenha(
                passwordEncoder.encode(
                        request.getNovaSenha()
                )
        );

        usuarioRepository.save(usuario);

        return new MensagemResponse(
                "Senha alterada com sucesso."
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

        Usuario usuario =
                usuarioRepository
                        .findByEmail(
                                authentication.getName()
                        )
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Usuário autenticado não encontrado."
                                )
                        );

        if (usuario.getStatus() != StatusUsuario.ATIVO) {
            throw new IllegalStateException(
                    "Seu usuário não está ativo."
            );
        }

        return usuario;
    }

    private UsuarioPerfilResponse converterParaResponse(
            Usuario usuario
    ) {
        Long empresaId = null;

        if (usuario.getEmpresa() != null) {
            empresaId =
                    usuario.getEmpresa().getId();
        }

        return new UsuarioPerfilResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCargo(),
                usuario.getStatus(),
                empresaId
        );
    }
}