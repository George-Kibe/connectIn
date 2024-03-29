import { Pressable, StyleSheet, TextInput, Image } from 'react-native';
import { Text, View } from '../../components/Themed';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { gql, useMutation } from '@apollo/client';
import { useUserContext } from '../../context/UserContext';
import { uploadImageToS3 } from '../../utils/uploadImageToS3';

const insertPost = gql`
  mutation MyMutation($content: String, $image: String, $userId: ID) {
    insertPost(content: $content, image: $image, userid: $userId) {
      content
      id
      image
      userid
    }
  }
`;

export default function NewPostScreen() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const {dbUser, authUser } = useUserContext();

  const navigation = useNavigation();
  const router = useRouter();

  const [handleMutation, { loading, error, data }] = useMutation(insertPost);
	
	const onPost = async () => {
	    console.warn(`Posting: ${content}`);
	    try {
	      await handleMutation({ variables: { content, userId: dbUser.id, image } });	
	      router.push('/(tabs)/');
	      setContent('');
	      setImage(null);
	    } catch (e) {
	      console.log(e);
	    }
	  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={onPost} style={styles.postButton}>
          <Text style={styles.postButtonText}>Submit</Text>
        </Pressable>
      ),
    });
  }, [onPost]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 0.5,
    });
    const { assets } = result;
    if(result.canceled || assets.length < 1){
      return
    }
    // for (let i = 0; i < assets.length; i++) {
    //   // console.log(assets[i])
    const {uri:url, type: mimetype} = assets[0]
    const parts = url.split(".");
    const ext = parts[parts.length-1];
      // const filename = parts[0];
    const uploadUrl = await uploadImageToS3(url, mimetype, ext);
    console.log("S3 Image Url: ",uploadUrl)
      // uploadedFiles.push(uploadUrl)
    // }

    if (!result.canceled) {
      setImage(uploadUrl)
      // setImage(result.assets[0].uri);
    }
  };
  console.log("Image: ",image, "Content: ",content)

  return (
    <View style={styles.container}>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="What do you want to talk about?"
        style={styles.input}
        multiline
      />

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <View style={styles.footer}>
        <Pressable onPress={pickImage} style={styles.iconButton}>
          <FontAwesome name="image" size={24} color="black" />
        </Pressable>

        <View style={styles.iconButton}>
          <FontAwesome name="camera" size={24} color="black" />
        </View>

        <View style={styles.iconButton}>
          <FontAwesome name="glass" size={24} color="black" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  input: {
    fontSize: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // header
  postButton: {
    backgroundColor: 'royalblue',
    padding: 5,
    paddingHorizontal: 15,
    borderRadius: 50,
    marginRight: 10,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  image: {
    width: '100%',
    aspectRatio: 1,
    marginTop: 'auto',
  },

  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    backgroundColor: 'gainsboro',
    padding: 20,
    borderRadius: 100,
  },
});
