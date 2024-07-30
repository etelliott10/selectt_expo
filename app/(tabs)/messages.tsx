// screens/Messages.tsx
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Link } from "expo-router";

interface User {
  id: string;
  displayName: string;
  email: string;
  profilePictureUrl: string;
}

export default function Messages() {
  const [contacts, setContacts] = useState<User[]>([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const fetchedContacts: User[] = [];
        querySnapshot.forEach((doc) => {
          fetchedContacts.push({ id: doc.id, ...doc.data() } as User);
        });
        setContacts(fetchedContacts);
      } catch (error) {
        console.error("Error fetching contacts: ", error);
      }
    };

    fetchContacts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "../screens/messages/[contactId]",
              params: { contactId: item.id, contactName: item.displayName },
            }}
            asChild
          >
            <TouchableOpacity style={styles.contactContainer}>
              <Text style={styles.contactName}>{item.displayName}</Text>
              <Text style={styles.contactEmail}>{item.email}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  contactContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  contactEmail: {
    fontSize: 14,
    color: "#555",
  },
  buttonContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
