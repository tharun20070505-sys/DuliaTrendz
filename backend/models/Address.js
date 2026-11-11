import { createTursoModel } from '../config/tursoModel.js';

const Address = createTursoModel('Address', 'addresses', {
  defaults: {
    addressLine2: '',
    landmark: '',
    isDefault: false,
    addressType: 'Home',
  },
});

export default Address;
