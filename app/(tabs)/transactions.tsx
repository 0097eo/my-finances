import { View, Text, FlatList } from 'react-native';

export default function Transactions() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 16 }}>
      <View style={{ 
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10
      }}>
        <Text style={{ fontSize: 16, textAlign: 'center' }}>
          No transactions yet
        </Text>
      </View>
    </View>
  );
}