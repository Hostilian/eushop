package com.eushop.core.model;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class MoneyTest {

    @Test
    void testMoneyScaleAndRounding() {
        Money m = Money.eur(12.3456);
        assertEquals(new BigDecimal("12.35"), m.getAmount());
        assertEquals("EUR", m.getCurrency());
    }

    @Test
    void testMoneyAddition() {
        Money m1 = Money.eur(10.50);
        Money m2 = Money.eur(5.25);
        Money sum = m1.add(m2);

        assertEquals(new BigDecimal("15.75"), sum.getAmount());
    }

    @Test
    void testCurrencyMismatchThrows() {
        Money m1 = Money.eur(10.00);
        Money m2 = new Money(BigDecimal.valueOf(10.00), "USD");

        assertThrows(IllegalArgumentException.class, () -> m1.add(m2));
    }
}
