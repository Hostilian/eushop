package com.eushop.core.config;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.JwkProviderBuilder;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${AUTH0_DOMAIN:}")
    private String auth0Domain;

    @Value("${AUTH0_AUDIENCE:}")
    private String auth0Audience;

    @Value("${NEXT_PUBLIC_USE_MOCK_AUTH:true}")
    private boolean useMockAuth;

    private JwkProvider jwkProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private synchronized JwkProvider getJwkProvider() {
        if (jwkProvider == null && auth0Domain != null && !auth0Domain.isEmpty()) {
            try {
                String url = auth0Domain.startsWith("http") ? auth0Domain : "https://" + auth0Domain;
                jwkProvider = new JwkProviderBuilder(new URL(url))
                        .cached(10, 24, TimeUnit.HOURS)
                        .build();
            } catch (Exception e) {
                log.error("Failed to build JWK Provider: {}", e.getMessage());
            }
        }
        return jwkProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Strip any user-supplied X-User-Id, X-User-Email, X-User-Role headers to prevent spoofing
        HeaderMapRequestWrapper wrappedRequest = new HeaderMapRequestWrapper(request);
        wrappedRequest.removeHeader("X-User-Id");
        wrappedRequest.removeHeader("X-User-Email");
        wrappedRequest.removeHeader("X-User-Role");

        String token = extractToken(request);

        if (token != null && !token.isEmpty()) {
            try {
                if (isMockTokenAllowed() && isMockTokenFormat(token)) {
                    // Process Mock Authentication
                    processMockAuthentication(token, wrappedRequest);
                } else {
                    // Process Real Auth0 JWT Authentication
                    processJwtAuthentication(token, wrappedRequest);
                }
            } catch (Exception e) {
                log.error("Authentication failed: {}", e.getMessage());
                SecurityContextHolder.clearContext();
                // We do not block the request here; SecurityConfig decides if the path requires authentication
            }
        }

        filterChain.doFilter(wrappedRequest, response);
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // Try Cookie extraction
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private boolean isMockTokenAllowed() {
        boolean isDevOrTest = "dev".equalsIgnoreCase(activeProfile) || "test".equalsIgnoreCase(activeProfile);
        return isDevOrTest && useMockAuth;
    }

    private boolean isMockTokenFormat(String token) {
        // Base64 mock token doesn't have 3 dot-separated segments like JWT
        return token.split("\\.").length != 3;
    }

    private void processMockAuthentication(String token, HeaderMapRequestWrapper request) throws Exception {
        byte[] decodedBytes = Base64.getDecoder().decode(token);
        Map<String, Object> claims = objectMapper.readValue(decodedBytes, Map.class);

        String userId = String.valueOf(claims.getOrDefault("sub", claims.getOrDefault("userId", "mock-user-id")));
        String email = String.valueOf(claims.getOrDefault("email", "mock-user@eushop.eu"));
        String role = String.valueOf(claims.getOrDefault("role", "BUYER")).toUpperCase();

        setAuthentication(userId, email, role, request);
        log.debug("Authenticated user {} via Mock Auth (Role: {})", userId, role);
    }

    private void processJwtAuthentication(String token, HeaderMapRequestWrapper request) throws Exception {
        DecodedJWT jwt = JWT.decode(token);
        JwkProvider provider = getJwkProvider();
        if (provider == null) {
            throw new IllegalStateException("Auth0 JWK Provider not configured");
        }

        Jwk jwk = provider.get(jwt.getKeyId());
        Algorithm algorithm = Algorithm.RSA256((RSAPublicKey) jwk.getPublicKey(), null);

        String domain = auth0Domain.startsWith("http") ? auth0Domain : "https://" + auth0Domain;
        if (!domain.endsWith("/")) {
            domain += "/";
        }

        JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer(domain)
                .withAudience(auth0Audience)
                .build();

        DecodedJWT verifiedJwt = verifier.verify(token);

        String userId = verifiedJwt.getSubject();
        String email = verifiedJwt.getClaim("email").asString();
        if (email == null) email = "";

        // Auth0 custom claim namespace is typically https://eushop.eu/role
        String role = verifiedJwt.getClaim("https://eushop.eu/role").asString();
        if (role == null) {
            role = "BUYER";
        }
        role = role.toUpperCase();

        setAuthentication(userId, email, role, request);
        log.debug("Authenticated user {} via Auth0 JWT (Role: {})", userId, role);
    }

    private void setAuthentication(String userId, String email, String role, HeaderMapRequestWrapper request) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userId, null, Collections.singletonList(authority));
        SecurityContextHolder.getContext().setAuthentication(auth);

        // Inject verified headers into request wrapper
        request.addHeader("X-User-Id", userId);
        request.addHeader("X-User-Email", email);
        request.addHeader("X-User-Role", role);
    }
}
