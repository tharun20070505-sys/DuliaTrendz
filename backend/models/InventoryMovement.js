import { createTursoModel } from '../config/tursoModel.js';

const InventoryMovement = createTursoModel('InventoryMovement', 'inventory_movements', {
  defaults: {
    referenceId: '',
    adminUser: 'System',
  },
});

export default InventoryMovement;
