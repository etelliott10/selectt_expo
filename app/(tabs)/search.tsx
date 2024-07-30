// Search.tsx
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Post } from "./index";

interface User {
  id: string;
  displayName: string;
  email: string;
  profilePictureUrl: string;
}

const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedTab, setSelectedTab] = useState<"posts" | "users">("posts");

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

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const fetchedUsers: User[] = [];
        querySnapshot.forEach((doc) => {
          fetchedUsers.push({ id: doc.id, ...doc.data() } as User);
        });
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchPosts();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredPosts([]);
      setFilteredUsers([]);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filteredPosts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerCaseQuery) ||
        post.description.toLowerCase().includes(lowerCaseQuery) ||
        post.location.toLowerCase().includes(lowerCaseQuery)
    );

    const filteredUsers = users.filter(
      (user) =>
        user.displayName.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery)
    );

    setFilteredPosts(filteredPosts);
    setFilteredUsers(filteredUsers);
  }, [searchQuery, posts, users]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search posts and users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "posts" && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab("posts")}
        >
          <Text style={styles.tabButtonText}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "users" && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab("users")}
        >
          <Text style={styles.tabButtonText}>Users</Text>
        </TouchableOpacity>
      </View>
      {selectedTab === "posts" ? (
        <>
          <Text style={styles.header}>Posts</Text>
          {filteredPosts.map((post) => (
            <View key={post.id} style={styles.postContainer}>
              {post.imageUrl && (
                <Image source={{ uri: post.imageUrl }} style={styles.image} />
              )}
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.location}>Location: {post.location}</Text>
              <Text style={styles.eventDate}>
                Event Date: {post.eventDate.toDate().toLocaleString()}
              </Text>
              <Text style={styles.description}>
                Description: {post.description}
              </Text>
            </View>
          ))}
        </>
      ) : (
        <>
          <Text style={styles.header}>Users</Text>
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userContainer}>
              {user.profilePictureUrl && (
                <Image
                  source={{ uri: user.profilePictureUrl }}
                  style={styles.image}
                />
              )}
              <Text style={styles.title}>{user.displayName}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderColor: "transparent",
  },
  activeTabButton: {
    borderColor: "#1E90FF",
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  postContainer: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  userContainer: {
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
  email: {
    fontSize: 16,
  },
});

export default Search;
