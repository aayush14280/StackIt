import Link from 'next/link';
import { ChevronRight } from 'lucide-react'; // Using Lucide-React for the arrow icon

import styles from './Breadcrumb.module.css'; // Import its CSS Module

interface BreadcrumbItem {
  label: string;
  href?: string; // Optional href, if it's a clickable link
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumbNav} aria-label="breadcrumb">
      <ol className={styles.breadcrumbList}>
        {items.map((item, index) => (
          <li key={index} className={styles.breadcrumbItem}>
            {item.href ? (
              <Link href={item.href} className={styles.breadcrumbLink}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.breadcrumbCurrent}>{item.label}</span>
            )}
            {index < items.length - 1 && (
              <ChevronRight size={16} className={styles.breadcrumbSeparator} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}