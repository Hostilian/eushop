package com.eushop.core.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * SecurityHeadersFilter injects mandatory security headers (CSP, HSTS, X-Frame-Options,
 * X-Content-Type-Options, Referrer-Policy) across all API responses.
 */
@Component
public class SecurityHeadersFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (response instanceof HttpServletResponse httpResponse) {
            httpResponse.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com;");
            httpResponse.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
            httpResponse.setHeader("X-Frame-Options", "DENY");
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            httpResponse.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        }
        chain.doFilter(request, response);
    }
}
