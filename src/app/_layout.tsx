import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, useColorScheme } from 'react-native';
import { ApolloProvider } from '@apollo/client';
import client from '../apollo/Client';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import AuthScreen from '../components/auth/AuthScreen';
import * as SecureStore from "expo-secure-store";
import UserContextProvider, { useUserContext } from '../context/UserContext';
import SetupProfileScreen from '../components/auth/SetupProfileScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
// console.log(CLERK_PUBLISHABLE_KEY)
const tokenCache = {
  getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return null;
    }
  },
};
 
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNavWithProps />;
}
function RootLayoutNavWithProps() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ApolloProvider client={client}>
        <UserContextProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootLayoutNav />         
          </ThemeProvider>
        </UserContextProvider>
      </ApolloProvider>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const {dbUser, loading } = useUserContext();
  // console.log("Db User: ", dbUser)
  // console.log("Loading status: ", loading)
  
  // if (loading) {
  //   return (
  //     <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
  //       <ActivityIndicator />
  //     </SafeAreaView>      
  //   );
  // }
  return (
    <>
      <SignedIn>
        {!dbUser ?(<SetupProfileScreen />):
        (
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            <Stack.Screen name="posts/[id]" options={{ presentation: 'formSheet' }} />
            <Stack.Screen name="users/[id]" options={{ presentation: 'formSheet' }} />
          </Stack>
        )}
        
      </SignedIn>
      <SignedOut>
        <AuthScreen />
      </SignedOut>          
    </>
  );
}
