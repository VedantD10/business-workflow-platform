# Dynamic SLA Engine & Overdue Tracking Specification

## Target Processing Durations
- **Software Access Request**: 24 Hours
- **Expense Reimbursement**: 48 Hours
- **Document Approval**: 72 Hours
- **Equipment Request**: 72 Hours

## Mathematical SLA Status Formula

For any request $R$:
$$\Delta t = \begin{cases} t_{\text{completed}} - t_{\text{created}} & \text{if status } \in \{\text{COMPLETED}, \text{REJECTED}, \text{CANCELLED}\} \\ t_{\text{now}} - t_{\text{created}} & \text{otherwise} \end{cases}$$

$$\text{SLA Status} = \begin{cases} 
\text{COMPLETED\_WITHIN\_SLA} & \text{if status is terminal and } \Delta t \le T_{\text{target}} \\
\text{COMPLETED\_AFTER\_SLA} & \text{if status is terminal and } \Delta t > T_{\text{target}} \\
\text{OVERDUE} & \text{if status is active and } \Delta t > T_{\text{target}} \\
\text{APPROACHING\_SLA} & \text{if status is active and } 0.75 \cdot T_{\text{target}} \le \Delta t \le T_{\text{target}} \\
\text{WITHIN\_SLA} & \text{if status is active and } \Delta t < 0.75 \cdot T_{\text{target}}
\end{cases}$$

## SLA Warning & Automatic Escalation Rules
- Requests entering `APPROACHING_SLA` render an amber badge in queues.
- Requests entering `OVERDUE` render a flashing red badge and generate an urgent in-app notification to the Reporting Manager and Department Head.
