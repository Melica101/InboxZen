package it.rfactor.api.common;

import java.security.Principal;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Tiny helpers shared by controllers. */
public final class Api {
    private Api() {}

    /** The caller, always taken from the verified JWT subject. */
    public static Long uid(Principal p) { return Long.valueOf(p.getName()); }

    /** Rows of other users are looked up by (id, userId), so they surface as plain 404. */
    public static <T> T found(Optional<T> o) { return o.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)); }

    public static ResponseStatusException bad(String msg) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg); }
}
