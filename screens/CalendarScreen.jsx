import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CalendarEventCard from "../components/CalendarEventCard";
import { CALENDAR_CATEGORIES, useCalendar } from "../context/CalendarContext";
import { useAppTheme } from "../theme/useAppTheme";
import { useFocusTimer } from "../context/FocusTimerContext";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function createDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);

  return nextDate;
}

function getMonthLabel(date) {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function getWeekLabel(startDate) {
  const endDate = addDays(startDate, 6);

  const startLabel = startDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const endLabel = endDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

function getStartOfWeek(date) {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  return startOfWeek;
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const [hourString, minuteString] = value.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

const EMPTY_EVENT = {
  title: "",
  description: "",
  category: "School",
  date: "",
  startTime: "",
  endTime: "",
  isAllDay: false,
  location: "",
  reminder: "none",
};

export default function CalendarScreen() {
  const { theme, hubStyles } = useAppTheme();
  const insets = useSafeAreaInsets();

  const {
    eventsByDate,
    upcomingEvents,
    calendarError,
    addEvent,
    updateEvent,
    deleteEvent,
    clearCalendarError,
    getCategoryColor,
  } = useCalendar();

  const { history } = useFocusTimer();

  const [viewMode, setViewMode] = useState("month");
  const [selectedDate, setSelectedDate] = useState(() =>
    createDateKey(new Date()),
  );
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const [weekCursor, setWeekCursor] = useState(() =>
    getStartOfWeek(new Date()),
  );

  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [form, setForm] = useState(EMPTY_EVENT);

  const todayKey = createDateKey(new Date());
  const selectedDateEvents = eventsByDate[selectedDate] || [];

  const filteredEvents = useMemo(() => {
    const todayKey = createDateKey(new Date());

    return Object.values(eventsByDate)
      .flat()
      .filter((event) => {
        const matchesSearch = event.title
          .toLowerCase()
          .includes(searchText.toLowerCase());

        const matchesCategory =
          categoryFilter === "All" || event.category === categoryFilter;

        const matchesUpcoming = !showUpcomingOnly || event.date >= todayKey;

        return matchesSearch && matchesCategory && matchesUpcoming;
      })
      .sort((firstEvent, secondEvent) => {
        if (firstEvent.date !== secondEvent.date) {
          return firstEvent.date.localeCompare(secondEvent.date);
        }

        if (firstEvent.isAllDay && !secondEvent.isAllDay) {
          return -1;
        }

        if (!firstEvent.isAllDay && secondEvent.isAllDay) {
          return 1;
        }

        return (firstEvent.startTime || "").localeCompare(
          secondEvent.startTime || "",
        );
      });
  }, [eventsByDate, searchText, categoryFilter, showUpcomingOnly]);

  const monthDays = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const leadingEmptyDays = firstDay.getDay();

    const days = [];

    for (let index = 0; index < leadingEmptyDays; index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(createDateKey(new Date(year, month, day)));
    }

    return days;
  }, [monthCursor]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) =>
      createDateKey(addDays(weekCursor, index)),
    );
  }, [weekCursor]);

  const focusHistory = useMemo(() => {
    return history.filter((session) => session.type === "focus").slice(0, 5);
  }, [history]);

  function changeMonth(amount) {
    const nextMonth = new Date(monthCursor);
    nextMonth.setMonth(nextMonth.getMonth() + amount);

    setMonthCursor(nextMonth);
  }

  function changeWeek(amount) {
    setWeekCursor((currentWeek) => addDays(currentWeek, amount * 7));
  }

  function openCreateForm() {
    setEditingEventId(null);
    setForm({
      ...EMPTY_EVENT,
      date: selectedDate,
    });
    setFormVisible(true);
  }

  function openEditForm(event) {
    setEditingEventId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      isAllDay: event.isAllDay,
      location: event.location,
      reminder: event.reminder,
    });
    setFormVisible(true);
  }

  function handleSaveEvent() {
    const result = editingEventId
      ? updateEvent(editingEventId, form)
      : addEvent(form);

    if (result) {
      setFormVisible(false);
      setEditingEventId(null);
      setForm(EMPTY_EVENT);
      setSelectedDate(form.date);
    }
  }

  function handleDeleteEvent(eventId) {
    Alert.alert("Delete event", "Are you sure you want to delete this event?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteEvent(eventId),
      },
    ]);
  }

  const styles = createStyles(theme, insets);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>

        <Pressable
          onPress={openCreateForm}
          accessibilityRole="button"
          accessibilityLabel="Add calendar event"
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {calendarError ? (
        <Pressable
          onPress={clearCalendarError}
          accessibilityRole="alert"
          style={styles.errorBanner}
        >
          <Text style={styles.errorText}>{calendarError}</Text>
        </Pressable>
      ) : null}

      <View style={styles.viewSelector}>
        {[
          {
            key: "month",
            label: "Monthly",
          },
          {
            key: "week",
            label: "Weekly",
          },
          {
            key: "day",
            label: "Daily",
          },
        ].map((view) => {
          const isActive = viewMode === view.key;

          return (
            <Pressable
              key={view.key}
              onPress={() => setViewMode(view.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Switch to ${view.label} view`}
              style={[styles.viewButton, isActive && styles.activeViewButton]}
            >
              <Text
                style={[
                  styles.viewButtonText,
                  isActive && styles.activeViewButtonText,
                ]}
              >
                {view.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {viewMode === "month" ? (
        <View style={styles.calendarCard}>
          <View style={styles.navigationRow}>
            <Pressable
              onPress={() => changeMonth(-1)}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              style={styles.navigationButton}
            >
              <Ionicons name="chevron-back" size={20} color={theme.text} />
            </Pressable>

            <Text style={styles.navigationTitle}>
              {getMonthLabel(monthCursor)}
            </Text>

            <Pressable
              onPress={() => changeMonth(1)}
              accessibilityRole="button"
              accessibilityLabel="Next month"
              style={styles.navigationButton}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((weekday) => (
              <Text key={weekday} style={styles.weekdayText}>
                {weekday}
              </Text>
            ))}
          </View>

          <View style={styles.monthGrid}>
            {monthDays.map((dateKey, index) => {
              if (!dateKey) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const dayEvents = eventsByDate[dateKey] || [];
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayKey;

              return (
                <Pressable
                  key={dateKey}
                  onPress={() => setSelectedDate(dateKey)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${dateKey}`}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDayCell,
                    isToday && !isSelected && styles.todayDayCell,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {Number(dateKey.split("-")[2])}
                  </Text>

                  {dayEvents.length > 0 ? (
                    <View style={styles.eventIndicator} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {viewMode === "week" ? (
        <View style={styles.calendarCard}>
          <View style={styles.navigationRow}>
            <Pressable
              onPress={() => changeWeek(-1)}
              accessibilityRole="button"
              accessibilityLabel="Previous week"
              style={styles.navigationButton}
            >
              <Ionicons name="chevron-back" size={20} color={theme.text} />
            </Pressable>

            <Text style={styles.navigationTitle}>
              {getWeekLabel(weekCursor)}
            </Text>

            <Pressable
              onPress={() => changeWeek(1)}
              accessibilityRole="button"
              accessibilityLabel="Next week"
              style={styles.navigationButton}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {weekDays.map((dateKey) => {
              const date = parseDateKey(dateKey);
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayKey;

              return (
                <Pressable
                  key={dateKey}
                  onPress={() => setSelectedDate(dateKey)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${dateKey}`}
                  style={[
                    styles.weekDayCell,
                    isSelected && styles.selectedDayCell,
                    isToday && !isSelected && styles.todayDayCell,
                  ]}
                >
                  <Text
                    style={[
                      styles.weekdaySmallText,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {WEEKDAY_LABELS[date.getDay()]}
                  </Text>

                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>

                  {(eventsByDate[dateKey] || []).length > 0 ? (
                    <View style={styles.eventIndicator} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.agendaCard}>
        <View style={styles.agendaHeader}>
          <Text style={styles.agendaTitle}>
            {parseDateKey(selectedDate).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>

          <Pressable
            onPress={openCreateForm}
            accessibilityRole="button"
            accessibilityLabel="Add event for selected date"
            style={styles.smallAddButton}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </Pressable>
        </View>

        {selectedDateEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={28} color={theme.text} />

            <Text style={styles.emptyTitle}>No scheduled items</Text>

            <Text style={styles.emptyDescription}>
              Tap the plus button to add an event or deadline.
            </Text>
          </View>
        ) : (
          selectedDateEvents.map((event, index) => {
            const overlapping =
              !event.isAllDay &&
              index > 0 &&
              selectedDateEvents[index - 1].endTime &&
              event.startTime &&
              selectedDateEvents[index - 1].endTime > event.startTime;

            return (
              <View key={event.id}>
                {overlapping ? (
                  <Text style={styles.overlapWarning}>
                    Overlapping schedule
                  </Text>
                ) : null}

                <CalendarEventCard
                  event={event}
                  onPress={() => openEditForm(event)}
                />
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Search & Filters</Text>

        <View style={styles.searchCard}>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={theme.text} />

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search events"
              placeholderTextColor={theme.text}
              accessibilityLabel="Search calendar events"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.filterRow}>
            {["All", ...CALENDAR_CATEGORIES].map((category) => {
              const isActive = categoryFilter === category;

              return (
                <Pressable
                  key={category}
                  onPress={() => setCategoryFilter(category)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`Filter by ${category}`}
                  style={[
                    styles.filterButton,
                    isActive && styles.activeFilterButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.activeFilterText,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => setShowUpcomingOnly((current) => !current)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: showUpcomingOnly }}
            accessibilityLabel="Show upcoming events only"
            style={styles.upcomingToggle}
          >
            <Ionicons
              name={showUpcomingOnly ? "checkbox" : "square-outline"}
              size={20}
              color={theme.text}
            />

            <Text style={styles.upcomingText}>Upcoming events only</Text>
          </Pressable>
        </View>

        {filteredEvents.length === 0 ? (
          <Text style={styles.emptyFilterText}>
            No events match your filters.
          </Text>
        ) : (
          filteredEvents.map((event) => (
            <CalendarEventCard
              key={event.id}
              event={event}
              showDate
              onPress={() => openEditForm(event)}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>

        {upcomingEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass-outline" size={28} color={theme.text} />

            <Text style={styles.emptyTitle}>No upcoming events</Text>

            <Text style={styles.emptyDescription}>
              Events with today’s date or later will appear here.
            </Text>
          </View>
        ) : (
          upcomingEvents
            .slice(0, 5)
            .map((event) => (
              <CalendarEventCard
                key={event.id}
                event={event}
                showDate
                onPress={() => openEditForm(event)}
              />
            ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Focus Sessions</Text>

        {focusHistory.length === 0 ? (
          <Text style={styles.emptyFilterText}>
            No completed focus sessions yet.
          </Text>
        ) : (
          focusHistory.map((session) => (
            <View key={session.id} style={styles.focusHistoryItem}>
              <View>
                <Text style={styles.focusHistoryTitle}>Focus Session</Text>

                <Text style={styles.focusHistoryDate}>
                  {new Date(session.completedAt).toLocaleString()}
                </Text>
              </View>

              <Text style={styles.focusHistoryMinutes}>
                {session.minutes} min
              </Text>
            </View>
          ))
        )}
      </View>

      <Modal
        visible={formVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setFormVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            {
              paddingTop: Math.max(insets.top, 24),
            },
          ]}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingEventId ? "Edit Event" : "New Event"}
              </Text>

              <Pressable
                onPress={() => setFormVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close event form"
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Title</Text>

            <TextInput
              value={form.title}
              onChangeText={(value) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  title: value,
                }))
              }
              placeholder="Event title"
              placeholderTextColor={theme.text}
              accessibilityLabel="Event title"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Description</Text>

            <TextInput
              value={form.description}
              onChangeText={(value) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  description: value,
                }))
              }
              placeholder="Add details"
              placeholderTextColor={theme.text}
              accessibilityLabel="Event description"
              multiline
              style={[styles.input, styles.multilineInput]}
            />

            <Text style={styles.fieldLabel}>Category</Text>

            <View style={styles.filterRow}>
              {CALENDAR_CATEGORIES.map((category) => {
                const isActive = form.category === category;

                return (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        category,
                      }))
                    }
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`Select ${category} category`}
                    style={[
                      styles.filterButton,
                      isActive && styles.activeFilterButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.activeFilterText,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>

            <TextInput
              value={form.date}
              onChangeText={(value) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  date: value,
                }))
              }
              placeholder="2026-11-11"
              placeholderTextColor={theme.text}
              accessibilityLabel="Event date"
              style={styles.input}
            />

            <Pressable
              onPress={() =>
                setForm((currentForm) => ({
                  ...currentForm,
                  isAllDay: !currentForm.isAllDay,
                }))
              }
              accessibilityRole="checkbox"
              accessibilityState={{ checked: form.isAllDay }}
              accessibilityLabel="All-day event"
              style={styles.upcomingToggle}
            >
              <Ionicons
                name={form.isAllDay ? "checkbox" : "square-outline"}
                size={20}
                color={theme.text}
              />

              <Text style={styles.upcomingText}>All-day event</Text>
            </Pressable>

            {!form.isAllDay ? (
              <>
                <Text style={styles.fieldLabel}>Start time (HH:MM)</Text>

                <TextInput
                  value={form.startTime}
                  onChangeText={(value) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      startTime: value,
                    }))
                  }
                  placeholder="09:00"
                  placeholderTextColor={theme.text}
                  accessibilityLabel="Event start time"
                  style={styles.input}
                />

                <Text style={styles.fieldLabel}>End time (HH:MM)</Text>

                <TextInput
                  value={form.endTime}
                  onChangeText={(value) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      endTime: value,
                    }))
                  }
                  placeholder="10:00"
                  placeholderTextColor={theme.text}
                  accessibilityLabel="Event end time"
                  style={styles.input}
                />
              </>
            ) : null}

            <Text style={styles.fieldLabel}>Location</Text>

            <TextInput
              value={form.location}
              onChangeText={(value) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  location: value,
                }))
              }
              placeholder="Optional location"
              placeholderTextColor={theme.text}
              accessibilityLabel="Event location"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Reminder</Text>

            <View style={styles.filterRow}>
              {[
                {
                  value: "none",
                  label: "None",
                },
                {
                  value: "5",
                  label: "5 min",
                },
                {
                  value: "15",
                  label: "15 min",
                },
                {
                  value: "30",
                  label: "30 min",
                },
                {
                  value: "1440",
                  label: "1 day",
                },
              ].map((reminder) => {
                const isActive = form.reminder === reminder.value;

                return (
                  <Pressable
                    key={reminder.value}
                    onPress={() =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        reminder: reminder.value,
                      }))
                    }
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`Set reminder to ${reminder.label}`}
                    style={[
                      styles.filterButton,
                      isActive && styles.activeFilterButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.activeFilterText,
                      ]}
                    >
                      {reminder.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={handleSaveEvent}
              accessibilityRole="button"
              accessibilityLabel="Save event"
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.saveButtonText}>
                {editingEventId ? "Update Event" : "Create Event"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (theme, insets) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 20,
      paddingTop: 20,
      paddingBottom: Math.max(insets.bottom, 24) + 24,
      gap: 18,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.text,
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
    pressedButton: {
      opacity: 0.75,
      transform: [{ scale: 0.98 }],
    },
    errorBanner: {
      backgroundColor: theme.surface,
      borderColor: theme.error,
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
    },
    errorText: {
      color: theme.error,
      fontSize: 13,
      fontWeight: "500",
    },
    viewSelector: {
      flexDirection: "row",
      gap: 8,
    },
    viewButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    activeViewButton: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    viewButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.text,
    },
    activeViewButtonText: {
      color: "#FFFFFF",
    },
    calendarCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      gap: 14,
    },
    navigationRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    navigationButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    navigationTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    weekdayRow: {
      flexDirection: "row",
    },
    weekdayText: {
      flex: 1,
      textAlign: "center",
      fontSize: 11,
      fontWeight: "700",
      color: theme.text,
      opacity: 0.6,
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayCell: {
      width: "14.28%",
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    },
    selectedDayCell: {
      backgroundColor: theme.accent,
    },
    todayDayCell: {
      borderWidth: 1,
      borderColor: theme.accent,
    },
    dayText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
    },
    selectedDayText: {
      color: "#FFFFFF",
    },
    eventIndicator: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.accent,
      marginTop: 3,
    },
    weekRow: {
      flexDirection: "row",
      gap: 6,
    },
    weekDayCell: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    weekdaySmallText: {
      fontSize: 10,
      fontWeight: "700",
      color: theme.text,
      opacity: 0.6,
    },
    agendaCard: {
      backgroundColor: theme.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      gap: 12,
    },
    agendaHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    agendaTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    smallAddButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      padding: 24,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
    },
    emptyDescription: {
      textAlign: "center",
      fontSize: 13,
      lineHeight: 19,
      color: theme.text,
      opacity: 0.7,
    },
    overlapWarning: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.error,
      marginBottom: 6,
    },
    section: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
    },
    searchCard: {
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
      gap: 12,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 14,
    },
    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    activeFilterButton: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    filterText: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.text,
    },
    activeFilterText: {
      color: "#FFFFFF",
    },
    upcomingToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    upcomingText: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.text,
    },
    emptyFilterText: {
      fontSize: 13,
      color: theme.text,
      opacity: 0.65,
    },
    focusHistoryItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      padding: 14,
    },
    focusHistoryTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.text,
    },
    focusHistoryDate: {
      fontSize: 12,
      color: theme.text,
      opacity: 0.6,
      marginTop: 3,
    },
    focusHistoryMinutes: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.accent,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalContent: {
      padding: 20,
      paddingBottom: Math.max(insets.bottom, 24) + 24,
      gap: 12,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "800",
      color: theme.text,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.text,
      marginTop: 6,
    },
    input: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      color: theme.text,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
    },
    multilineInput: {
      height: 90,
      textAlignVertical: "top",
    },
    saveButton: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.accent,
      borderRadius: 14,
      paddingVertical: 14,
      marginTop: 10,
    },
    saveButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  });
