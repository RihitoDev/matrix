const pad = (value: number): string => String(value).padStart(2, '0');


export function formatTime12h(date: Date): string {
  const hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${pad(hours % 12 || 12)}:${pad(date.getMinutes())} ${period}`;
}

export function formatConversationDate(isoDateString?: string | null): string {
  if (!isoDateString) {
    return '';
  }

  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();

  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isSameDay) {
        return formatTime12h(date);
    }
  

  if (isYesterday) {
    return 'Ayer';
  
  }
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(date.getFullYear() % 100)}`;

  
}

export function getInitials(fullName: string): string {
  if (!fullName) return 'U';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}