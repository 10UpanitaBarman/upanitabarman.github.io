export const APPLICATION_STATUSES = [
  'Saved', 'Preparing', 'Applied', 'Recruiter Screen',
  'Interview 1', 'Interview 2', 'Final', 'Offer', 'Rejected', 'Ghosted'
];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Dream'];

export const ROLE_TYPES = [
  'Recruiter', 'Hiring Manager', 'Team Member', 'Director', 'VP', 'Alumni', 'Other'
];

export const FOLLOW_UP_TYPES = ['LinkedIn', 'Email', 'Application', 'Interview', 'Referral'];

export const STATUS_COLORS = {
  'Saved':            { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' },
  'Preparing':        { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  'Applied':          { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  'Recruiter Screen': { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
  'Interview 1':      { bg: '#FEFCE8', text: '#A16207', border: '#FEF08A' },
  'Interview 2':      { bg: '#FFF7ED', text: '#D97706', border: '#FDE68A' },
  'Final':            { bg: '#FDF4FF', text: '#7E22CE', border: '#E9D5FF' },
  'Offer':            { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  'Rejected':         { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
  'Ghosted':          { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' },
};

export const PRIORITY_COLORS = {
  'Low':    { bg: '#F9FAFB', text: '#6B7280', dot: '#9CA3AF' },
  'Medium': { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  'High':   { bg: '#FFF7ED', text: '#C2410C', dot: '#F97316' },
  'Dream':  { bg: '#FDF4FF', text: '#7E22CE', dot: '#A855F7' },
};

export function calcOutreachScore(job, contacts) {
  let score = 0;
  const jobContacts = contacts.filter(c => c.job_id === job.id);
  const hasRecruiter = jobContacts.some(c => c.role_type === 'Recruiter' && (c.linkedin_message_sent || c.email_sent));
  const hasHiringMgr = jobContacts.some(c => c.role_type === 'Hiring Manager' && (c.linkedin_message_sent || c.email_sent));
  const hasTeamMember = jobContacts.some(c => c.role_type === 'Team Member' && (c.linkedin_message_sent || c.email_sent));
  if (hasRecruiter) score += 25;
  if (hasHiringMgr) score += 25;
  if (hasTeamMember) score += 20;
  if (job.next_follow_up_date) score += 15;
  if (job.portfolio_sent || job.loom_sent) score += 15;
  return score;
}
