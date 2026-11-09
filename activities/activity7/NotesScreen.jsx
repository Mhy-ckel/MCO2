import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "../../styles";

const STORAGE_KEY = "@activityhub_notes";

export default function NotesScreen() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [error, setError] = useState("");

  const busyRef = useRef(false);
  const inputRef = useRef(null);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    if (busyRef.current) return;

    busyRef.current = true;
    setLoading(true);
    setError("");
    setLoadFailed(false);

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const data = stored !== null ? JSON.parse(stored) : [];

      const valid =
        Array.isArray(data) &&
        data.every(
          (note) =>
            note !== null &&
            typeof note === "object" &&
            typeof note.id === "string" &&
            typeof note.text === "string",
        );

      if (!valid) {
        throw new Error("Invalid saved notes.");
      }

      setNotes(data);
    } catch {
      setLoadFailed(true);
      setError("Could not load saved notes. Please try again.");
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }

  async function persistNotes(updatedNotes) {
    if (busyRef.current || loading || loadFailed) return false;

    busyRef.current = true;
    setSaving(true);
    setError("");

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));

      setNotes(updatedNotes);
      return true;
    } catch {
      setError("Could not save your changes. Please try again.");
      return false;
    } finally {
      busyRef.current = false;
      setSaving(false);
    }
  }

  async function saveNote() {
    const cleanedText = text.trim();

    if (!cleanedText) {
      setError("Please enter a note.");
      return;
    }

    const updatedNotes =
      editingId !== null
        ? notes.map((note) =>
            note.id === editingId ? { ...note, text: cleanedText } : note,
          )
        : [
            {
              id:
                Date.now().toString() +
                "-" +
                Math.random().toString(36).slice(2, 8),
              text: cleanedText,
            },
            ...notes,
          ];

    const saved = await persistNotes(updatedNotes);

    if (saved) {
      setText("");
      setEditingId(null);
      Keyboard.dismiss();
    }
  }

  function editNote(note) {
    setText(note.text);
    setEditingId(note.id);
    setError("");
    inputRef.current?.focus();
  }

  function cancelEdit() {
    setText("");
    setEditingId(null);
    setError("");
    Keyboard.dismiss();
  }

  async function deleteNote(id) {
    const updatedNotes = notes.filter((note) => note.id !== id);
    const saved = await persistNotes(updatedNotes);

    if (saved && editingId === id) {
      cancelEdit();
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.status}>Loading saved notes...</Text>
      </View>
    );
  }

  if (loadFailed) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <Pressable
          onPress={loadNotes}
          style={styles.button}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.page, styles.content, styles.flex]}>
        <Text style={styles.title}>My Notes</Text>

        <Text style={styles.label}>
          {editingId !== null ? "Edit note" : "Write a note"}
        </Text>

        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={(value) => {
            setText(value);
            setError("");
          }}
          placeholder="Enter your note..."
          placeholderTextColor="#64748B"
          multiline
          editable={!saving}
          accessibilityLabel="Note text"
          style={[styles.input, styles.noteInput]}
        />

        <Pressable
          onPress={saveNote}
          disabled={saving}
          accessibilityRole="button"
          style={[styles.button, saving && styles.disabled]}
        >
          <Text style={styles.buttonText}>
            {saving
              ? "Saving..."
              : editingId !== null
                ? "Save Changes"
                : "Add Note"}
          </Text>
        </Pressable>

        {editingId !== null && (
          <Pressable
            onPress={cancelEdit}
            disabled={saving}
            style={styles.cancelButton}
            accessibilityRole="button"
          >
            <Text style={styles.muted}>Cancel Editing</Text>
          </Pressable>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={[styles.cardTitle, styles.spacer]}>
          Saved Notes ({notes.length})
        </Text>

        <FlatList
          style={styles.flex}
          data={notes}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.status}>No notes yet. Add one above.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.text}>{item.text}</Text>

              <View style={styles.actions}>
                <Pressable
                  onPress={() => editNote(item)}
                  disabled={saving}
                  accessibilityRole="button"
                  style={[
                    styles.smallButton,
                    styles.editButton,
                    saving && styles.disabled,
                  ]}
                >
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>

                <Pressable
                  onPress={() => deleteNote(item.id)}
                  disabled={saving}
                  accessibilityRole="button"
                  style={[
                    styles.smallButton,
                    styles.deleteButton,
                    saving && styles.disabled,
                  ]}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
