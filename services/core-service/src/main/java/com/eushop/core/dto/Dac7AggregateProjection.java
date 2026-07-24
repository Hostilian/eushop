package com.eushop.core.dto;

import java.math.BigDecimal;

public interface Dac7AggregateProjection {
    String getSellerId();
    BigDecimal getTotalConsideration();
    Long getTransactionCount();
    BigDecimal getPlatformFeeTotal();
    BigDecimal getSellerPayoutTotal();
}
