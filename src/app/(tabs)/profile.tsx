import { StyleSheet } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { Text, View } from '../../components/Themed';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Text
        onPress={() => signOut()}
        style={{ marginTop: 'auto', margin: 10, fontSize: 20, color: 'red' }}
      >
        Sign out
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});