import React, { useState, useEffect } from "react";
import { X, Plus, Edit, Trash2, Save, AlertTriangle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./FormModal.css";

// Lazy load form components
import TeacherForm from "./TeacherForm";
import StudentForm from "./StudentForm";
import SubjectForm from "./SubjectForm";
import ClassForm from "./ClassForm";
import ExamForm from "./ExamForm";
import AttendanceForm from "./AttendanceForm";

// Delete action handlers (mock functions)
const deleteActions = {
  subject: async (id) => {
    console.log(`Deleting subject with ID: ${id}`);
    return { success: true };
  },
  class: async (id) => {
    console.log(`Deleting class with ID: ${id}`);
    return { success: true };
  },
  teacher: async (id) => {
    console.log(`Deleting teacher with ID: ${id}`);
    return { success: true };
  },
  student: async (id) => {
    console.log(`Deleting student with ID: ${id}`);
    return { success: true };
  },
  exam: async (id) => {
    console.log(`Deleting exam with ID: ${id}`);
    return { success: true };
  },
  parent: async (id) => {
    console.log(`Deleting parent with ID: ${id}`);
    return { success: true };
  },
  lesson: async (id) => {
    console.log(`Deleting lesson with ID: ${id}`);
    return { success: true };
  },
  assignment: async (id) => {
    console.log(`Deleting assignment with ID: ${id}`);
    return { success: true };
  },
  result: async (id) => {
    console.log(`Deleting result with ID: ${id}`);
    return { success: true };
  },
  attendance: async (id) => {
    console.log(`Deleting attendance with ID: ${id}`);
    return { success: true };
  },
  event: async (id) => {
    console.log(`Deleting event with ID: ${id}`);
    return { success: true };
  },
  announcement: async (id) => {
    console.log(`Deleting announcement with ID: ${id}`);
    return { success: true };
  },
};

// Form component mapping
const formComponents = {
  subject: SubjectForm,
  class: ClassForm,
  teacher: TeacherForm,
  student: StudentForm,
  exam: ExamForm,
  attendance: AttendanceForm,
  // TODO: Add other form components
  parent: StudentForm, // Placeholder
  lesson: ClassForm, // Placeholder
  assignment: ExamForm, // Placeholder
  result: ExamForm, // Placeholder
  event: ClassForm, // Placeholder
  announcement: ClassForm, // Placeholder
};

const FormModal = ({
  table,
  type,
  data = null,
  id = null,
  relatedData = {},
  onClose = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { user } = useAuth();

  // Determine button styling based on type
  const getButtonStyle = () => {
    switch (type) {
      case "create":
        return {
          size: "w-8 h-8",
          bgColor: "bg-yellow-500",
          icon: Plus,
        };
      case "update":
        return {
          size: "w-7 h-7",
          bgColor: "bg-blue-500",
          icon: Edit,
        };
      case "delete":
        return {
          size: "w-7 h-7",
          bgColor: "bg-red-500",
          icon: Trash2,
        };
      default:
        return {
          size: "w-8 h-8",
          bgColor: "bg-gray-500",
          icon: Plus,
        };
    }
  };

  const buttonStyle = getButtonStyle();
  const IconComponent = buttonStyle.icon;

  // Handle form submission
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (type === "delete") {
        const deleteAction = deleteActions[table];
        if (deleteAction) {
          await deleteAction(id);
          setSubmitStatus({
            success: true,
            message: `${table} deleted successfully!`,
          });
        } else {
          setSubmitStatus({
            success: false,
            message: `Delete action not implemented for ${table}`,
          });
        }
      } else {
        // For create/update operations
        console.log(`${type} ${table}:`, formData);
        setSubmitStatus({
          success: true,
          message: `${table} ${type}d successfully!`,
        });
      }

      // Close modal after successful submission
      setTimeout(() => {
        setIsOpen(false);
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      setSubmitStatus({
        success: false,
        message: `Failed to ${type} ${table}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${table}? This action cannot be undone.`
      )
    ) {
      await handleSubmit();
    }
  };

  // Get form component
  const FormComponent = formComponents[table] || SubjectForm;

  // Render form content based on type
  const renderFormContent = () => {
    if (type === "delete") {
      return (
        <div className="delete-confirmation">
          <div className="delete-icon">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="delete-title">Confirm Deletion</h3>
          <p className="delete-message">
            Are you sure you want to delete this {table}? This action cannot be
            undone and all associated data will be lost.
          </p>
          <div className="delete-actions">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="cancel-btn"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="delete-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <FormComponent
        type={type}
        data={data}
        relatedData={relatedData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitStatus={submitStatus}
      />
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        className={`${buttonStyle.size} ${buttonStyle.bgColor} flex items-center justify-center rounded-full text-white hover:opacity-90 transition-opacity shadow-lg`}
        onClick={() => setIsOpen(true)}
        title={`${type} ${table}`}
      >
        <IconComponent className="w-4 h-4" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="form-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="form-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="form-modal-header">
              <h2 className="form-modal-title">
                {type === "create" &&
                  `Add New ${table.charAt(0).toUpperCase() + table.slice(1)}`}
                {type === "update" &&
                  `Edit ${table.charAt(0).toUpperCase() + table.slice(1)}`}
                {type === "delete" &&
                  `Delete ${table.charAt(0).toUpperCase() + table.slice(1)}`}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="close-btn"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="form-modal-body">{renderFormContent()}</div>

            {/* Status Messages */}
            {submitStatus && (
              <div
                className={`status-message ${
                  submitStatus.success ? "success" : "error"
                }`}
              >
                {submitStatus.message}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
