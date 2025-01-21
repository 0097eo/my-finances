import { View, Text, ScrollView } from 'react-native';

export default function Budget() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16 }}>
        {/* Monthly Budget Overview */}
        <View style={{ 
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Monthly Budget
          </Text>
          <Text style={{ fontSize: 24, color: '#f4511e' }}>Ksh 2,000.00</Text>
        </View>

        {/* Budget Categories */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Categories
        </Text>
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 15 }}>
          <Text>No budget categories set</Text>
        </View>
      </View>
    </ScrollView>
  );
}