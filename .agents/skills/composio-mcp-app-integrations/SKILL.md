---
name: composio-mcp-app-integrations
description: Enterprise MCP app gateway & tool integration framework (ComposioHQ/awesome-claude-skills). Seamless API connectivity, Webhooks, and external SaaS tool orchestration.
---

# Composio MCP App Gateway & Integrations

This skill implements the **ComposioHQ/awesome-claude-skills** architecture for connecting AI agents to external applications via Model Context Protocol (MCP).

## Integration Standards
1. **Model Context Protocol (MCP)**: Use standardized MCP schema formats for external service interaction.
2. **Graceful Fallback**: If an external integration fails or is unreachable, degrade gracefully into offline/simulated response modes without crashing the user workflow.
3. **Secure Webhooks**: Verify digital signatures on incoming webhooks (e.g. Stripe, Auth0, Slack).
