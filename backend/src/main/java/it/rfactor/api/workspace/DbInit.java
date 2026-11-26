package it.rfactor.api.workspace;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import it.rfactor.api.model.User;
import it.rfactor.api.repo.Users;

/** Creates the empty demo account on startup if missing. Mails are added via scripts/load_emails.py. */
@Configuration
class DbInit {
    static final String EMAIL = "demo@inboxzen.test", PASSWORD = "test";

    @Bean
    ApplicationRunner initDemoUser(Users users, PasswordEncoder encoder) {
        return args -> {
            if (users.findByEmailIgnoreCase(EMAIL).isPresent()) return;
            var u = new User();
            u.email = EMAIL; u.name = "Demo User"; u.passwordHash = encoder.encode(PASSWORD);
            users.save(u);
        };
    }
}
