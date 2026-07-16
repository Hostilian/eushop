# EUshop Chat Feature Documentation

## Overview
The EUshop chat feature enables secure, GDPR-compliant communication between buyers and sellers within the EU Single Market. It supports:

- Real-time messaging between marketplace participants
- Conversation history and management
- GDPR compliance (data export, erasure, consent)
- Secure authentication with HTTP-only cookies
- Graceful degradation for reliability

## Architecture

### Backend
- **Service**: `services/core-service/src/main/java/com/eushop/core/service/ConversationService.java`
- **Controller**: `services/core-service/src/main/java/com/eushop/core/controller/ConversationController.java`
- **Entities**: `Conversation.java` and `Message.java`
- **Database**: PostgreSQL with JPA

### Frontend
- **Service**: `apps/web/lib/services/chatService.ts`
- **Components**: `apps/web/components/chat/`
- **Pages**: `apps/web/pages/chat/`
- **API Client**: `apps/web/lib/api-client.ts`

## API Endpoints

### Conversations
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/conversations` | POST | Create new conversation | `buyerId`, `sellerId`, `subject`, `foodId` (optional) |
| `/api/conversations/{id}` | GET | Get conversation details | `id` (path) |
| `/api/conversations/buyer/{buyerId}` | GET | Get conversations for buyer | `buyerId` (path) |
| `/api/conversations/seller/{sellerId}` | GET | Get conversations for seller | `sellerId` (path) |
| `/api/conversations/user/{userId}/active` | GET | Get active conversations for user | `userId` (path) |
| `/api/conversations/{id}` | DELETE | Close conversation | `id` (path) |

### Messages
| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/api/conversations/{id}/messages` | POST | Send message | `id` (path), `content` (body) |
| `/api/conversations/{id}/messages` | GET | Get message history | `id` (path) |
| `/api/messages/{conversationId}/read` | POST | Mark conversation as read | `conversationId` (path) |
| `/api/messages/{conversationId}/unread` | GET | Get unread count | `conversationId` (path), `userId` (query) |

## Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
  id VARCHAR(64) PRIMARY KEY,
  buyer_id VARCHAR(64) NOT NULL REFERENCES users(id),
  seller_id VARCHAR(64) NOT NULL REFERENCES users(id),
  food_id VARCHAR(64) REFERENCES foods(id),
  subject VARCHAR(255) NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  data_processing_consent BOOLEAN DEFAULT FALSE,
  consent_log_id VARCHAR(64),
  retention_policy VARCHAR(50) DEFAULT 'standard',
  erasure_requested_at TIMESTAMP,
  erasure_completed_at TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id VARCHAR(64) PRIMARY KEY,
  conversation_id VARCHAR(64) NOT NULL REFERENCES conversations(id),
  sender_id VARCHAR(64) NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  data_processing_consent BOOLEAN DEFAULT FALSE,
  erasure_requested_at TIMESTAMP,
  erasure_completed_at TIMESTAMP,
  metadata JSONB,
  search_vector TSVECTOR
);
```

## GDPR Compliance

### Data Subject Rights

1. **Right to Access**: Users can export their chat data via the GDPR export function
2. **Right to Erasure**: Users can request chat data erasure via the GDPR erasure procedure
3. **Right to Data Portability**: Chat data can be exported in structured format
4. **Consent Management**: All conversations track data processing consent

### Data Retention
- **Standard**: 3 years (default)
- **GDPR Erasure**: 30 days after request
- **Legal Hold**: Indefinite (for legal compliance)

### Procedures

**GDPR Erasure Procedure**:
```sql
CALL gdpr_erase_chat_data('user-id');
```

**GDPR Export Function**:
```sql
SELECT * FROM gdpr_export_chat_data('user-id');
```

## Security

### Authentication
- Uses secure HTTP-only cookies
- CSRF protection for state-changing operations
- Input validation and sanitization
- Rate limiting on API endpoints

### Data Protection
- End-to-end encryption in transit (HTTPS)
- Sensitive data never logged
- Access controls based on user roles
- Regular security audits

## Frontend Implementation

### Components

1. **ChatContainer**: Main chat interface
2. **ConversationList**: List of conversations
3. **MessageList**: List of messages in a conversation
4. **MessageInput**: Input for sending messages
5. **StartConversationButton**: Button to start new conversations
6. **ChatHeader**: Header with unread message count

### Usage

**Starting a conversation from food page**:
```tsx
<StartConversationButton
  sellerId={food.seller.id}
  sellerName={food.seller.name}
  foodId={food.id}
  foodName={food.name}
/>
```

**Displaying chat interface**:
```tsx
<ChatContainer
  initialConversationId={conversationId}
  onConversationSelect={(id) => setConversationId(id)}
/>
```

## Testing

### Unit Tests
- `apps/web/__tests__/chatService.test.ts`: Tests for chat service
- `apps/web/__tests__/chatComponents.test.tsx`: Tests for chat components

### Integration Tests
- Test API integration with mock backend
- Test error handling and graceful degradation
- Test GDPR compliance features

### E2E Tests
- Test complete chat flow from food page to conversation
- Test real-time updates
- Test mobile responsiveness

## Performance Considerations

### Backend
- Database indexes on frequently queried fields
- Pagination for message history
- Caching for active conversations
- Connection pooling for database access

### Frontend
- Lazy loading of chat components
- Virtualized message lists for large conversations
- Optimistic updates for better perceived performance
- Efficient polling for real-time updates

## Error Handling & Graceful Degradation

### Error States
1. **Loading Errors**: Show retry button and error message
2. **Network Errors**: Show offline mode with cached data
3. **Authentication Errors**: Redirect to login page
4. **Rate Limiting**: Show appropriate error messages

### Fallback UI
- Skeleton loaders during loading
- Empty states when no data available
- Error boundaries for component failures
- Offline mode with limited functionality

## Future Enhancements

1. **Real-time WebSocket**: Replace polling with WebSocket for true real-time
2. **Message Reactions**: Allow users to react to messages
3. **File Attachments**: Support for sending images and documents
4. **Message Search**: Full-text search within conversations
5. **Typing Indicators**: Show when the other party is typing
6. **Read Receipts**: Show when messages are read
7. **Message Editing**: Allow editing sent messages
8. **Group Chats**: Support for multiple participants
9. **Message Templates**: Predefined templates for common inquiries
10. **Automated Responses**: AI-powered suggested responses

## Monitoring & Analytics

### Metrics to Track
- Number of active conversations
- Messages sent/received
- Conversation duration
- Response times
- Error rates
- User engagement

### Alerts
- High error rates
- Performance degradation
- Unusual activity patterns
- GDPR erasure failures

## Deployment

### Backend
1. Ensure database migration `009_chat_enhancements.sql` is applied
2. Verify Spring Boot service is running
3. Check API endpoints are accessible

### Frontend
1. Verify chat components are built and deployed
2. Check API client configuration
3. Test authentication flow
4. Verify graceful degradation works

## Troubleshooting

### Common Issues

1. **Messages not loading**:
   - Check network connectivity
   - Verify API endpoint is accessible
   - Check database indexes are created
   - Verify user authentication

2. **Conversations not appearing**:
   - Check database queries
   - Verify user permissions
   - Check conversation status (is_active)

3. **Performance issues**:
   - Check database indexes
   - Verify pagination is working
   - Check for N+1 query problems
   - Monitor memory usage

4. **GDPR compliance issues**:
   - Verify consent tracking
   - Check erasure procedures
   - Verify data export functionality

### Debugging Tools

1. **Backend Logs**: Check Spring Boot application logs
2. **Database Queries**: Use EXPLAIN ANALYZE for slow queries
3. **Frontend Console**: Check browser console for errors
4. **Network Tab**: Inspect API requests and responses
5. **Database Logs**: Check PostgreSQL logs for query issues