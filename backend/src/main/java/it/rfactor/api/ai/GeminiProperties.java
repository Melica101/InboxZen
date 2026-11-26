package it.rfactor.api.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("gemini")
public record GeminiProperties(String apiKey, String model, String baseUrl) {
    boolean configured() {
        return !apiKey.isBlank() && !model.isBlank();
    }
}
