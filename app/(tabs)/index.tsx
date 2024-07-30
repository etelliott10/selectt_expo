// Home.tsx
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { db } from "../../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { format } from "date-fns";
import { getAuth } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export interface Post {
  id: string;
  title: string;
  location: string;
  interestedUsers: string[];
  eventDate: Timestamp;
  description: string;
  createdBy: string;
  createdAt: Timestamp;
  acceptedUsers: string[];
  imageUrl: string;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsQuery = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(postsQuery);
        const fetchedPosts: Post[] = [];
        querySnapshot.forEach((doc) => {
          fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
        });
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    fetchPosts();
  }, []);

  const handleInterested = async (postId: string) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to mark as interested");
      return;
    }
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        interestedUsers: arrayUnion(userId),
      });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, interestedUsers: [...post.interestedUsers, userId] }
            : post
        )
      );
    } catch (error) {
      console.error("Error updating post: ", error);
      Alert.alert("Error", "Failed to mark as interested");
    }
  };

  const handleNotInterested = async (postId: string) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to mark not interested");
      return;
    }
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        interestedUsers: arrayRemove(userId),
      });
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error updating post: ", error);
      Alert.alert("Error", "Failed to mark not interested");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <Text style={styles.header}>Posts from Firestore:</Text> */}
      {posts.map((post) => {
        const isInterested = post.interestedUsers.includes(userId);
        return (
          <View key={post.id} style={styles.postContainer}>
            {post.imageUrl && (
              <Image source={{ uri: post.imageUrl }} style={styles.image} />
            )}
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.location}>Location: {post.location}</Text>
            <Text style={styles.eventDate}>
              Event Date:{" "}
              {format(post.eventDate.toDate(), "MMMM d, yyyy h:mm aa")}
            </Text>
            <Text style={styles.description}>
              {post.createdBy} {post.description}
            </Text>
            {/* <Text style={styles.createdBy}>Created By: {post.createdBy}</Text> */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.notInterestedButton}
                onPress={() => handleNotInterested(post.id)}
              >
                <Text style={styles.buttonText}>
                  {isInterested ? "Changed Mind" : "Not Interested"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.interestedButton,
                  isInterested && styles.interestedButtonPending,
                ]}
                onPress={() => handleInterested(post.id)}
                disabled={isInterested}
              >
                <Text style={styles.buttonText}>
                  {isInterested ? "Pending" : "Interested"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  postContainer: {
    width: "100%",
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  location: {
    fontSize: 16,
  },
  eventDate: {
    fontSize: 16,
  },
  description: {
    fontSize: 16,
  },
  createdBy: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  interestedButton: {
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  interestedButtonPending: {
    backgroundColor: "#808080",
  },
  notInterestedButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Home;
