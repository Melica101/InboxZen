package it.rfactor.api.workspace;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import it.rfactor.api.model.User;
import it.rfactor.api.repo.Users;

/** On every startup: creates the demo account if missing and resets it to the pre-analysis demo state (full mailbox, nothing analyzed). */
@Configuration
class DbInit {
    static final String EMAIL = "demo@inboxzen.test", PASSWORD = "test";

    @Bean
    ApplicationRunner initDemoUser(Users users, PasswordEncoder encoder, Seeder seeder) {
        return args -> {
            var u = users.findByEmailIgnoreCase(EMAIL).orElseGet(() -> {
                var n = new User();
                n.email = EMAIL; n.name = "Demo User"; n.passwordHash = encoder.encode(PASSWORD);
                return users.save(n);
            });
            seeder.seedMailbox(u.id);
        };
    }
}
