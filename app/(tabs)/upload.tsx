// TabUploadScreen.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  Button,
  Alert,
  Image,
  Platform,
  useColorScheme,
} from "react-native";
import { Text, View } from "@/components/Themed";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { storage, db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function TabUploadScreen() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `posts/${new Date().toISOString()}`);
      const snapshot = await uploadBytes(storageRef, blob);
      return getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading image: ", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleAddPost = async () => {
    if (
      title &&
      location &&
      description &&
      image &&
      eventDate &&
      startTime &&
      endTime
    ) {
      try {
        const imageUrl = await uploadImage(image);
        await addDoc(collection(db, "posts"), {
          title,
          location,
          description,
          imageUrl,
          createdBy: "currentUser", // Replace with actual user ID
          createdAt: serverTimestamp(),
          eventDate,
          startTime,
          endTime,
          interestedUsers: [],
          acceptedUsers: [],
        });
        Alert.alert("Success", "Post added successfully");
        setTitle("");
        setLocation("");
        setDescription("");
        setImage(null);
        setEventDate(null);
        setStartTime(null);
        setEndTime(null);
      } catch (error) {
        console.error("Error adding post: ", error);
        Alert.alert("Error", "Failed to add post");
      }
    } else {
      Alert.alert("Error", "All fields are required");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setEventDate(selectedDate);
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Pick Event Date" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={eventDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Button
        title="Pick Start Time"
        onPress={() => setShowStartTimePicker(true)}
      />
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
      )}
      <Button
        title="Pick End Time"
        onPress={() => setShowEndTimePicker(true)}
      />
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
        />
      )}
      <Button title="Add Post" onPress={handleAddPost} />
    </View>
  );
}

const styles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colorScheme === "dark" ? "#fff" : "#000",
    },
    separator: {
      marginVertical: 30,
      height: 1,
      width: "80%",
      backgroundColor: colorScheme === "dark" ? "#fff" : "#000",
    },
    input: {
      width: "100%",
      height: 40,
      borderColor: colorScheme === "dark" ? "#fff" : "gray",
      borderWidth: 1,
      marginBottom: 12,
      padding: 8,
      color: colorScheme === "dark" ? "#fff" : "#000",
      backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
    },
    image: {
      width: "100%",
      height: 200,
      marginBottom: 16,
      borderRadius: 8,
    },
  });
