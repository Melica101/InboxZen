package it.rfactor.api.auth;

import java.security.Principal;
import java.time.Duration;
import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import it.rfactor.api.workspace.Seeder;
import it.rfactor.api.model.User;
import it.rfactor.api.repo.Users;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api")
public class AuthController {
    record RegisterRequest(@Email @NotBlank String email, @NotBlank @Size(min = 8, max = 72) String password, @NotBlank @Size(max = 100) String name) {}
    record LoginRequest(@NotBlank String email, @NotBlank String password) {}
    record Profile(Long id, String email, String name) {}
    record AuthResponse(String token, Profile user) {}

    private static final Duration TTL = Duration.ofHours(12);

    private final Users users;
    private final PasswordEncoder encoder;
    private final JwtEncoder jwt;
    private final Seeder seeder;

    AuthController(Users users, PasswordEncoder encoder, JwtEncoder jwt, Seeder seeder) {
        this.users = users; this.encoder = encoder; this.jwt = jwt; this.seeder = seeder;
    }

    @PostMapping("/auth/register")
    @Transactional
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    AuthResponse register(@Valid @RequestBody RegisterRequest r) {
        if (users.findByEmailIgnoreCase(r.email()).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        var u = new User();
        u.email = r.email().trim().toLowerCase();
        u.name = r.name().trim();
        u.passwordHash = encoder.encode(r.password());
        users.save(u);
        seeder.seed(u.id); // new accounts start with the synthetic demo workspace
        return respond(u);
    }

    @PostMapping("/auth/login")
    AuthResponse login(@Valid @RequestBody LoginRequest r) {
        var u = users.findByEmailIgnoreCase(r.email()).filter(x -> encoder.matches(r.password(), x.passwordHash))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        return respond(u);
    }

    @GetMapping("/me")
    Profile me(Principal p) {
        var u = users.findById(Long.valueOf(p.getName())).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return new Profile(u.id, u.email, u.name);
    }

    private AuthResponse respond(User u) {
        var now = Instant.now();
        var claims = JwtClaimsSet.builder().issuer("inboxzen").subject(String.valueOf(u.id)).issuedAt(now).expiresAt(now.plus(TTL)).build();
        // header must name HS256 explicitly, otherwise Nimbus picks RS256 and fails
        var token = jwt.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new AuthResponse(token, new Profile(u.id, u.email, u.name));
    }
}
