import { useState } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

interface ContactForm {
  subject: string;
  message: string;
  priority: "Low" | "Medium" | "High";
}

export default function ContactAdmin() {
  const [formData, setFormData] = useState<ContactForm>({
    subject: "",
    message: "",
    priority: "Low",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Contact Information
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">
                Administration Office
              </span>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">admin@college.edu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Send Message
          </h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-6">
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
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as ContactForm["priority"],
                  })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
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
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Frequently Asked Questions
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                How long does it take to get a response?
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                We typically respond to all inquiries within 24-48 hours during
                business days.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                What information should I include in my message?
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Please include your student ID, relevant course codes, and any
                specific details related to your inquiry.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Is there an emergency contact number?
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                For urgent matters, please call the emergency hotline at +1
                (555) 999-9999.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
