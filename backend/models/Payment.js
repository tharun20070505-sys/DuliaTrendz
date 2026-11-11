import { createTursoModel } from '../config/tursoModel.js';

const Payment = createTursoModel('Payment', 'payments', {
  defaults: {
    currency: 'INR',
    status: 'PENDING',
    refundDetails: null,
  },
});

export default Payment;
