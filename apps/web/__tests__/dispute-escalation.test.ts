import { checkDisputeEscalation } from '../lib/dispute-escalation';

describe('Automated Buyer Dispute Escalation Engine (Task 82)', () => {
  it('does not escalate orders within statutory 30-day delivery window', () => {
    const status = checkDisputeEscalation('EU-100', new Date().toISOString(), false);
    expect(status.shouldEscalate).toBe(false);
  });

  it('escalates orders unfulfilled past 30 days under Directive 2011/83/EU Art. 18', () => {
    const pastDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
    const status = checkDisputeEscalation('EU-999', pastDate, false);
    expect(status.shouldEscalate).toBe(true);
    expect(status.recommendedAction).toContain('Automatic Escalation');
  });
});
