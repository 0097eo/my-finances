import { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, Modal, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/components/AuthContext';
import { API_URL } from '@/constants/api';

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  created_at: string;
};

type BudgetCategory = {
  id: number;
  name: string;
};

type Budget = {
  id: number;
  name: string;
  categories: BudgetCategory[];
};

export default function Transactions() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    budget_category_id: '' as string,
  });

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, [token]); // Re-fetch when token changes

  const fetchTransactions = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.error || 'Failed to fetch transactions.');
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/budgets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.error || 'Failed to fetch budgets.');
      }
    } catch (error) {
      console.error('Fetch budgets error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const addTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.type || !newTransaction.budget_category_id) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    setLoading(true);
    try {
      const newTrans = {
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type,
        budget_category_id: parseInt(newTransaction.budget_category_id),
      };

      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTrans),
      });

      const data = await response.json();

      if (response.status === 201) {
        // Clear form
        setNewTransaction({
          description: '',
          amount: '',
          type: 'income',
          budget_category_id: '',
        });
        
        // Refresh transactions list
        await fetchTransactions();
        
        // Close modal
        setShowAddModal(false);
        Alert.alert('Success', 'Transaction added successfully');
      } else {
        Alert.alert('Error', data.error || 'Failed to add transaction');
      }
    } catch (error) {
      console.error('Add transaction error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async () => {
    if (!token) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    if (transactionToDelete) {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/transactions/${transactionToDelete}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setTransactions((prev) => prev.filter((t) => t.id !== transactionToDelete));
          setShowDeleteModal(false);
          Alert.alert('Success', 'Transaction deleted successfully');
        } else {
          const error = await response.json();
          Alert.alert('Error', error.error || 'Failed to delete transaction.');
        }
      } catch (error) {
        console.error('Delete transaction error:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={styles.transactionCard}
      onLongPress={() => {
        setTransactionToDelete(item.id);
        setShowDeleteModal(true);
      }}
    >
      <Text style={styles.transactionDescription}>{item.description}</Text>
      <Text style={[
        styles.transactionAmount,
        { color: item.type === 'income' ? '#28a745' : '#dc3545' }
      ]}>
        Ksh {item.type === 'income' ? '+' : '-'}{item.amount.toFixed(2)}
      </Text>
      <Text style={styles.transactionDate}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.addButton, loading && styles.disabledButton]} 
        onPress={() => setShowAddModal(true)}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Add Transaction</Text>
      </TouchableOpacity>

      {loading && !showAddModal && !showDeleteModal ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f4511e" />
        </View>
      ) : transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No transactions yet
          </Text>
        </View>
      )}

      {/* Add Transaction Modal */}
      <Modal
        visible={showAddModal}
        onRequestClose={() => !loading && setShowAddModal(false)}
        animationType="slide"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Transaction</Text>
          <TextInput
            placeholder="Description"
            value={newTransaction.description}
            onChangeText={(text) => setNewTransaction((prev) => ({ ...prev, description: text }))}
            style={styles.input}
            editable={!loading}
          />
          <TextInput
            placeholder="Amount"
            value={newTransaction.amount}
            onChangeText={(text) => setNewTransaction((prev) => ({ ...prev, amount: text }))}
            style={styles.input}
            keyboardType="numeric"
            editable={!loading}
          />
          <Picker
            selectedValue={newTransaction.budget_category_id}
            onValueChange={(itemValue) => setNewTransaction((prev) => ({ ...prev, budget_category_id: itemValue }))}
            style={styles.input}
            enabled={!loading}
          >
            <Picker.Item label="Select a category" value="" />
            {budgets.map((budget) =>
              budget.categories.map((category) => (
                <Picker.Item key={category.id} label={category.name} value={category.id.toString()} />
              ))
            )}
          </Picker>
          <View style={styles.transactionTypeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newTransaction.type === 'income' && styles.selectedIncomeButton,
                loading && styles.disabledButton
              ]}
              onPress={() => setNewTransaction((prev) => ({ ...prev, type: 'income' }))}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newTransaction.type === 'expense' && styles.selectedExpenseButton,
                loading && styles.disabledButton
              ]}
              onPress={() => setNewTransaction((prev) => ({ ...prev, type: 'expense' }))}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Expense</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, loading && styles.disabledButton]} 
              onPress={addTransaction}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, loading && styles.disabledButton]} 
              onPress={() => setShowAddModal(false)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Transaction Modal */}
      <Modal
        visible={showDeleteModal}
        onRequestClose={() => !loading && setShowDeleteModal(false)}
        animationType="fade"
        transparent
      >
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.modalTitle}>Delete Transaction</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this transaction?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.deleteButton, loading && styles.disabledButton]} 
                onPress={deleteTransaction}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, loading && styles.disabledButton]} 
                onPress={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  deleteModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  deleteModalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  transactionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#f4511e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  typeButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  selectedIncomeButton: {
    backgroundColor: '#28a745',
  },
  selectedExpenseButton: {
    backgroundColor: '#dc3545',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  }
});