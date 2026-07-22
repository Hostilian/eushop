package com.eushop.core.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * OpenTelemetryConfig initializes correlation IDs (request_id, trace_id)
 * and attaches W3C traceparent headers across incoming HTTP requests.
 */
@Component
public class OpenTelemetryConfig implements Filter {

    public static final String REQUEST_ID_HEADER = "X-Request-ID";
    public static final String TRACE_PARENT_HEADER = "traceparent";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (request instanceof HttpServletRequest httpRequest && response instanceof HttpServletResponse httpResponse) {
            String requestId = httpRequest.getHeader(REQUEST_ID_HEADER);
            if (requestId == null || requestId.isEmpty()) {
                requestId = "req-" + UUID.randomUUID().toString().substring(0, 8);
            }

            String traceParent = httpRequest.getHeader(TRACE_PARENT_HEADER);
            if (traceParent == null || traceParent.isEmpty()) {
                traceParent = "00-" + UUID.randomUUID().toString().replace("-", "") + "-0000000000000001-01";
            }

            MDC.put("request_id", requestId);
            MDC.put("trace_id", traceParent);

            httpResponse.setHeader(REQUEST_ID_HEADER, requestId);
            httpResponse.setHeader(TRACE_PARENT_HEADER, traceParent);

            try {
                chain.doFilter(request, response);
            } finally {
                MDC.clear();
            }
        } else {
            chain.doFilter(request, response);
        }
    }
}
