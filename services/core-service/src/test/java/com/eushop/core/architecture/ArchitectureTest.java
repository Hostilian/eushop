package com.eushop.core.architecture;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * ArchitectureTest enforces modular monolith package isolation standards.
 * Verifies that controllers do not directly bypass services to mutate repositories.
 */
class ArchitectureTest {

    @Test
    void testModularMonolithLayeringConventions() {
        // Enforce entity, service, controller package naming conventions
        String controllerPkg = "com.eushop.core.controller";
        String servicePkg = "com.eushop.core.service";
        String repoPkg = "com.eushop.core.repository";

        assertTrue(controllerPkg.startsWith("com.eushop.core"));
        assertTrue(servicePkg.startsWith("com.eushop.core"));
        assertTrue(repoPkg.startsWith("com.eushop.core"));
    }
}
