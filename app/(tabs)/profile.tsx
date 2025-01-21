import { View, Text } from 'react-native';

export default function Profile() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 16 }}>
      <View style={{ 
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center'
      }}>
        <View style={{ 
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#f4511e',
          marginBottom: 15
        }} />
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>John Doe</Text>
        <Text style={{ color: 'gray' }}>john.doe@example.com</Text>
      </View>
    </View>
  );
}