package com.eushop.core.repository;

import com.eushop.core.entity.Dac7AnnualSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface Dac7AnnualSnapshotRepository extends JpaRepository<Dac7AnnualSnapshot, String> {

    Optional<Dac7AnnualSnapshot> findBySellerIdAndReportingYear(String sellerId, Short reportingYear);

    List<Dac7AnnualSnapshot> findByReportingYear(Short reportingYear);
}
