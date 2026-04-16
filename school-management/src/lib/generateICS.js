export const generateTimetableICS = (timetableData) => {
  const mapDayToICS = {
    Sunday: "SU",
    Monday: "MO",
    Tuesday: "TU",
    Wednesday: "WE",
    Thursday: "TH",
    Friday: "FR",
    Saturday: "SA"
  };

  const mapDayToOffset = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  };

  // Helper to get the next date for a given day of the week
  const getNextDateForDay = (dayName, timeStr) => {
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const targetDayOfWeek = mapDayToOffset[dayName];
    
    let daysToAdd = targetDayOfWeek - currentDayOfWeek;
    if (daysToAdd < 0) {
      daysToAdd += 7; // Next occurrence
    }
    
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysToAdd);
    
    // Parse time like "08:00 AM"
    const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1], 10);
      const minutes = parseInt(timeParts[2], 10);
      const ampm = timeParts[3].toUpperCase();
      
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
      
      targetDate.setHours(hours, minutes, 0, 0);
    }
    
    return targetDate;
  };

  // Format date to ICS representation YYYYMMDDTHHMMSS
  const formatICSDate = (date) => {
    const pad = (n) => n < 10 ? '0' + n : n;
    return date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) + 'T' +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) + 'Z';
  };

  let icsContent = "BEGIN:VCALENDAR\r\n";
  icsContent += "VERSION:2.0\r\n";
  icsContent += "PRODID:-//Geoziie International School//Timetable//EN\r\n";
  icsContent += "CALSCALE:GREGORIAN\r\n";

  // End of repeating events (e.g., end of the academic year, defaulting to +6 months)
  const untilDate = new Date();
  untilDate.setMonth(untilDate.getMonth() + 6);
  const untilStr = formatICSDate(untilDate);

  timetableData.forEach(daySchedule => {
    daySchedule.classes.forEach(cls => {
      // Calculate start and end times
      const startDate = getNextDateForDay(daySchedule.day, cls.time);
      
      // Parse duration to calculate end time
      const endDate = new Date(startDate);
      if (cls.duration.toLowerCase().includes("hour")) {
        const hrs = parseFloat(cls.duration);
        if (!isNaN(hrs)) {
          endDate.setMinutes(endDate.getMinutes() + hrs * 60);
        }
      }
      
      icsContent += "BEGIN:VEVENT\r\n";
      const uid = `${cls.id || Math.random().toString(36).substring(2)}@geoziie.edu`;
      icsContent += `UID:${uid}\r\n`;
      icsContent += `DTSTAMP:${formatICSDate(new Date())}\r\n`;
      icsContent += `DTSTART:${formatICSDate(startDate)}\r\n`;
      icsContent += `DTEND:${formatICSDate(endDate)}\r\n`;
      icsContent += `SUMMARY:${cls.subject}\r\n`;
      icsContent += `LOCATION:${cls.room}\r\n`;
      icsContent += `DESCRIPTION:Teacher: ${cls.teacher}\\nClass Duration: ${cls.duration}\r\n`;
      icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${mapDayToICS[daySchedule.day]};UNTIL=${untilStr}\r\n`;
      icsContent += "END:VEVENT\r\n";
    });
  });

  icsContent += "END:VCALENDAR\r\n";

  // Trigger download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = "academic_timetable.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
