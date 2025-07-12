'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase'; // Make sure 'db' is imported
import { signOut, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react'; // Import a bell icon

import styles from './Header.module.css';

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  questionId: string;
  answerId?: string; // Optional if not all notifications have an answer
  read: boolean;
  createdAt: {
    toDate(): Date;
  };
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeNotifications: () => void;

    if (user) {
      // Listen for real-time notifications for the current user
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10) // Limit to the most recent 10 notifications
      );

      unsubscribeNotifications = onSnapshot(q, (snapshot) => {
        const fetchedNotifications: Notification[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Notification[]; // Type assertion for safety
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter((n) => !n.read).length);
      });
    }

    return () => {
      if (unsubscribeNotifications) {
        unsubscribeNotifications();
      }
    };
  }, [user]); // Re-run when user state changes

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read and navigate
    if (!notification.read) {
      const notificationRef = doc(db, 'notifications', notification.id);
      await updateDoc(notificationRef, { read: true });
    }
    // Navigate to the relevant question page
    if (notification.questionId) {
      router.push(`/question/${notification.questionId}`);
    }
    setShowNotifications(false); // Close dropdown after clicking
  };

  const handleMarkAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    const batch = writeBatch(db);
    notifications.filter((n) => !n.read).forEach((notification) => {
      const notificationRef = doc(db, 'notifications', notification.id);
      batch.update(notificationRef, { read: true });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const bell = document.getElementById('notification-bell');
      const dropdown = document.getElementById('notifications-dropdown');

      if (bell && dropdown && !bell.contains(event.target as Node) && !dropdown.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <Link href="/" className={styles.logo}>
          StackIt
        </Link>
      </div>

      <nav className={styles.nav}>
        <Link
          href="/"
          className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
        >
          Home
        </Link>
        {/* Other links can be added here if needed */}
      </nav>

      <div className={styles.rightSection}>
        {user ? (
          <>
            {/* Notification Bell Icon */}
            <div
              id="notification-bell" // Add an ID for click outside detection
              className={styles.notificationBell}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className={styles.notificationBadge}>{unreadCount}</span>
              )}
            </div>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div id="notifications-dropdown" className={styles.notificationsDropdown}>
                {notifications.length > 0 ? (
                  <>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`${styles.notificationItem} ${
                          !notification.read ? styles.unread : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p className={styles.notificationMessage}>
                          {notification.message}
                        </p>
                        <span className={styles.notificationTime}>
                          {notification.createdAt?.toDate().toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className={styles.markAllReadButton}
                      >
                        Mark All as Read
                      </button>
                    )}
                  </>
                ) : (
                  <p className={styles.noNotifications}>No notifications yet.</p>
                )}
              </div>
            )}

            <span className={styles.userEmail}>{user.email}</span>
            <button onClick={handleLogout} className={styles.authButton}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className={styles.authButton}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
} 
