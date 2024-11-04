import { Tabs, useRouter, usePathname } from 'expo-router';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Platform, StyleSheet, Image, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useUser } from '@/contexts/UserContext';
import { TabScreenWrapper } from '@/components/TabScreenWrapper';
import { Home } from '@/icons/Home';

// Helper component for cross-platform icons
function TabIcon({ ionIcon, color }: { ionIcon: 'person' | 'play-square'; color: string }) {
  return <TabBarIcon name={ionIcon} color={color} />;
}

// Netflix profile image component
function ProfileImage({ focused }: { focused: boolean }) {
  const { selectedProfile } = useUser();

  return (
    <React.Fragment>
      <Image
        source={{ uri: selectedProfile?.avatar }}
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          opacity: focused ? 1 : 0.5,
          borderWidth: 2,
          borderColor: focused ? 'white' : 'transparent',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -16,
          alignSelf: 'center',
          width: 5,
          height: 5,
          borderRadius: 2,
          backgroundColor: '#db0000',
        }}
      />
    </React.Fragment>
  );
}

export const TAB_SCREENS = [
  {
    name: 'index',
    title: 'Home',
    icon: ({ color, focused }: { color: string; focused: boolean }) => (
      <Home color={color} isActive={focused} />
    ),
  },
  {
    name: 'new',
    title: 'New & Hot',
    icon: ({ color, focused }: { color: string; focused: boolean }) => (
      <TabIcon ionIcon={focused ? 'compass' : 'compass-outline'} color={color} />
    ),
  },
  {
    name: 'profile',
    title: 'My Netflix',
    icon: ({ focused }: { focused: boolean }) => (
      <ProfileImage focused={focused} />
    ),
  },
];

export default function TabLayout() {
  const pathname = usePathname();
  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#ffffff3f',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#1f1f1f',
          borderTopWidth: 0,
          elevation: 0,
          height: 84,
          paddingTop: 0,
          paddingBottom: 35,
        },
        tabBarLabelStyle: {
          marginBottom: 10,
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            onPress={(e) => {
              handleTabPress();
              props.onPress?.(e);
            }}
          />
        ),
      }}>
      {TAB_SCREENS.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: screen.icon,
          }}
        />
      ))}
    </Tabs>
  );
}
