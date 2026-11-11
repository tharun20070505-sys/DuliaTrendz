import { createTursoModel } from '../config/tursoModel.js';

const ReturnRequest = createTursoModel('ReturnRequest', 'return_requests', {
  defaults: {
    items: [],
    images: [],
    status: 'Requested',
    description: '',
    adminNotes: '',
  },
});

export default ReturnRequest;
