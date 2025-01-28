import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, StyleSheet, Dimensions } from 'react-native';
import { useAuth } from '@/components/AuthContext';
import { API_URL } from '@/constants/api';


type Category = {
  id?: number;
  name: string;
  allocated_amount: number;
  color: string;
};

type Budget = {
  id: number;
  name: string;
  amount: number;
  month: string;
  categories: Category[];
};

export default function Budget() {
  const { token } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    month: '',
    categories: [{ name: '', allocated_amount: 0, color: '#000000' }]
  });

 
  const fetchBudgets = async () => {
    try {
      const response = await fetch(`${API_URL}/budgets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch budgets');
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

 
  const createBudget = async () => {
    try {
      const response = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      if (response.ok) {
        fetchBudgets();
        setModalVisible(false);
        resetForm();
      } else {
        throw new Error('Failed to create budget');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create budget');
    }
  };

  
  const updateBudget = async () => {
    if (!editingBudget) return;

    try {
      const response = await fetch(`${API_URL}/budgets/${editingBudget.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      });

      if (response.ok) {
        fetchBudgets();
        setModalVisible(false);
        setEditingBudget(null);
        resetForm();
      } else {
        throw new Error('Failed to update budget');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update budget');
    }
  };

  
  const deleteBudget = async (budgetId: number) => {
    try {
      const response = await fetch(`${API_URL}/budgets/${budgetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchBudgets();
      } else {
        throw new Error('Failed to delete budget');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete budget');
    }
  };

  
  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      month: '',
      categories: [{ name: '', allocated_amount: 0, color: '#000000' }]
    });
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      amount: budget.amount.toString(),
      month: budget.month,
      categories: budget.categories
    });
    setModalVisible(true);
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, { name: '', allocated_amount: 0, color: '#000000' }]
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Add Budget Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Add New Budget</Text>
        </TouchableOpacity>

        {/* Budgets List */}
        {budgets.map((budget) => (
          <View key={budget.id} style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <Text style={styles.budgetName}>{budget.name}</Text>
              <Text style={styles.budgetAmount}>
                Ksh {budget.amount.toLocaleString()}
              </Text>
            </View>
            
            <Text style={styles.monthText}>Month: {budget.month}</Text>
            
            {/* Categories */}
            {budget.categories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <Text>{category.name}: Ksh {category.allocated_amount.toLocaleString()}</Text>
              </View>
            ))}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEdit(budget)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteBudget(budget.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Form Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.modalScrollView}>
                <View style={styles.modalContent}>
                  <TextInput
                    style={styles.input}
                    placeholder="Budget Name"
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Amount"
                    value={formData.amount}
                    keyboardType="numeric"
                    onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Month (YYYY-MM)"
                    value={formData.month}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, month: text }))}
                  />

                  {/* Categories */}
                  <Text style={styles.categoryHeader}>Categories</Text>
                  {formData.categories.map((category, index) => (
                    <View key={index} style={styles.categoryForm}>
                      <TextInput
                        style={styles.input}
                        placeholder="Category Name"
                        value={category.name}
                        onChangeText={(text) => {
                          const newCategories = [...formData.categories];
                          newCategories[index].name = text;
                          setFormData(prev => ({ ...prev, categories: newCategories }));
                        }}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Allocated Amount"
                        value={category.allocated_amount.toString()}
                        keyboardType="numeric"
                        onChangeText={(text) => {
                          const newCategories = [...formData.categories];
                          newCategories[index].allocated_amount = parseFloat(text) || 0;
                          setFormData(prev => ({ ...prev, categories: newCategories }));
                        }}
                      />
                    </View>
                  ))}

                  <TouchableOpacity 
                    style={styles.addCategoryButton}
                    onPress={addCategory}
                  >
                    <Text style={styles.addCategoryText}>Add Category</Text>
                  </TouchableOpacity>

                  {/* Submit Button */}
                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={editingBudget ? updateBudget : createBudget}
                  >
                    <Text style={styles.buttonText}>
                      {editingBudget ? 'Update' : 'Create'} Budget
                    </Text>
                  </TouchableOpacity>

                  {/* Cancel Button */}
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => {
                      setModalVisible(false);
                      setEditingBudget(null);
                      resetForm();
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  addButton: {
    backgroundColor: '#f4511e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  budgetCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetAmount: {
    fontSize: 18,
    color: '#4CAF50',
  },
  monthText: {
    color: '#666',
    marginBottom: 8,
  },
  categoryItem: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#f4511e',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 20,
  },
  modalScrollView: {
    flexGrow: 1,
  },
  modalContent: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  categoryHeader: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryForm: {
    marginBottom: 16,
  },
  addCategoryButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  addCategoryText: {
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#f4511e',
    padding: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  cancelButton: {
    backgroundColor: '#757575',
    padding: 16,
    borderRadius: 4,
  },
  budgetName: {
    fontWeight: 'bold',
    fontSize: 15,
  }
});