package it.rfactor.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import it.rfactor.api.model.ActionStatus;
import it.rfactor.api.model.RiskStatus;
import it.rfactor.api.model.Space;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
class WebConfig implements WebMvcConfigurer {
    @Value("${app.cors-origins}")
    private String[] origins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(origins).allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
    }

    /** `?space=work` and `?space=WORK` both work. */
    @Override
    public void addFormatters(FormatterRegistry r) {
        ci(r, Space.class); ci(r, RiskStatus.class); ci(r, ActionStatus.class);
    }

    private static <E extends Enum<E>> void ci(FormatterRegistry r, Class<E> type) {
        r.addConverter(String.class, type, s -> Enum.valueOf(type, s.trim().toUpperCase()));
    }
}
