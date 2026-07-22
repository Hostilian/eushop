import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { offlineStorageService } from './lib/services/OfflineStorageService';
import { notificationService } from './lib/services/NotificationService';

import HomeScreen from './screens/HomeScreen';
import MessagesScreen from './screens/MessagesScreen';
import ProfileScreen from './screens/ProfileScreen';
import SearchScreen from './screens/SearchScreen';
import ListingUploadScreen from './screens/ListingUploadScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import GDPRScreen from './screens/GDPRScreen';
import AllergenFilterScreen from './screens/AllergenFilterScreen';

const BACKGROUND_SYNC_TASK = 'background-sync';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    await offlineStorageService.syncProducts();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

async function registerBackgroundSyncAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('');

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await registerBackgroundSyncAsync();
        const token = await notificationService.registerForPushNotificationsAsync();
        setExpoPushToken(token);
      } catch (e) {
        console.warn(e);
      } finally {
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: any;
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Search') {
                iconName = focused ? 'search' : 'search-outline';
              } else if (route.name === 'Messages') {
                iconName = focused ? 'chatbox' : 'chatbox-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              } else {
                return null;
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1E3F20',
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopColor: '#EBE9E1',
            },
            headerStyle: {
              backgroundColor: '#1E3F20',
            },
            headerTintColor: '#FFFFFF',
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Search" component={SearchScreen} />
          <Tab.Screen name="Messages" component={MessagesScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Tab.Screen
            name="ListingUpload"
            component={ListingUploadScreen}
            options={{ tabBarButton: () => null, title: 'Upload Listing' }}
          />
          <Tab.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{ tabBarButton: () => null, title: 'Checkout' }}
          />
          <Tab.Screen
            name="GDPR"
            component={GDPRScreen}
            options={{ tabBarButton: () => null, title: 'Privacy Center' }}
          />
          <Tab.Screen
            name="AllergenFilter"
            component={AllergenFilterScreen}
            options={{ tabBarButton: () => null, title: 'Allergen Filter' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
