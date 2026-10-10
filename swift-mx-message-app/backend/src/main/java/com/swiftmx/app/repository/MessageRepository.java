package com.swiftmx.app.repository;

import com.swiftmx.app.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    Optional<Message> findByMessageId(String messageId);
    
    boolean existsByMessageId(String messageId);
    
    List<Message> findAllByOrderByCreatedAtDesc();

    @Query("SELECT m FROM Message m WHERE " +
           "LOWER(m.messageId) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.messageType) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.senderName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.senderBic) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.receiverName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.receiverBic) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.debtorName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.creditorName) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY m.createdAt DESC")
    List<Message> searchMessages(@Param("q") String q);
}
