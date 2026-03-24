import React, { useState, useEffect } from "react";
import BigCalendar from "./BigCalendar";

const BigCalendarContainer = ({ type = "teacherId", id = "1" }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get lesson/schedule data
    const fetchScheduleData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock lesson data based on type and id
      let mockLessons = [];

      if (type === "teacherId") {
        // Mock lessons for a specific teacher
        mockLessons = [
          {
            name: "Mathematics - Grade 10A",
            startTime: new Date(2025, 0, 20, 9, 0),
            endTime: new Date(2025, 0, 20, 10, 0),
            teacherId: id,
            classId: 1,
          },
          {
            name: "Advanced Mathematics - Grade 11B",
            startTime: new Date(2025, 0, 20, 10, 30),
            endTime: new Date(2025, 0, 20, 11, 30),
            teacherId: id,
            classId: 2,
          },
          {
            name: "Calculus - Grade 12A",
            startTime: new Date(2025, 0, 20, 14, 0),
            endTime: new Date(2025, 0, 20, 15, 0),
            teacherId: id,
            classId: 3,
          },
          {
            name: "Algebra - Grade 9C",
            startTime: new Date(2025, 0, 21, 9, 0),
            endTime: new Date(2025, 0, 21, 10, 0),
            teacherId: id,
            classId: 4,
          },
          {
            name: "Statistics - Grade 11A",
            startTime: new Date(2025, 0, 21, 11, 30),
            endTime: new Date(2025, 0, 21, 12, 30),
            teacherId: id,
            classId: 5,
          },
          {
            name: "Geometry - Grade 10B",
            startTime: new Date(2025, 0, 22, 9, 0),
            endTime: new Date(2025, 0, 22, 10, 0),
            teacherId: id,
            classId: 6,
          },
          {
            name: "Trigonometry - Grade 9A",
            startTime: new Date(2025, 0, 22, 10, 30),
            endTime: new Date(2025, 0, 22, 11, 30),
            teacherId: id,
            classId: 7,
          },
          {
            name: "Applied Mathematics - Grade 12B",
            startTime: new Date(2025, 0, 23, 14, 0),
            endTime: new Date(2025, 0, 23, 15, 30),
            teacherId: id,
            classId: 8,
          },
          {
            name: "Pre-Calculus - Grade 10C",
            startTime: new Date(2025, 0, 24, 9, 0),
            endTime: new Date(2025, 0, 24, 10, 0),
            teacherId: id,
            classId: 9,
          },
        ];
      } else if (type === "classId") {
        // Mock lessons for a specific class
        mockLessons = [
          {
            name: "Mathematics",
            startTime: new Date(2025, 0, 20, 9, 0),
            endTime: new Date(2025, 0, 20, 10, 0),
            teacherId: "1",
            classId: id,
          },
          {
            name: "Physics",
            startTime: new Date(2025, 0, 20, 10, 30),
            endTime: new Date(2025, 0, 20, 11, 30),
            teacherId: "2",
            classId: id,
          },
          {
            name: "Chemistry",
            startTime: new Date(2025, 0, 20, 14, 0),
            endTime: new Date(2025, 0, 20, 15, 0),
            teacherId: "3",
            classId: id,
          },
          {
            name: "English",
            startTime: new Date(2025, 0, 21, 9, 0),
            endTime: new Date(2025, 0, 21, 10, 0),
            teacherId: "4",
            classId: id,
          },
          {
            name: "History",
            startTime: new Date(2025, 0, 21, 11, 30),
            endTime: new Date(2025, 0, 21, 12, 30),
            teacherId: "5",
            classId: id,
          },
          {
            name: "Biology",
            startTime: new Date(2025, 0, 22, 9, 0),
            endTime: new Date(2025, 0, 22, 10, 0),
            teacherId: "6",
            classId: id,
          },
          {
            name: "Geography",
            startTime: new Date(2025, 0, 22, 10, 30),
            endTime: new Date(2025, 0, 22, 11, 30),
            teacherId: "7",
            classId: id,
          },
          {
            name: "Computer Science",
            startTime: new Date(2025, 0, 23, 14, 0),
            endTime: new Date(2025, 0, 23, 15, 30),
            teacherId: "8",
            classId: id,
          },
          {
            name: "Physical Education",
            startTime: new Date(2025, 0, 24, 9, 0),
            endTime: new Date(2025, 0, 24, 10, 0),
            teacherId: "9",
            classId: id,
          },
        ];
      }

      // Transform the data to match BigCalendar format
      const transformedData = mockLessons.map((lesson) => ({
        title: lesson.name,
        start: lesson.startTime,
        end: lesson.endTime,
        teacherId: lesson.teacherId,
        classId: lesson.classId,
      }));

      // Adjust schedule to current week
      const adjustedData = adjustScheduleToCurrentWeek(transformedData);

      setScheduleData(adjustedData);
      setLoading(false);
    };

    fetchScheduleData();
  }, [type, id]);

  // Function to adjust schedule to current week
  const adjustScheduleToCurrentWeek = (data) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - daysSinceMonday);

    return data.map((event) => {
      const eventDay = event.start.getDay();
      const adjustedStart = new Date(currentMonday);
      adjustedStart.setDate(currentMonday.getDate() + eventDay - 1);
      adjustedStart.setHours(
        event.start.getHours(),
        event.start.getMinutes(),
        0,
        0
      );

      const adjustedEnd = new Date(currentMonday);
      adjustedEnd.setDate(currentMonday.getDate() + eventDay - 1);
      adjustedEnd.setHours(event.end.getHours(), event.end.getMinutes(), 0, 0);

      return {
        ...event,
        start: adjustedStart,
        end: adjustedEnd,
      };
    });
  };

  if (loading) {
    return (
      <div className="big-calendar-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="big-calendar-wrapper">
      <BigCalendar data={scheduleData} />
    </div>
  );
};

export default BigCalendarContainer;
