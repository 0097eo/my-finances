import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/components/AuthContext';
import { API_URL } from '@/constants/api';

export default function Index() {
  const { user, token, isLoading } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState<number>(0);
  const [income, setIncome] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch transactions
      const response = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);

        // Calculate balance, income, and expenses
        let totalIncome = 0;
        let totalExpenses = 0;
        data.forEach((t: any) => {
          if (t.type === 'income') totalIncome += t.amount;
          if (t.type === 'expense') totalExpenses += t.amount;
        });
        setIncome(totalIncome);
        setExpenses(totalExpenses);
        setBalance(totalIncome - totalExpenses);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    setLoading(false);
  };

  if (isLoading || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f4511e" />
      </View>
    );
  }

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
            Ksh {balance.toFixed(2)}
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
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              Ksh {income.toFixed(2)}
            </Text>
          </View>
          <View style={{ 
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 12,
            flex: 1,
            marginLeft: 10
          }}>
            <Text style={{ color: 'red' }}>Expenses</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              Ksh {expenses.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Recent Transactions
        </Text>
        {transactions.length > 0 ? (
          transactions.map((t: any) => (
            <View
              key={t.id}
              style={{ backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 10 }}
            >
              <Text style={{ fontWeight: 'bold' }}>{t.description}</Text>
              <Text style={{ color: t.type === 'income' ? 'green' : 'red' }}>
              Ksh {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}
              </Text>
              <Text style={{ color: '#666' }}>{new Date(t.created_at).toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 15 }}>
            <Text>No recent transactions</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
