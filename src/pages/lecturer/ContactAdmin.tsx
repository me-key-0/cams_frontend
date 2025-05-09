import { useState } from "react";
import {
  PaperAirplaneIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastUpdated: string;
  response?: string;
}

// Mock data - replace with actual API calls
const mockTickets: Ticket[] = [
  {
    id: "1",
    subject: "Request for Additional Class Materials",
    message:
      "I need access to additional Class materials for my advanced programming class. The current materials are not sufficient for the curriculum.",
    status: "open",
    priority: "medium",
    createdAt: "2024-03-15T10:30:00",
    lastUpdated: "2024-03-15T10:30:00",
  },
  {
    id: "2",
    subject: "Classroom Equipment Issue",
    message:
      "The projector in Room 301 is not working properly. It needs immediate attention as it affects my teaching.",
    status: "in-progress",
    priority: "high",
    createdAt: "2024-03-14T15:45:00",
    lastUpdated: "2024-03-15T09:15:00",
    response:
      "We've contacted the IT department. They will check the equipment tomorrow morning.",
  },
  {
    id: "3",
    subject: "Student Registration System Access",
    message:
      "I need access to the student registration system to view my class roster.",
    status: "resolved",
    priority: "low",
    createdAt: "2024-03-13T08:20:00",
    lastUpdated: "2024-03-13T14:30:00",
    response:
      "Access has been granted. You can now view your class roster in the system.",
  },
];

const priorityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors = {
  open: "bg-blue-100 text-blue-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
};

export default function LecturerContactAdmin() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const ticket: Ticket = {
        id: Date.now().toString(),
        ...newTicket,
        status: "open",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      setTickets([ticket, ...tickets]);
      setNewTicket({ subject: "", message: "", priority: "medium" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Contact Admin</h2>
        <div className="flex items-center text-sm text-gray-500">
          <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
          {tickets.length} total tickets
        </div>
      </div>

      {/* New Ticket Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Create New Ticket
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={newTicket.subject}
              onChange={(e) =>
                setNewTicket({ ...newTicket, subject: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              value={newTicket.message}
              onChange={(e) =>
                setNewTicket({ ...newTicket, message: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700"
            >
              Priority
            </label>
            <select
              id="priority"
              value={newTicket.priority}
              onChange={(e) =>
                setNewTicket({
                  ...newTicket,
                  priority: e.target.value as "low" | "medium" | "high",
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                "Submitting..."
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

      {/* Tickets List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900">
                        {ticket.subject}
                      </h3>
                      <span
                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          priorityColors[ticket.priority]
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {ticket.message}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[ticket.status]
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {new Date(ticket.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {ticket.response && (
                  <div className="mt-4 pl-4 border-l-2 border-primary-500">
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Admin Response
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                      {ticket.response}
                    </p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
