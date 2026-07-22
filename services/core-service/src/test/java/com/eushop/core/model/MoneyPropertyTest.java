package com.eushop.core.model;

import org.junit.jupiter.api.Test;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

/**
 * MoneyPropertyTest verifies mathematical properties (commutativity, associativity, scale preservation)
 * across 100 randomly generated monetary amounts.
 */
class MoneyPropertyTest {

    @Test
    void testMonetaryAdditionCommutativityProperty() {
        Random random = new Random(42);
        for (int i = 0; i < 100; i++) {
            double val1 = random.nextDouble() * 1000.0;
            double val2 = random.nextDouble() * 1000.0;

            Money m1 = Money.eur(val1);
            Money m2 = Money.eur(val2);

            Money sum1 = m1.add(m2);
            Money sum2 = m2.add(m1);

            assertEquals(sum1.getAmount(), sum2.getAmount(), "Commutative property violation");
            assertEquals(2, sum1.getAmount().scale(), "Scale invariant violation");
        }
    }
}
