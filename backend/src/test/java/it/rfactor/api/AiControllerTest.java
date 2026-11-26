package it.rfactor.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void health() throws Exception {
        mvc.perform(get("/api/health")).andExpect(status().isOk()).andExpect(content().string("ok"));
    }

    @Test
    void protectedRouteWithoutTokenIs401() throws Exception {
        mvc.perform(get("/api/emails")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/ai/chat").contentType(MediaType.APPLICATION_JSON).content("{\"prompt\":\"hi\"}")).andExpect(status().isUnauthorized());
    }

    @Test
    void garbageTokenIs401() throws Exception {
        mvc.perform(get("/api/emails").header("Authorization", "Bearer nope")).andExpect(status().isUnauthorized());
    }
}
