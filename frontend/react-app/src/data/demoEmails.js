export const EMAILS = [
  { id: 'W1', space: 'Work', from: 'Elena · Acme', subject: 'Final proposal by Friday', body: 'Please deliver the final proposal by November 27 to proceed with the €150,000 opportunity.', priority: 'Critical', deadline: '2026-11-27' },
  { id: 'W2', space: 'Work', from: 'Marco · Engineering', subject: 'Proposal dependency', body: 'We cannot finish the proposal until IT delivers infrastructure specifications.', priority: 'Action required', senderRole: 'Manager' },
  { id: 'W3', space: 'Work', from: 'Luca · IT', subject: 'Infrastructure delay', body: 'Specifications will not be available until Monday, November 30.', priority: 'Risk signal' },
  { id: 'W4', space: 'Work', from: 'Finance', subject: 'Budget approval', body: 'Please approve the €25,000 budget by 17:00 today.', priority: 'Due today', deadline: '2026-11-26T17:00' },
  { id: 'W5', space: 'Work', from: 'CEO office', subject: 'Annual company dinner', body: 'Join us for our annual celebration next month.', priority: 'Low priority', senderRole: 'CEO office' },
  { id: 'P1', space: 'Personal', from: 'Private clinic', subject: 'Appointment confirmation', body: 'Your private appointment is today from 15:00 to 15:30.', priority: 'Appointment' },
  { id: 'P2', space: 'Personal', from: 'Energy provider', subject: 'Electricity bill', body: 'Your bill is due November 27.', priority: 'Reminder', deadline: '2026-11-27' },
];
