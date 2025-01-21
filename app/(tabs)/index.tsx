import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 16 }}>
        <StatusBar style="dark" />
        {/* Balance Card */}
        <View style={{ 
          backgroundColor: '#f4511e', 
          padding: 20, 
          borderRadius: 12,
          marginBottom: 20
        }}>
          <Text style={{ color: 'white', fontSize: 16 }}>Total Balance</Text>
          <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>
            Ksh 5,240.00
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginBottom: 20
        }}>
          <View style={{ 
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 12,
            flex: 1,
            marginRight: 10
          }}>
            <Text style={{ color: 'green' }}>Income</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Ksh 3,500</Text>
          </View>
          <View style={{ 
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 12,
            flex: 1,
            marginLeft: 10
          }}>
            <Text style={{ color: 'red' }}>Expenses</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Ksh 2,260</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Recent Transactions
        </Text>
        <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 15 }}>
          <Text>No recent transactions</Text>
        </View>
      </View>
    </ScrollView>
  );
}