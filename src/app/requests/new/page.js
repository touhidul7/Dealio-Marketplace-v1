'use client';
import NewRequestForm from '@/components/NewRequestForm/NewRequestForm';
import styles from './new.module.css';

export default function NewRequestPage() {
  return (
    <div className={styles.page}>
      <NewRequestForm backHref="/requests" backLabel="Back to Requests" />
    </div>
  );
}
