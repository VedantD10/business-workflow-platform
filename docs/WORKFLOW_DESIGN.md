# Core Workflow Specifications & State Machine Design

## Universal Lifecycle State Diagram

```mermaid
stateDiagram-v2
    [*] --> SUBMITTED
    SUBMITTED --> UNDER_REVIEW : Initial Review
    UNDER_REVIEW --> APPROVAL_PENDING : Manager Approval
    UNDER_REVIEW --> REJECTED : Rejection (Reason Required)
    UNDER_REVIEW --> CHANGES_REQUESTED : Changes Requested (Reason Required)
    CHANGES_REQUESTED --> SUBMITTED : Resubmit by Creator
    APPROVAL_PENDING --> APPROVED : Final Director Sign-off
    APPROVED --> PROCESSING : Task Assigned to Staff
    PROCESSING --> COMPLETED : Fulfill Action Executed
    SUBMITTED --> CANCELLED : Cancelled by Creator
```

## Mandatory Workflows

### 1. Software Access Request
- **Approval Chain**: `Employee` → `Reporting Manager` → `IT Administrator` → `Completed`
- **Rules**: Manager validates business justification; IT provisions license and access level.

### 2. Expense Reimbursement
- **Approval Chain**: `Employee` → `Reporting Manager` → `Finance Officer` → `Reimbursement Processing` → `Completed`
- **Rules**: Manager checks purpose; Finance verifies itemized receipt and processes payout.

### 3. Document Approval
- **Approval Chain**: `Employee` → `Department Manager` → `Department Director` → `Final Approval` → `Completed`
- **Rules**: Multi-tier sign-off; requesting changes preserves document versioning and audit trail.

### 4. Equipment Request
- **Approval Chain**: `Employee` → `Reporting Manager` → `IT / Admin` → `Inventory Allocation / Procurement` → `Completed`
- **Rules**: IT assesses stock availability:
  - Inventory available → Assign & Complete
  - Inventory unavailable → Escalate to Procurement → Record PO/Receipt → Complete
