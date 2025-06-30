import { useState, useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { communicationService, SupportTicket, CreateTicketRequest, TicketResponseRequest } from "../../api/services/communicationService";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const priorityConfig = {
  LOW: {
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    label: "Low"
  },
  MEDIUM: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    label: "Medium"
  },
  HIGH: {
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    label: "High"
  }
};

const statusConfig = {
  OPEN: {
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    icon: ClockIcon,
    label: "Open"
  },
  IN_PROGRESS: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    icon: ClockIcon,
    label: "In Progress"
  },
  RESOLVED: {
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    icon: CheckCircleIcon,
    label: "Resolved"
  }
};

export default function LecturerContactAdmin() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"my-tickets" | "all-tickets">("my-tickets");
  const [newTicket, setNewTicket] = useState<CreateTicketRequest>({
    subject: "",
    message: "",
    priority: "MEDIUM"
  });
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState<TicketResponseRequest>({
    message: "",
    newStatus: "IN_PROGRESS"
  });

  useEffect(() => {
    fetchTickets();
    if (user?.role === 'LECTURER') {
      fetchAllTickets();
    }
  }, [user?.role]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communicationService.getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load support tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTickets = async () => {
    try {
      const data = await communicationService.getAllTickets();
      setAllTickets(data);
    } catch (err) {
      console.error('Error fetching all tickets:', err);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const createdTicket = await communicationService.createTicket(newTicket);
      setTickets([createdTicket, ...tickets]);
      setNewTicket({
        subject: "",
        message: "",
        priority: "MEDIUM"
      });
      toast.success('Support ticket submitted successfully');
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast.error('Failed to submit support ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespondToTicket = async (ticketId: string) => {
    if (!response.message.trim()) {
      toast.error('Please enter a response message');
      return;
    }

    try {
      await communicationService.respondToTicket(ticketId, response);
      setAllTickets(allTickets.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              status: response.newStatus,
              response: response.message,
              respondedBy: user?.firstName + ' ' + user?.lastName,
              respondedAt: new Date().toISOString()
            }
          : ticket
      ));
      setRespondingTo(null);
      setResponse({ message: "", newStatus: "IN_PROGRESS" });
      toast.success('Response sent successfully');
    } catch (err) {
      console.error('Error responding to ticket:', err);
      toast.error('Failed to send response');
    }
  };

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
            <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-primary-500" />
            Contact Admin
          </h2>
          <p className="body-default text-foreground-secondary mt-1">
            Submit tickets and manage student support requests
          </p>
        </div>
        <div className="text-right">
          <div className="body-small text-foreground-secondary">My Tickets</div>
          <div className="heading-4 text-primary-600">{tickets.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="border-b border-border">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("my-tickets")}
              className={`
                group inline-flex items-center border-b-2 py-4 px-6 text-sm font-medium whitespace-nowrap transition-all duration-200
                ${activeTab === "my-tickets"
                  ? "border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                  : "border-transparent text-foreground-secondary hover:border-border-secondary hover:text-foreground hover:bg-background-secondary"
                }
              `}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab("all-tickets")}
              className={`
                group inline-flex items-center border-b-2 py-4 px-6 text-sm font-medium whitespace-nowrap transition-all duration-200
                ${activeTab === "all-tickets"
                  ? "border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                  : "border-transparent text-foreground-secondary hover:border-border-secondary hover:text-foreground hover:bg-background-secondary"
                }
              `}
            >
              <UserGroupIcon className="h-5 w-5 mr-2" />
              Student Tickets
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "my-tickets" && (
        <>
          {/* Contact Information */}
          <div className="card">
            <h3 className="heading-4 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg mr-4">
                  <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <div className="body-small font-medium text-foreground">Administration Office</div>
                  <div className="body-small text-foreground-secondary">Room 101, Main Building</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg mr-4">
                  <PhoneIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <div className="body-small font-medium text-foreground">Phone</div>
                  <div className="body-small text-foreground-secondary">+1 (555) 123-4567</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg mr-4">
                  <EnvelopeIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <div className="body-small font-medium text-foreground">Email</div>
                  <div className="body-small text-foreground-secondary">admin@college.edu</div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit New Ticket */}
          <div className="card">
            <h3 className="heading-4 mb-4">Submit Support Ticket</h3>
            <form onSubmit={handleSubmitTicket} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="input"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as "LOW" | "MEDIUM" | "HIGH" })}
                  className="input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message *
                </label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  rows={6}
                  className="input"
                  placeholder="Describe your issue in detail. Please include relevant course information if applicable."
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* My Tickets */}
          <div className="card">
            <h3 className="heading-4 mb-4">My Support Tickets</h3>
            
            {tickets.length === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
                <p className="body-default text-foreground-secondary">
                  You haven't submitted any support tickets yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const statusConf = statusConfig[ticket.status];
                  const priorityConf = priorityConfig[ticket.priority];
                  const StatusIcon = statusConf.icon;
                  
                  return (
                    <div key={ticket.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="body-default font-medium text-foreground mb-1">
                            {ticket.subject}
                          </h4>
                          <p className="body-small text-foreground-secondary mb-3">
                            {ticket.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${priorityConf.bgColor} ${priorityConf.color}
                          `}>
                            {priorityConf.label}
                          </span>
                          
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium flex items-center
                            ${statusConf.bgColor} ${statusConf.color}
                          `}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConf.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-foreground-tertiary">
                        <span className="body-small">
                          Created: {formatDate(ticket.createdAt)}
                        </span>
                        <span className="body-small">
                          Updated: {formatDate(ticket.updatedAt)}
                        </span>
                      </div>
                      
                      {ticket.response && (
                        <div className="mt-4 p-4 bg-background-secondary rounded-lg border-l-4 border-primary-500">
                          <div className="flex items-center mb-2">
                            <CheckCircleIcon className="h-4 w-4 text-primary-600 mr-2" />
                            <span className="body-small font-medium text-foreground">Admin Response</span>
                            {ticket.respondedAt && (
                              <span className="body-small text-foreground-tertiary ml-2">
                                • {formatDate(ticket.respondedAt)}
                              </span>
                            )}
                          </div>
                          <p className="body-small text-foreground-secondary">
                            {ticket.response}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "all-tickets" && (
        <div className="card">
          <h3 className="heading-4 mb-4">Student Support Tickets</h3>
          
          {allTickets.length === 0 ? (
            <div className="text-center py-8">
              <UserGroupIcon className="h-12 w-12 text-foreground-tertiary mx-auto mb-3" />
              <p className="body-default text-foreground-secondary">
                No student support tickets found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {allTickets.map((ticket) => {
                const statusConf = statusConfig[ticket.status];
                const priorityConf = priorityConfig[ticket.priority];
                const StatusIcon = statusConf.icon;
                
                return (
                  <div key={ticket.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="body-default font-medium text-foreground mb-1">
                          {ticket.subject}
                        </h4>
                        <p className="body-small text-foreground-secondary mb-2">
                          From: {ticket.createdBy}
                        </p>
                        <p className="body-small text-foreground-secondary mb-3">
                          {ticket.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${priorityConf.bgColor} ${priorityConf.color}
                        `}>
                          {priorityConf.label}
                        </span>
                        
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium flex items-center
                          ${statusConf.bgColor} ${statusConf.color}
                        `}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConf.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-foreground-tertiary mb-3">
                      <span className="body-small">
                        Created: {formatDate(ticket.createdAt)}
                      </span>
                      <span className="body-small">
                        Updated: {formatDate(ticket.updatedAt)}
                      </span>
                    </div>
                    
                    {ticket.response ? (
                      <div className="p-4 bg-background-secondary rounded-lg border-l-4 border-primary-500">
                        <div className="flex items-center mb-2">
                          <CheckCircleIcon className="h-4 w-4 text-primary-600 mr-2" />
                          <span className="body-small font-medium text-foreground">Response</span>
                          {ticket.respondedAt && (
                            <span className="body-small text-foreground-tertiary ml-2">
                              • {formatDate(ticket.respondedAt)}
                            </span>
                          )}
                        </div>
                        <p className="body-small text-foreground-secondary">
                          {ticket.response}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {respondingTo === ticket.id ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Response
                              </label>
                              <textarea
                                value={response.message}
                                onChange={(e) => setResponse({ ...response, message: e.target.value })}
                                rows={3}
                                className="input"
                                placeholder="Enter your response..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                New Status
                              </label>
                              <select
                                value={response.newStatus}
                                onChange={(e) => setResponse({ ...response, newStatus: e.target.value as "OPEN" | "IN_PROGRESS" | "RESOLVED" })}
                                className="input"
                              >
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="OPEN">Open</option>
                              </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setRespondingTo(null)}
                                className="btn btn-secondary text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleRespondToTicket(ticket.id)}
                                className="btn btn-primary text-sm"
                              >
                                Send Response
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRespondingTo(ticket.id)}
                            className="btn btn-primary text-sm"
                          >
                            Respond
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="status-error p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            <p className="body-default">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}