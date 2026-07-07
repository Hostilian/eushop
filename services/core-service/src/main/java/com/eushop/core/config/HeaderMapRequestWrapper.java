package com.eushop.core.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.util.*;

public class HeaderMapRequestWrapper extends HttpServletRequestWrapper {
    private final Map<String, String> headerMap = new HashMap<>();
    private final Set<String> headersToRemove = new HashSet<>();

    public HeaderMapRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    public void addHeader(String name, String value) {
        headerMap.put(name.toLowerCase(), value);
        headersToRemove.remove(name.toLowerCase());
    }

    public void removeHeader(String name) {
        headersToRemove.add(name.toLowerCase());
        headerMap.remove(name.toLowerCase());
    }

    @Override
    public String getHeader(String name) {
        String key = name.toLowerCase();
        if (headersToRemove.contains(key)) {
            return null;
        }
        String headerValue = headerMap.get(key);
        if (headerValue != null) {
            return headerValue;
        }
        return super.getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaderNames() {
        List<String> names = new ArrayList<>();
        Enumeration<String> parentNames = super.getHeaderNames();
        while (parentNames.hasMoreElements()) {
            String name = parentNames.nextElement();
            if (!headersToRemove.contains(name.toLowerCase())) {
                names.add(name);
            }
        }
        for (String name : headerMap.keySet()) {
            if (!names.contains(name)) {
                names.add(name);
            }
        }
        return Collections.enumeration(names);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
        String key = name.toLowerCase();
        if (headersToRemove.contains(key)) {
            return Collections.enumeration(Collections.emptyList());
        }
        if (headerMap.containsKey(key)) {
            List<String> values = new ArrayList<>();
            values.add(headerMap.get(key));
            return Collections.enumeration(values);
        }
        return super.getHeaders(name);
    }
}
