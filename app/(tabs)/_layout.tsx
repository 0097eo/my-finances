import { Tabs } from 'expo-router';
import { Home, PieChart, DollarSign, User } from 'lucide-react-native';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useNotifications } from '@/hooks/useNotifications';
import { useEffect } from 'react';

export default function TabLayout() {

  const { sendLocalNotification } = useNotifications();

  useEffect(()=>{
    sendLocalNotification()
  }, [])

  return (
    <ProtectedRoute>
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#f4511e',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: {
        paddingBottom: 5,
        height: 60,
      },
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color }) => <DollarSign size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color }) => <PieChart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
    </ProtectedRoute>
  );
}