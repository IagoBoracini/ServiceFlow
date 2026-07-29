package com.ServiceFlow.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME =
            "bearerAuth";

    @Bean
    public OpenAPI serviceFlowOpenAPI() {

        Contact contato = new Contact()
                .name("ServiceFlow");

        Info informacoes = new Info()
                .title("ServiceFlow API")
                .description(
                        "API para gerenciamento de empresas, usuários, "
                                + "clientes, chamados e ordens de serviço."
                )
                .version("1.0.0")
                .contact(contato);

        SecurityScheme esquemaJwt = new SecurityScheme()
                .name(SECURITY_SCHEME_NAME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description(
                        "Informe o token JWT obtido no login."
                );

        Components componentes = new Components()
                .addSecuritySchemes(
                        SECURITY_SCHEME_NAME,
                        esquemaJwt
                );

        SecurityRequirement seguranca =
                new SecurityRequirement()
                        .addList(SECURITY_SCHEME_NAME);

        return new OpenAPI()
                .info(informacoes)
                .components(componentes)
                .addSecurityItem(seguranca);
    }
}