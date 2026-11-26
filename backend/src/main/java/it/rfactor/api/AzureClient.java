package it.rfactor.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

/** Azure OpenAI chat completions, authenticated with the `api-key` header. */
@Service
public class AzureClient {
    private final AzureProperties props;
    private final RestClient http;

    AzureClient(AzureProperties props, RestClient.Builder builder) {
        this.props = props;
        this.http = builder.build();
    }

    public String chat(String system, String prompt) {
        if (!props.configured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Azure not configured: set AZURE_OPENAI_* env vars");
        }
        var messages = system == null || system.isBlank()
                ? List.of(Map.of("role", "user", "content", prompt))
                : List.of(Map.of("role", "system", "content", system), Map.of("role", "user", "content", prompt));
        var url = "%s/openai/deployments/%s/chat/completions?api-version=%s"
                .formatted(props.endpoint().replaceAll("/+$", ""), props.deployment(), props.apiVersion());
        try {
            var res = http.post().uri(url)
                    .header("api-key", props.apiKey())
                    .body(Map.of("messages", messages))
                    .retrieve()
                    .body(Completion.class);
            return res.choices().get(0).message().content();
        } catch (org.springframework.web.client.RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Azure error " + e.getStatusCode().value());
        }
    }

    record Completion(List<Choice> choices) {}
    record Choice(Message message) {}
    record Message(String content) {}
}
