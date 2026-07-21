package com.eushop.core.repository;

import com.eushop.core.entity.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, String> {
    List<MessageReaction> findByMessageId(String messageId);
}
