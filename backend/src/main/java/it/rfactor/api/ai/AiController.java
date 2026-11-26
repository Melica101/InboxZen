package it.rfactor.api.ai;

import it.rfactor.api.common.Api;
import java.security.Principal;
import java.util.ArrayList;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import it.rfactor.api.model.Space;
import it.rfactor.api.repo.Users;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api")
public class AiController {
    private final AzureClient azure;
    private final AiService ai;
    private final Users users;

    AiController(AzureClient azure, AiService ai, Users users) {
        this.azure = azure; this.ai = ai; this.users = users;
    }

    record ChatRequest(String system, @NotBlank String prompt) {}
    record ChatResponse(String reply) {}

    @GetMapping("/health")
    String health() {
        return "ok";
    }

    /**
     * Prioritizes emails, extracts commitments and risks (with dependency chain), and stores them.
     * One Azure request per space. Without `space`, every space enabled in settings is analyzed.
     * `mode` is "live", or "demo" when Azure isn't configured (data left untouched).
     */
    @PostMapping("/ai/analyze")
    java.util.List<AiService.Result> analyze(Principal p, @RequestParam(required = false) Space space) {
        var uid = Api.uid(p);
        if (space != null) return java.util.List.of(ai.analyze(uid, space));
        var u = users.findById(uid).orElseThrow();
        var out = new ArrayList<AiService.Result>();
        for (var s : Space.values()) if (u.canAnalyze(s)) out.add(ai.analyze(uid, s));
        return out;
    }

    /** Raw LLM passthrough (not used by the app screens). */
    @PostMapping("/ai/chat")
    ChatResponse chat(@Valid @RequestBody ChatRequest req) {
        return new ChatResponse(azure.chat(req.system(), req.prompt()));
    }
}
