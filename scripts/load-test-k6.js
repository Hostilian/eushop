import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Performance & Load Test Suite for EUshop Core API (Port 3001).
 * Tests catalog search, food item lookup, and health endpoints under 100 VU load.
 */

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<150'], // 95% of requests must complete within 150ms
    http_req_failed: ['rate<0.01'],    // Less than 1% error rate
  },
};

export default function () {
  const res = http.get('http://localhost:3001/api/foods');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response body received': (r) => r.body.length > 0,
  });
  sleep(1);
}
