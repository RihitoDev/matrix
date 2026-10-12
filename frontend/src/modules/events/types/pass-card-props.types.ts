export interface PassCardProps {
  title: string;
  date: string;
  status: string;
  location: string;
  registrationId: string;
  isSelected?: boolean;
  onClick?: () => void;
}
