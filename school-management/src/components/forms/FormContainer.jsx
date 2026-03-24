import React, { useState, useEffect } from "react";
import FormModal from "./FormModal";
import { useAuth } from "../../contexts/AuthContext";
import "./FormModal.css";

// FormContainer props type definition
const FormContainer = ({
  table = "teacher",
  type = "create",
  data = null,
  id = null,
}) => {
  const [relatedData, setRelatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRelatedData = async () => {
      if (type === "delete") return;

      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock related data based on table type
      let mockRelatedData = {};

      switch (table) {
        case "subject":
          mockRelatedData = {
            teachers: [
              { id: 1, name: "John", surname: "Smith" },
              { id: 2, name: "Sarah", surname: "Johnson" },
              { id: 3, name: "Michael", surname: "Brown" },
              { id: 4, name: "Emily", surname: "Davis" },
              { id: 5, name: "David", surname: "Wilson" },
            ],
          };
          break;

        case "class":
          mockRelatedData = {
            teachers: [
              { id: 1, name: "John", surname: "Smith" },
              { id: 2, name: "Sarah", surname: "Johnson" },
              { id: 3, name: "Michael", surname: "Brown" },
            ],
            grades: [
              { id: 1, level: "Grade 1" },
              { id: 2, level: "Grade 2" },
              { id: 3, level: "Grade 3" },
              { id: 4, level: "Grade 4" },
              { id: 5, level: "Grade 5" },
              { id: 6, level: "Grade 6" },
              { id: 7, level: "Grade 7" },
              { id: 8, level: "Grade 8" },
              { id: 9, level: "Grade 9" },
              { id: 10, level: "Grade 10" },
              { id: 11, level: "Grade 11" },
              { id: 12, level: "Grade 12" },
            ],
          };
          break;

        case "teacher":
          mockRelatedData = {
            subjects: [
              { id: 1, name: "Mathematics" },
              { id: 2, name: "English" },
              { id: 3, name: "Science" },
              { id: 4, name: "History" },
              { id: 5, name: "Geography" },
              { id: 6, name: "Physics" },
              { id: 7, name: "Chemistry" },
              { id: 8, name: "Biology" },
              { id: 9, name: "Computer Science" },
              { id: 10, name: "Art" },
              { id: 11, name: "Music" },
              { id: 12, name: "Physical Education" },
            ],
          };
          break;

        case "student":
          mockRelatedData = {
            classes: [
              { id: 1, name: "Class 1A", _count: { students: 25 } },
              { id: 2, name: "Class 1B", _count: { students: 28 } },
              { id: 3, name: "Class 2A", _count: { students: 22 } },
              { id: 4, name: "Class 2B", _count: { students: 30 } },
              { id: 5, name: "Class 3A", _count: { students: 26 } },
              { id: 6, name: "Class 3B", _count: { students: 24 } },
            ],
            grades: [
              { id: 1, level: "Grade 1" },
              { id: 2, level: "Grade 2" },
              { id: 3, level: "Grade 3" },
              { id: 4, level: "Grade 4" },
              { id: 5, level: "Grade 5" },
              { id: 6, level: "Grade 6" },
              { id: 7, level: "Grade 7" },
              { id: 8, level: "Grade 8" },
              { id: 9, level: "Grade 9" },
              { id: 10, level: "Grade 10" },
              { id: 11, level: "Grade 11" },
              { id: 12, level: "Grade 12" },
            ],
          };
          break;

        case "exam":
          // Filter lessons based on user role
          const allLessons = [
            { id: 1, name: "Mathematics - Grade 10A" },
            { id: 2, name: "English - Grade 9B" },
            { id: 3, name: "Science - Grade 11A" },
            { id: 4, name: "History - Grade 8C" },
            { id: 5, name: "Geography - Grade 7B" },
            { id: 6, name: "Physics - Grade 12A" },
            { id: 7, name: "Chemistry - Grade 11B" },
            { id: 8, name: "Biology - Grade 10C" },
          ];

          // If user is a teacher, filter lessons by their assignments
          const lessons =
            user?.role === "teacher"
              ? allLessons.filter((lesson) => lesson.id <= 4) // Mock filter
              : allLessons;

          mockRelatedData = { lessons };
          break;

        default:
          break;
      }

      setRelatedData(mockRelatedData);
      setLoading(false);
    };

    fetchRelatedData();
  }, [table, type, user?.role]);

  if (loading) {
    return (
      <div className="form-container-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
