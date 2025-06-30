import { useState, useEffect } from "react";
import {
  MegaphoneIcon,
  BellIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { communicationService, Announcement } from "../../api/services/communicationService";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const categoryConfig = {
  ACADEMIC: {
    icon: InformationCircleIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    label: "Academic"
  },
  ADMINISTRATIVE: {
    icon: ExclamationTriangleIcon,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
    label: "Administrative"
  }
};

export default function StudentAnnouncements() {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "ACADEMIC" | "ADMINISTRATIVE">("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAnnouncements();
    fetchUnreadCount();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communicationService.getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await communicationService.getUnreadAnnouncementCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleMarkAsRead = async (announcement: Announcement) => {
    if (announcement.isRead) return;

    try {
      await communicationService.markAnnouncementAsRead(announcement.id);
      setAnnouncements(announcements.map(a => 
        a.id === announcement.id ? { ...a, isRead: true } : a
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (err) {
      console.error('Error marking as read:', err);
      toast.error('Failed to mark as read');
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesCategory = selectedCategory === "all" || announcement.category === selectedCategory;
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading-3 flex items-center">
            <MegaphoneIcon className="h-6 w-6 mr-2 text-primary-500" />
            Announcements
          </h2>
          <p className="body-default text-foreground-secondary mt-1">
            Stay updated with important announcements and news
          </p>
        </div>
        <div className="text-right">
          <div className="body-small text-foreground-secondary">Unread</div>
          <div className="heading-4 text-primary-600">{unreadCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-foreground-tertiary absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as "all" | "ACADEMIC" | "ADMINISTRATIVE")}
            className="input min-w-[150px]"
          >
            <option value="all">All Categories</option>
            <option value="ACADEMIC">Academic</option>
            <option value="ADMINISTRATIVE">Administrative</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="status-error p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <p className="body-default">{error}</p>
          </div>
        </div>
      )}

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="card text-center py-12">
          <BellIcon className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
          <h3 className="heading-4 mb-2">No Announcements Found</h3>
          <p className="body-default text-foreground-secondary">
            {searchQuery || selectedCategory !== "all"
              ? "No announcements match your current filters."
              : "No announcements have been posted yet."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => {
            const config = categoryConfig[announcement.category];
            const IconComponent = config.icon;
            
            return (
              <div
                key={announcement.id}
                className={`
                  card transition-all duration-200 cursor-pointer
                  ${!announcement.isRead 
                    ? `${config.bgColor} ${config.borderColor} border-l-4` 
                    : 'hover:bg-background-secondary'
                  }
                `}
                onClick={() => handleMarkAsRead(announcement)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${config.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`heading-4 ${!announcement.isRead ? 'text-foreground' : 'text-foreground-secondary'}`}>
                          {announcement.title}
                        </h3>
                        {!announcement.isRead && (
                          <span className="h-2 w-2 bg-primary-500 rounded-full flex-shrink-0 ml-2"></span>
                        )}
                      </div>
                      
                      <p className="body-default text-foreground-secondary mb-4">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-foreground-tertiary">
                          <span className="body-small">
                            By: {announcement.createdBy}
                          </span>
                          <span className="mx-2">•</span>
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span className="body-small">
                            {formatDate(announcement.createdAt)}
                          </span>
                        </div>
                        
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${config.bgColor} ${config.color}
                        `}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!announcement.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(announcement);
                      }}
                      className="btn btn-ghost text-xs px-3 py-1 ml-4"
                      title="Mark as read"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}