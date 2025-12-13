export const mockData = {
  payoutEvents: [
    {
      timestamp: '2025-10-12T15:18:22Z',
      event: 'PAYOUT_STATUS_UPDATE',
      payout_id: 'po_aa912c',
      merchant_id: 'shopito',
      provider: 'DLOCAL',
      country: 'CO',
      status: 'SUCCEEDED',
      previous_status: 'PROCESSING',
      processing_time_sec: 94,
      amount: 2450.50
    },
    {
      timestamp: '2025-10-12T16:25:33Z',
      event: 'PAYOUT_VALIDATED',
      payout_id: 'po_44be21',
      merchant_id: 'storex',
      provider: 'ADYEN',
      country: 'CO',
      status: 'SUCCEEDED',
      risk_checks: ['AML_OK', 'LIMITS_OK'],
      latency_ms: 978,
      amount: 1234.00
    },
    {
      timestamp: '2025-10-12T14:41:09Z',
      event: 'PAYOUT_FAILED',
      payout_id: 'po_31aa99',
      merchant_id: 'shopito',
      provider: 'DLOCAL',
      country: 'CO',
      status: 'FAILED',
      error_code: 'PROVIDER_TIMEOUT',
      error_message: 'No response from provider within 30s',
      latency_ms: 30000,
      amount: 5670.00
    },
    {
      timestamp: '2025-10-12T15:09:55Z',
      event: 'PAYOUT_FAILED',
      payout_id: 'po_77cc21',
      merchant_id: 'storex',
      provider: 'STRIPE',
      country: 'MX',
      status: 'FAILED',
      error_code: 'INSUFFICIENT_FUNDS',
      error_message: 'Balance not enough to process payout',
      latency_ms: 1500,
      amount: 750.00
    },
    {
      timestamp: '2025-10-12T16:10:45Z',
      event: 'PAYOUT_STATUS_UPDATE',
      payout_id: 'po_b3c892',
      merchant_id: 'ecommerce_mx',
      provider: 'STRIPE',
      country: 'MX',
      status: 'SUCCEEDED',
      previous_status: 'PROCESSING',
      processing_time_sec: 45,
      amount: 3200.75
    },
    {
      timestamp: '2025-10-12T16:05:12Z',
      event: 'PAYOUT_VALIDATED',
      payout_id: 'po_f5d123',
      merchant_id: 'fashion_store',
      provider: 'DLOCAL',
      country: 'BR',
      status: 'SUCCEEDED',
      risk_checks: ['AML_OK', 'LIMITS_OK', 'FRAUD_CHECK_PASSED'],
      latency_ms: 556,
      amount: 4890.25
    },
    {
      timestamp: '2025-10-12T15:55:33Z',
      event: 'PAYOUT_FAILED',
      payout_id: 'po_9e2f10',
      merchant_id: 'startup_co',
      provider: 'ADYEN',
      country: 'AR',
      status: 'FAILED',
      error_code: 'INVALID_ACCOUNT',
      error_message: 'Recipient account information invalid',
      latency_ms: 2100,
      amount: 1500.00
    },
    {
      timestamp: '2025-10-12T16:15:22Z',
      event: 'PAYOUT_STATUS_UPDATE',
      payout_id: 'po_c7a451',
      merchant_id: 'marketplace',
      provider: 'ADYEN',
      country: 'CO',
      status: 'SUCCEEDED',
      previous_status: 'VALIDATION_PENDING',
      processing_time_sec: 67,
      amount: 2100.50
    }
  ],
  
  statusDistribution: {
    succeeded: 5,
    failed: 3,
    processing: 0
  },

  hourlyData: [
    { time: '08:00', payouts: 45, success: 44, failed: 1, volume: 12450 },
    { time: '09:00', payouts: 52, success: 51, failed: 1, volume: 18900 },
    { time: '10:00', payouts: 38, success: 37, failed: 1, volume: 9800 },
    { time: '11:00', payouts: 156, success: 154, failed: 2, volume: 45600 },
    { time: '12:00', payouts: 324, success: 320, failed: 4, volume: 92100 },
    { time: '13:00', payouts: 467, success: 460, failed: 7, volume: 156700 },
    { time: '14:00', payouts: 523, success: 516, failed: 7, volume: 189200 },
    { time: '15:00', payouts: 445, success: 438, failed: 7, volume: 167800 },
    { time: '16:00', payouts: 389, success: 383, failed: 6, volume: 142300 },
    { time: '17:00', payouts: 412, success: 406, failed: 6, volume: 165400 }
  ],

  providerMetrics: [
    { name: 'DLOCAL', volume: 8120.50, success: 100, failed: 1, payouts: 3 },
    { name: 'ADYEN', volume: 6790.25, success: 100, failed: 1, payouts: 2 },
    { name: 'STRIPE', volume: 1750.00, success: 0, failed: 2, payouts: 2 }
  ],

  errorTypes: [
    { errorCode: 'PROVIDER_TIMEOUT', count: 1, message: 'Timeout en el proveedor' },
    { errorCode: 'INSUFFICIENT_FUNDS', count: 1, message: 'Fondos insuficientes' },
    { errorCode: 'INVALID_ACCOUNT', count: 1, message: 'Cuenta de destino inválida' }
  ]
};
