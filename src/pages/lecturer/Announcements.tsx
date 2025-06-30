import { useState, useEffect } from "react";
import {
  MegaphoneIcon,
  BellIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { communicationService, Announcement, CreateAnnouncementRequest } from "../../api/services/communicationService";
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

export default function LecturerAnnouncements() {
  const { user } = useAuthStore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "ACADEMIC" | "ADMINISTRATIVE">("all");
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<CreateAnnouncementRequest>({
    title: "",
    content: "",
    category: "ACADEMIC"
  });

  useEffect(() => {
    fetchAnnouncements();
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

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const createdAnnouncement = await communicationService.createAnnouncement(newAnnouncement);
      setAnnouncements([createdAnnouncement, ...announcements]);
      setIsCreating(false);
      setNewAnnouncement({
        title: "",
        content: "",
        category: "ACADEMIC"
      });
      toast.success('Announcement created successfully');
    } catch (err) {
      console.error('Error creating announcement:', err);
      toast.error('Failed to create announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await communicationService.deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
      toast.success('Announcement deleted successfully');
    } catch (err) {
      console.error('Error deleting announcement:', err);
      toast.error('Failed to delete announcement');
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
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Manage Announcements
          </h2>
          <p className="body-default text-foreground-secondary mt-1">
            Create and manage announcements for students
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Announcement
        </button>
      </div>

      {/* Create Announcement Form */}
      {isCreating && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="heading-4">Create New Announcement</h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-foreground-secondary hover:text-foreground"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                className="input"
                placeholder="Enter announcement title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <select
                value={newAnnouncement.category}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value as "ACADEMIC" | "ADMINISTRATIVE" })}
                className="input"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="ADMINISTRATIVE">Administrative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content *
              </label>
              <textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                rows={6}
                className="input"
                placeholder="Enter announcement content"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Creating...' : 'Create Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

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
              : "You haven't created any announcements yet."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => {
            const config = categoryConfig[announcement.category];
            const IconComponent = config.icon;
            
            return (
              <div key={announcement.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${config.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="heading-4 mb-2">{announcement.title}</h3>
                      <p className="body-default text-foreground-secondary mb-4">
                        {announcement.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-foreground-tertiary">
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
                  
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    className="text-foreground-secondary hover:text-error-600 transition-colors p-2"
                    title="Delete announcement"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}