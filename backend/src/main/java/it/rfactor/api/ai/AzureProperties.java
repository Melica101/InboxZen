package it.rfactor.api.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("azure.openai")
public record AzureProperties(String endpoint, String apiKey, String deployment, String apiVersion) {
    boolean configured() {
        return !endpoint.isBlank() && !apiKey.isBlank() && !deployment.isBlank();
    }
}
