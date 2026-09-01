# Engineering Assumptions & Trade-offs

1. **Database Persistence**:
   - For rapid setup and zero native build dependencies, a JSON-backed relational engine with atomic file flushing was implemented. In high-scale production, this interface maps directly to PostgreSQL / Prisma.

2. **SLA Calculation**:
   - Target SLAs run continuously on a 24/7 calendar clock. Business-hour offset calculations can be added via SLA configuration override rules.

3. **In-App Notifications**:
   - In-app notification delivery is prioritized over SMTP email dispatch as specified in the VESA requirements.
