import { createTursoModel } from '../config/tursoModel.js';

const Order = createTursoModel('Order', 'orders', {
  defaults: {
    items: [],
    paymentStatus: 'PENDING',
    orderStatus: 'Pending',
    statusHistory: [],
    tracking: {},
    pricing: {},
  },
});

export default Order;
