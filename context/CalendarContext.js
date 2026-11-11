import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export const CalendarContext = createContext(null);

const EVENTS_KEY = "@activityhub_calendar_events";

export const CALENDAR_CATEGORIES = ["School", "Personal", "Projects", "Others"];

const CATEGORY_COLORS = {
  School: "#2563EB",
  Personal: "#7C3AED",
  Projects: "#047857",
  Others: "#D97706",
};

function createDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isValidTime(value) {
  if (value === null || value === "") {
    return true;
  }

  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function sanitizeEvent(event) {
  if (!event || typeof event !== "object") {
    return null;
  }

  if (
    typeof event.id !== "string" ||
    typeof event.title !== "string" ||
    typeof event.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(event.date)
  ) {
    return null;
  }

  const category = CALENDAR_CATEGORIES.includes(event.category)
    ? event.category
    : "Others";

  const isAllDay = event.isAllDay === true;

  const startTime = isValidTime(event.startTime) ? event.startTime : null;
  const endTime = isValidTime(event.endTime) ? event.endTime : null;

  return {
    id: event.id,
    title: event.title,
    description: typeof event.description === "string" ? event.description : "",
    category,
    date: event.date,
    startTime: isAllDay ? null : startTime,
    endTime: isAllDay ? null : endTime,
    isAllDay,
    location: typeof event.location === "string" ? event.location : "",
    reminder: typeof event.reminder === "string" ? event.reminder : "none",
    color: CATEGORY_COLORS[category],
    createdAt:
      typeof event.createdAt === "string"
        ? event.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof event.updatedAt === "string"
        ? event.updatedAt
        : new Date().toISOString(),
  };
}

function sortEvents(events) {
  return [...events].sort((firstEvent, secondEvent) => {
    if (firstEvent.isAllDay && !secondEvent.isAllDay) {
      return -1;
    }

    if (!firstEvent.isAllDay && secondEvent.isAllDay) {
      return 1;
    }

    if (firstEvent.isAllDay && secondEvent.isAllDay) {
      return firstEvent.title.localeCompare(secondEvent.title);
    }

    const firstTime = firstEvent.startTime || "00:00";
    const secondTime = secondEvent.startTime || "00:00";

    return firstTime.localeCompare(secondTime);
  });
}

export function CalendarProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [calendarReady, setCalendarReady] = useState(false);
  const [calendarError, setCalendarError] = useState("");

  const mountedRef = useRef(true);

  useEffect(() => {
    let active = true;
    mountedRef.current = true;

    async function restoreEvents() {
      try {
        const storedEvents = await AsyncStorage.getItem(EVENTS_KEY);
        const parsedEvents = storedEvents ? JSON.parse(storedEvents) : [];

        const safeEvents = Array.isArray(parsedEvents)
          ? parsedEvents.map(sanitizeEvent).filter(Boolean)
          : [];

        if (active) {
          setEvents(safeEvents);
          setCalendarReady(true);
        }
      } catch (error) {
        console.warn("Calendar events loading failed:", error);

        if (active) {
          setCalendarError(
            "Could not restore calendar events. Starting with an empty calendar.",
          );
          setCalendarReady(true);
        }
      }
    }

    restoreEvents();

    return () => {
      active = false;
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!calendarReady) {
      return;
    }

    AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events)).catch((error) => {
      console.warn("Calendar events saving failed:", error);

      if (mountedRef.current) {
        setCalendarError(
          "Calendar changes could not be saved. Please try again.",
        );
      }
    });
  }, [events, calendarReady]);

  function addEvent(eventData) {
    const title =
      typeof eventData.title === "string" ? eventData.title.trim() : "";

    if (!title) {
      setCalendarError("Please enter an event title.");
      return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventData.date || "")) {
      setCalendarError("Please enter a valid event date.");
      return false;
    }

    if (
      !eventData.isAllDay &&
      eventData.startTime &&
      eventData.endTime &&
      eventData.startTime > eventData.endTime
    ) {
      setCalendarError("The end time must be after the start time.");
      return false;
    }

    const newEvent = sanitizeEvent({
      ...eventData,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!newEvent) {
      setCalendarError("Could not create the event. Please try again.");
      return false;
    }

    setEvents((currentEvents) => [...currentEvents, newEvent]);
    setCalendarError("");
    return true;
  }

  function updateEvent(eventId, eventData) {
    const title =
      typeof eventData.title === "string" ? eventData.title.trim() : "";

    if (!title) {
      setCalendarError("Please enter an event title.");
      return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventData.date || "")) {
      setCalendarError("Please enter a valid event date.");
      return false;
    }

    if (
      !eventData.isAllDay &&
      eventData.startTime &&
      eventData.endTime &&
      eventData.startTime > eventData.endTime
    ) {
      setCalendarError("The end time must be after the start time.");
      return false;
    }

    setEvents((currentEvents) =>
      currentEvents.map((event) => {
        if (event.id !== eventId) {
          return event;
        }

        const updatedEvent = sanitizeEvent({
          ...event,
          ...eventData,
          id: event.id,
          title,
          createdAt: event.createdAt,
          updatedAt: new Date().toISOString(),
        });

        return updatedEvent || event;
      }),
    );

    setCalendarError("");
    return true;
  }

  function deleteEvent(eventId) {
    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== eventId),
    );
  }

  function clearCalendarError() {
    setCalendarError("");
  }

  const eventsByDate = useMemo(() => {
    const groupedEvents = {};

    events.forEach((event) => {
      if (!groupedEvents[event.date]) {
        groupedEvents[event.date] = [];
      }

      groupedEvents[event.date].push(event);
    });

    Object.keys(groupedEvents).forEach((dateKey) => {
      groupedEvents[dateKey] = sortEvents(groupedEvents[dateKey]);
    });

    return groupedEvents;
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const todayKey = createDateKey(new Date());

    return sortEvents(events.filter((event) => event.date >= todayKey));
  }, [events]);

  const value = {
    events,
    eventsByDate,
    upcomingEvents,
    calendarReady,
    calendarError,
    addEvent,
    updateEvent,
    deleteEvent,
    clearCalendarError,
    getCategoryColor: (category) => CATEGORY_COLORS[category] || "#64748B",
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("useCalendar must be used inside CalendarProvider.");
  }

  return context;
}
