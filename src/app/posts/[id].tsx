import { ScrollView, Text } from 'react-native';
import posts from '../../../assets/data/posts.json';
import PostListItem from '../../components/PostListItem';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';

export default function PostDetailsScreen() {
  const { id } = useLocalSearchParams();

  const post = posts.find((post) => post.id === id);

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: "Post" });
  }, [post]);

  if (!post) {
    return <Text>Post not found</Text>;
  }

  return (
    <ScrollView>
      <PostListItem post={post} />
    </ScrollView>
  );
}