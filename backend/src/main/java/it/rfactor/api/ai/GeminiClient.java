package it.rfactor.api.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

/** Gemini via its OpenAI-compatible chat completions endpoint. */
@Service
public class GeminiClient {
    private final GeminiProperties props;
    private final RestClient http;

    GeminiClient(GeminiProperties props, RestClient.Builder builder) {
        this.props = props;
        this.http = builder.build();
    }

    public boolean configured() { return props.configured(); }

    public String chat(String system, String prompt) { return complete(system, prompt, false); }

    /** Forces a JSON object reply. The system prompt must mention "JSON". */
    public String chatJson(String system, String prompt) { return complete(system, prompt, true); }

    private String complete(String system, String prompt, boolean json) {
        if (!props.configured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini not configured: set GEMINI_API_KEY");
        }
        var messages = new ArrayList<Map<String, String>>();
        if (system != null && !system.isBlank()) messages.add(Map.of("role", "system", "content", system));
        messages.add(Map.of("role", "user", "content", prompt));
        var body = new java.util.HashMap<String, Object>(Map.of("model", props.model(), "messages", messages));
        if (json) body.put("response_format", Map.of("type", "json_object"));
        var url = props.baseUrl().replaceAll("/+$", "") + "/chat/completions";
        try {
            var res = http.post().uri(url).header("Authorization", "Bearer " + props.apiKey()).body(body).retrieve().body(Completion.class);
            return res.choices().get(0).message().content();
        } catch (org.springframework.web.client.RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini error " + e.getStatusCode().value());
        } catch (RestClientException e) { // timeout / connection
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Gemini unreachable");
        }
    }

    record Completion(List<Choice> choices) {}
    record Choice(Message message) {}
    record Message(String content) {}
}
