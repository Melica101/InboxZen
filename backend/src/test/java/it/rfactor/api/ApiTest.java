package it.rfactor.api;

import it.rfactor.api.ai.AzureClient;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import it.rfactor.api.ai.AzureClient;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @MockitoBean AzureClient azure;

    static final AtomicInteger N = new AtomicInteger();

    String register() throws Exception {
        var body = "{\"email\":\"u%d@x.io\",\"password\":\"password123\",\"name\":\"U\"}".formatted(N.incrementAndGet());
        var res = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(res).get("token").asText();
    }

    MockHttpServletRequestBuilder as(String token, MockHttpServletRequestBuilder b) { return b.header("Authorization", "Bearer " + token); }

    JsonNode call(String token, MockHttpServletRequestBuilder b) throws Exception {
        return json.readTree(mvc.perform(as(token, b)).andExpect(status().is2xxSuccessful()).andReturn().getResponse().getContentAsString());
    }

    @Test
    void duplicateRegisterIs409AndBadLoginIs401() throws Exception {
        register();
        var body = "{\"email\":\"u%d@x.io\",\"password\":\"password123\",\"name\":\"U\"}".formatted(N.get());
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict());
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"u%d@x.io\",\"password\":\"wrongwrong\"}".formatted(N.get())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerSeedsDemoWorkspace() throws Exception {
        var t = register();
        var b = call(t, get("/api/briefing"));
        org.junit.jupiter.api.Assertions.assertEquals(4, b.at("/metrics/openCommitments").asInt());
        org.junit.jupiter.api.Assertions.assertEquals(1, b.at("/metrics/activeRisks").asInt());
        org.junit.jupiter.api.Assertions.assertEquals(1, b.get("conflicts").size()); // Acme presentation vs private appointment
        org.junit.jupiter.api.Assertions.assertEquals(7, call(t, get("/api/emails")).size());
        org.junit.jupiter.api.Assertions.assertEquals(5, call(t, get("/api/emails?space=work")).size());
    }

    @Test
    void userCannotReadAnotherUsersData() throws Exception {
        var a = register();
        var b = register();
        var emailOfA = call(a, get("/api/emails")).get(0).get("id").asLong();
        mvc.perform(as(b, get("/api/emails/" + emailOfA))).andExpect(status().isNotFound());
        var riskOfA = call(a, get("/api/risks")).get(0).get("id").asLong();
        mvc.perform(as(b, get("/api/risks/" + riskOfA))).andExpect(status().isNotFound());
        mvc.perform(as(b, post("/api/risks/" + riskOfA + "/escalation-draft"))).andExpect(status().isNotFound());
        mvc.perform(as(b, patch("/api/commitments/" + call(a, get("/api/commitments")).get(0).get("id").asLong())
                .contentType(MediaType.APPLICATION_JSON).content("{\"done\":true}"))).andExpect(status().isNotFound());
    }

    @Test
    void analyzeWithoutAzureIsDemoAndKeepsData() throws Exception {
        when(azure.configured()).thenReturn(false);
        var t = register();
        var r = call(t, post("/api/ai/analyze"));
        org.junit.jupiter.api.Assertions.assertEquals(2, r.size());
        org.junit.jupiter.api.Assertions.assertEquals("demo", r.get(0).get("mode").asText());
        org.junit.jupiter.api.Assertions.assertEquals(1, r.get(0).get("risks").size());
    }

    @Test
    void analyzeDisabledSpaceIs403() throws Exception {
        var t = register();
        call(t, put("/api/settings").contentType(MediaType.APPLICATION_JSON)
                .content("{\"analyzeWork\":false,\"analyzePersonal\":true,\"crossCalendar\":true,\"autonomy\":\"APPROVAL_REQUIRED\"}"));
        mvc.perform(as(t, post("/api/ai/analyze?space=work"))).andExpect(status().isForbidden());
    }

    @Test
    void hallucinatedSourceIdsAreDroppedAndAiRowsPersisted() throws Exception {
        when(azure.configured()).thenReturn(true);
        var t = register();
        var emails = call(t, get("/api/emails?space=work"));
        long real = emails.get(0).get("id").asLong();
        var reply = """
                {"summary":"S","priorities":[{"emailId":%d,"priority":"Critical"},{"emailId":999999,"priority":"Critical"}],
                 "commitments":[{"title":"Real","owner":"You","due":"Today","status":"Blocked","sourceIds":[%d,999999]},
                                {"title":"Invented","owner":"X","due":"?","status":"Blocked","sourceIds":[999999]}],
                 "risks":[{"title":"R","explanation":"e","severity":"high","status":"open","sourceIds":[%d],"chain":[{"title":"a","detail":"b"}]}]}
                """.formatted(real, real, real);
        when(azure.chatJson(any(), any())).thenReturn(reply);
        var res = call(t, post("/api/ai/analyze?space=work")).get(0);
        org.junit.jupiter.api.Assertions.assertEquals("live", res.get("mode").asText());
        org.junit.jupiter.api.Assertions.assertEquals(1, res.get("commitments").size());
        org.junit.jupiter.api.Assertions.assertEquals("Real", res.get("commitments").get(0).get("title").asText());
        org.junit.jupiter.api.Assertions.assertEquals(1, res.get("commitments").get(0).get("sourceIds").size());
        org.junit.jupiter.api.Assertions.assertEquals("High", res.get("risks").get(0).get("severity").asText());
        org.junit.jupiter.api.Assertions.assertEquals("S", res.get("summary").asText());
    }

    @Test
    void malformedAiJsonIs502() throws Exception {
        when(azure.configured()).thenReturn(true);
        when(azure.chatJson(any(), any())).thenReturn("not json");
        mvc.perform(as(register(), post("/api/ai/analyze?space=work"))).andExpect(status().isBadGateway());
    }

    @Test
    void rescheduleFlowRespectsAutonomyAndMovesEvent() throws Exception {
        when(azure.configured()).thenReturn(false);
        var t = register();
        var conflict = call(t, get("/api/calendar/conflicts")).get(0);
        long eventId = conflict.get("workEvent").get("id").asLong();
        var action = call(t, post("/api/calendar/events/" + eventId + "/reschedule-draft"));
        long id = action.get("id").asLong();
        org.junit.jupiter.api.Assertions.assertEquals("DRAFT", action.get("status").asText());
        // the draft must not leak the personal appointment
        org.junit.jupiter.api.Assertions.assertFalse(action.get("body").asText().toLowerCase().contains("private"));

        call(t, put("/api/settings").contentType(MediaType.APPLICATION_JSON)
                .content("{\"analyzeWork\":true,\"analyzePersonal\":true,\"crossCalendar\":true,\"autonomy\":\"RECOMMENDATIONS_ONLY\"}"));
        mvc.perform(as(t, post("/api/actions/" + id + "/approve"))).andExpect(status().isConflict());

        call(t, put("/api/settings").contentType(MediaType.APPLICATION_JSON)
                .content("{\"analyzeWork\":true,\"analyzePersonal\":true,\"crossCalendar\":true,\"autonomy\":\"APPROVAL_REQUIRED\"}"));
        org.junit.jupiter.api.Assertions.assertEquals("APPROVED", call(t, post("/api/actions/" + id + "/approve")).get("status").asText());
        mvc.perform(as(t, post("/api/actions/" + id + "/approve"))).andExpect(status().isConflict()); // already decided
        org.junit.jupiter.api.Assertions.assertEquals(0, call(t, get("/api/calendar/conflicts")).size()); // event moved
    }

    @Test
    void resolveRiskUnblocksCommitments() throws Exception {
        var t = register();
        var risk = call(t, get("/api/risks")).get(0);
        call(t, post("/api/risks/" + risk.get("id").asLong() + "/resolve"));
        var b = call(t, get("/api/briefing"));
        org.junit.jupiter.api.Assertions.assertEquals(0, b.at("/metrics/activeRisks").asInt());
        for (var c : call(t, get("/api/commitments?space=work")))
            org.junit.jupiter.api.Assertions.assertNotEquals("Blocked", c.get("status").asText());
        call(t, post("/api/demo/reset"));
        org.junit.jupiter.api.Assertions.assertEquals(1, call(t, get("/api/briefing")).at("/metrics/activeRisks").asInt());
    }

    @Test
    void ingestValidatesInput() throws Exception {
        var t = register();
        mvc.perform(as(t, post("/api/emails").contentType(MediaType.APPLICATION_JSON).content("{\"space\":\"WORK\",\"sender\":\"a\",\"body\":\"\"}")))
                .andExpect(status().isBadRequest());
        mvc.perform(as(t, post("/api/emails").contentType(MediaType.APPLICATION_JSON).content("{\"space\":\"WORK\",\"sender\":\"a\",\"subject\":\"s\",\"body\":\"hi\"}")))
                .andExpect(status().isCreated());
    }

    @Test
    void chatWithoutAzureKeyIs503() throws Exception {
        when(azure.chat(any(), any())).thenThrow(new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE));
        mvc.perform(as(register(), post("/api/ai/chat").contentType(MediaType.APPLICATION_JSON).content("{\"prompt\":\"hi\"}"))).andExpect(status().isServiceUnavailable());
        mvc.perform(as(register(), post("/api/ai/chat").contentType(MediaType.APPLICATION_JSON).content("{\"prompt\":\"\"}"))).andExpect(status().isBadRequest());
    }
}
