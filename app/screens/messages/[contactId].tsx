// app/messages/[contactId].tsx
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Button,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { db } from "../../../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: any;
}

const Messages: React.FC = () => {
  const { contactId, contactName } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserId = () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
      }
    };

    fetchUserId();
  }, [auth]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId) return;

      try {
        const messagesQuery = query(
          collection(db, "messages"),
          where("participants", "array-contains", userId),
          orderBy("createdAt", "asc")
        );
        const querySnapshot = await getDocs(messagesQuery);
        const fetchedMessages: Message[] = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages: ", error);
      }
    };

    fetchMessages();
  }, [userId]);

  const sendMessage = async () => {
    if (text.trim() === "" || !userId || !contactId) return;

    try {
      await addDoc(collection(db, "messages"), {
        text,
        senderId: userId,
        receiverId: contactId,
        participants: [userId, contactId],
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{contactName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.senderId === userId ? styles.myMessage : styles.theirMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageDate}>
              {new Date(item.createdAt.seconds * 1000).toLocaleString()}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={text}
          onChangeText={setText}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  myMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#ECECEC",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  messageDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 8,
    marginRight: 8,
  },
});

export default Messages;
