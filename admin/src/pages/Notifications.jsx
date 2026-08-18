import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../services/apiService';
import ListSkeleton from '../components/fallbacks/TableSkeleton';

// ─── Configuration ──────────────────────────────────────────────────────────
const TYPE_META = {
  "New Submission": {
    label: "Wiki",
    fullTitle: "New Wiki Submission",
    color: "var(--info)",
    bgClass: "badge-admin",
    icon: "📝",
  },
  "Translation Review": {
    label: "Translations",
    fullTitle: "Translation Needs Review",
    color: "var(--warning)",
    bgClass: "badge-pending",
    icon: "🌍",
  },
  "System Alert": {
    label: "System",
    fullTitle: "System Alert",
    color: "var(--danger)",
    bgClass: "badge-rejected",
    icon: "⚠️",
  },
  "Account Activity": {
    label: "Accounts",
    fullTitle: "Account Activity",
    color: "var(--success)",
    bgClass: "badge-verified",
    icon: "👥",
  }
};

const resolveNotificationType = (item) => {
  if (!item) return "System Alert";
  let t = item.type || item.data?.type || "System Alert";
  return TYPE_META[t] ? t : "System Alert";
};

const getMeta = (typeKey) => TYPE_META[typeKey] ?? TYPE_META["System Alert"];

const TAB_CATEGORIES = [
  { id: "All", label: "All Alerts", types: null, icon: "🔔" },
  { id: "Wiki", label: "Wiki", types: ["New Submission"], icon: "📝" },
  { id: "Translations", label: "Translations", types: ["Translation Review"], icon: "🌍" },
  { id: "System", label: "System", types: ["System Alert", "Account Activity"], icon: "⚙️" },
];

// ─── Notification Card Item ─────────────────────────────────────────────────
const NotificationCardItem = ({ item, onSelect, onMarkAsRead, onDelete }) => {
  const typeKey = resolveNotificationType(item);
  const meta = getMeta(typeKey);
  const isUnread = !item.is_read;

  return (
    <div 
      className="glass-card flex items-center gap-16"
      style={{
        padding: '16px 20px',
        marginBottom: 12,
        cursor: 'pointer',
        border: isUnread ? '1px solid rgba(255, 210, 48, 0.4)' : '1px solid var(--border-subtle)',
        background: isUnread ? 'var(--bg-glass-hover)' : 'var(--gradient-card)'
      }}
      onClick={() => onSelect(item)}
    >
      <div 
        className="stat-icon" 
        style={{ 
          background: isUnread ? 'var(--accent-glow)' : 'var(--bg-glass)', 
          color: meta.color,
          fontSize: '1.4rem'
        }}
      >
        {meta.icon}
      </div>

      <div style={{ flex: 1 }}>
        <div className="flex items-center gap-8" style={{ marginBottom: 6 }}>
          <span className={`badge ${meta.bgClass}`}>
            {meta.label}
          </span>
          <span className="text-muted text-sm">
            {item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now'}
          </span>
        </div>
        <div className={isUnread ? 'font-bold' : ''} style={{ fontSize: '0.95rem', color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {item.message || item.data?.message || item.title || 'New Notification'}
        </div>
      </div>

      <div className="flex items-center gap-8">
        {isUnread && (
          <button 
            className="btn btn-success btn-sm"
            title="Mark as read"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(item.id);
            }}
          >
            ✓
          </button>
        )}
        <button 
          className="btn btn-danger btn-sm"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// ─── Notification Detail ────────────────────────────────────────────────────
const NotificationDetail = ({ notification, onBack, onMarkAsRead, onDelete }) => {
  const typeKey = resolveNotificationType(notification);
  const meta = getMeta(typeKey);
  const isUnread = !notification.is_read;

  return (
    <div className="glass-card" style={{ padding: '32px' }}>
      <button 
        className="btn btn-secondary" 
        onClick={onBack}
        style={{ marginBottom: '24px' }}
      >
        ← Back to Notifications
      </button>

      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div className="flex items-center gap-12">
          <div 
            className="stat-icon" 
            style={{ 
              background: 'var(--bg-glass)', 
              color: meta.color,
              fontSize: '1.8rem'
            }}
          >
            {meta.icon}
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{meta.fullTitle}</div>
            <div className="text-muted text-sm">
              {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Just now'}
            </div>
          </div>
        </div>
        
        {isUnread ? (
          <span className="badge badge-pending" style={{ padding: '6px 12px' }}>Unread</span>
        ) : (
          <span className="badge" style={{ padding: '6px 12px', background: 'var(--bg-glass)', color: 'var(--text-secondary)' }}>Read</span>
        )}
      </div>

      <div style={{ padding: '24px', background: 'var(--bg-glass)', borderRadius: '12px', marginBottom: '32px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
          {notification.message || notification.data?.message || notification.title || 'No message provided.'}
        </h3>
        
        {notification.metadata && Object.keys(notification.metadata).length > 0 && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-secondary)' }}>Additional Data:</div>
            <pre style={{ background: 'var(--bg-dark)', padding: '16px', borderRadius: '8px', color: 'var(--text-primary)', overflowX: 'auto' }}>
              {JSON.stringify(notification.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="flex items-center gap-16">
        {isUnread && (
          <button 
            className="btn btn-primary"
            onClick={() => onMarkAsRead(notification.id)}
          >
            Mark as Read
          </button>
        )}
        <button 
          className="btn btn-danger"
          onClick={() => {
            onDelete(notification.id);
            onBack();
          }}
        >
          Delete Notification
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      await apiFetch(`/api/admin/notifications/${id}/read`, { method: 'PUT' });
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await apiFetch('/api/admin/notifications/read-all', { method: 'PUT' });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      await apiFetch(`/api/admin/notifications/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      setNotifications([]);
      await apiFetch('/api/admin/notifications/all', { method: 'DELETE' }).catch(() => {});
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const categoryCounts = useMemo(() => {
    const counts = { All: unreadCount };
    TAB_CATEGORIES.forEach((cat) => {
      if (cat.types) {
        counts[cat.id] = notifications.filter(
          (n) => !n.is_read && cat.types.includes(resolveNotificationType(n))
        ).length;
      }
    });
    return counts;
  }, [notifications, unreadCount]);

  const filteredNotifications = useMemo(() => {
    const activeCategory = TAB_CATEGORIES.find((cat) => cat.id === activeTab);
    if (!activeCategory || !activeCategory.types) {
      return notifications;
    }
    return notifications.filter(
      (n) => activeCategory.types.includes(resolveNotificationType(n))
    );
  }, [activeTab, notifications]);

  if (selectedNotification) {
    return (
      <NotificationDetail
        notification={selectedNotification}
        onBack={() => setSelectedNotification(null)}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div className="flex items-center gap-12">
          {unreadCount > 0 && (
            <span className="badge badge-pending" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              🔔 {unreadCount} Unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-12">
          {unreadCount > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>
              ✓ Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={() => {
              if (window.confirm("Are you sure you want to delete all notifications?")) {
                deleteAllNotifications();
              }
            }}>
              ✕ Delete all
            </button>
          )}
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: '24px', overflowX: 'auto', display: 'flex', gap: '8px' }}>
        {TAB_CATEGORIES.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = categoryCounts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            >
              <span>{tab.icon} {tab.label}</span>
              {count > 0 && (
                <span style={{ 
                  background: isActive ? 'var(--accent)' : 'var(--border-strong)', 
                  color: isActive ? '#000' : 'var(--text-secondary)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        {loading ? (
          <ListSkeleton columns={4} rows={3} />
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No notifications found in this category.</div>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <NotificationCardItem
              key={item.id}
              item={item}
              onSelect={setSelectedNotification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
