import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import CategoriesScreen from './screens/CategoriesScreen';
import ReviewsScreen from './screens/ReviewsScreen';

// Import context providers
import { WalletProvider } from './contexts/WalletContext';

// Import hooks
import { useDynamicColors } from './hooks/useDynamicColors';

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const colors = useDynamicColors();

  return (
    <SafeAreaProvider>
      <WalletProvider>
        <NavigationContainer theme={{
          dark: colorScheme === 'dark',
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            notification: colors.notification,
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: 'bold'
            },
            medium: {
              fontFamily: 'System',
              fontWeight: 'bold'
            },
            bold: {
              fontFamily: '',
              fontWeight: 'bold'
            },
            heavy: {
              fontFamily: '',
              fontWeight: 'bold'
            }
          }
        }}>
          <Tab.Navigator id={undefined}
                         screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: string;

                if (route.name === 'Wallet') {
                  iconName = focused ? 'wallet' : 'wallet-outline';
                } else if (route.name === 'Categories') {
                  iconName = focused ? 'grid' : 'grid-outline';
                } else if (route.name === 'Reviews') {
                  iconName = focused ? 'star' : 'star-outline';
                } else {
                  iconName = 'help-circle';
                }

                return <Ionicons name={iconName as any} size={size} color={color} />;
              },
              tabBarActiveTintColor: colors.primary,
              tabBarInactiveTintColor: colors.text,
              tabBarStyle: {
                backgroundColor: colors.card,
                borderTopWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
                height: 60,
                paddingBottom: 5,
              },
              headerStyle: {
                backgroundColor: colors.card,
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0,
              },
              headerTitleStyle: {
                fontWeight: '600',
                color: colors.text,
              },
            })}
          >
            <Tab.Screen
              name="Wallet"
              component={HomeScreen}
              options={{ title: 'My Wallet' }}
            />
            <Tab.Screen
              name="Categories"
              component={CategoriesScreen}
            />
            <Tab.Screen
              name="Reviews"
              component={ReviewsScreen}
            />
          </Tab.Navigator>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </NavigationContainer>
      </WalletProvider>
    </SafeAreaProvider>
  );
}
