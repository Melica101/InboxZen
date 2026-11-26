package it.rfactor.api.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
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

    public boolean configured() { return props.configured(); }

    public String chat(String system, String prompt) { return complete(system, prompt, false); }

    /** Forces a JSON object reply. The system prompt must mention "JSON" (Azure requirement). */
    public String chatJson(String system, String prompt) { return complete(system, prompt, true); }

    private String complete(String system, String prompt, boolean json) {
        if (!props.configured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Azure not configured: set AZURE_OPENAI_* env vars");
        }
        var messages = new ArrayList<Map<String, String>>();
        if (system != null && !system.isBlank()) messages.add(Map.of("role", "system", "content", system));
        messages.add(Map.of("role", "user", "content", prompt));
        Map<String, Object> body = json
                ? Map.of("messages", messages, "response_format", Map.of("type", "json_object"))
                : Map.of("messages", messages);
        var url = "%s/openai/deployments/%s/chat/completions?api-version=%s"
                .formatted(props.endpoint().replaceAll("/+$", ""), props.deployment(), props.apiVersion());
        try {
            var res = http.post().uri(url).header("api-key", props.apiKey()).body(body).retrieve().body(Completion.class);
            return res.choices().get(0).message().content();
        } catch (org.springframework.web.client.RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Azure error " + e.getStatusCode().value());
        } catch (RestClientException e) { // timeout / connection
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Azure unreachable");
        }
    }

    record Completion(List<Choice> choices) {}
    record Choice(Message message) {}
    record Message(String content) {}
}
