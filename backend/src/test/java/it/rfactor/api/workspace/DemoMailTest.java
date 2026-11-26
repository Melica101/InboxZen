package it.rfactor.api.workspace;

import it.rfactor.api.ai.AiService;
import it.rfactor.api.workspace.DemoMail;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import it.rfactor.api.model.Space;

class DemoMailTest {
    @Test
    void generatesDeterministicValidMailbox() {
        var z = ZoneId.of("Europe/Rome");
        var d = LocalDate.of(2026, 11, 26);
        var a = DemoMail.generate(1L, 150, 42, z, d);
        assertEquals(150, a.size());
        assertEquals(a.stream().map(e -> e.subject + e.receivedAt).toList(), DemoMail.generate(1L, 150, 42, z, d).stream().map(e -> e.subject + e.receivedAt).toList());
        for (var e : a) {
            assertTrue(AiService.PRIORITIES.contains(e.priority), e.priority);
            assertFalse(e.subject.contains("%") || e.body.contains("%") || e.sender.contains("%"), "unfilled placeholder: " + e.subject);
            assertFalse(e.receivedAt.isAfter(d.plusDays(1).atStartOfDay(z).toInstant()));
        }
        var bySpace = a.stream().collect(Collectors.groupingBy(e -> e.space, Collectors.counting()));
        assertTrue(bySpace.get(Space.WORK) > bySpace.get(Space.PERSONAL));
    }
}
