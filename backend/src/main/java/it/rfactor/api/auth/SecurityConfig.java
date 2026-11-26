package it.rfactor.api.auth;

import static org.springframework.security.config.Customizer.withDefaults;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

/** Stateless JWT (HS256) auth. Every /api route except health/auth/docs needs a bearer token. */
@Configuration
class SecurityConfig {
    @Bean
    SecretKey jwtKey(@Value("${app.jwt-secret:}") String secret) {
        byte[] b = secret.getBytes(StandardCharsets.UTF_8);
        if (b.length == 0) {
            // ponytail: random key = all tokens die on restart. Set JWT_SECRET for stable sessions.
            LoggerFactory.getLogger(SecurityConfig.class).warn("JWT_SECRET not set: using a random key, tokens invalid after restart");
            b = new byte[32];
            new SecureRandom().nextBytes(b);
        } else if (b.length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes");
        }
        return new SecretKeySpec(b, "HmacSHA256");
    }

    @Bean JwtEncoder jwtEncoder(SecretKey key) { return new NimbusJwtEncoder(new ImmutableSecret<>(key)); }

    @Bean JwtDecoder jwtDecoder(SecretKey key) { return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build(); }

    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http
                .csrf(c -> c.disable()) // stateless bearer auth, no cookies
                .cors(withDefaults())   // uses CorsConfig
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/health", "/api/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o.jwt(withDefaults()))
                .build();
    }
}
