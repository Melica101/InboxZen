package it.rfactor.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AiController {
    private final AzureClient azure;

    AiController(AzureClient azure) {
        this.azure = azure;
    }

    record ChatRequest(String system, @NotBlank String prompt) {}
    record ChatResponse(String reply) {}

    @GetMapping("/health")
    String health() {
        return "ok";
    }

    @PostMapping("/ai/chat")
    ChatResponse chat(@Valid @RequestBody ChatRequest req) {
        return new ChatResponse(azure.chat(req.system(), req.prompt()));
    }
}
