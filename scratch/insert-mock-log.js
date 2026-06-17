const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

mongoose.connect('mongodb://localhost:27017/trade_finance', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const auditLogSchema = new mongoose.Schema({}, { strict: false });
    const AuditLog = mongoose.model('AuditLog', auditLogSchema);
    
    await AuditLog.create({
      eventId: uuidv4(),
      eventType: 'LC_CREATED',
      module: 'Workflow',
      action: 'Created Letter of Credit (System Injected)',
      performedBy: 'system_user',
      lcId: uuidv4(),
      details: { amount: 50000, currency: 'USD' },
      timestamp: new Date(),
      jurisdiction: 'GLOBAL'
    });
    
    console.log('Mock log inserted');
    process.exit(0);
  });
