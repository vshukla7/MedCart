import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export const PharmacistChatScreen = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', sender: 'pharmacist', text: 'Hello! I am Dr. Sharma, your MedCart Pharmacist 👨‍⚕️. How can I assist you with your medicines today?' },
    { id: '2', sender: 'user', text: 'Hi Dr. Sharma, is Paracetamol 650mg safe to take after lunch?' },
    { id: '3', sender: 'pharmacist', text: 'Yes, Paracetamol 650mg is generally recommended after meals to prevent gastric irritation. Drink plenty of water as well!' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now().toString(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    const textCopy = inputText;
    setInputText('');

    // Simulated Pharmacist Reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'pharmacist',
          text: `Thank you for asking! Regarding "${textCopy}", our pharmacy team recommends consulting your prescription details or reaching out via WhatsApp for direct verification.`
        }
      ]);
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: theme.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={styles.pharmacistAvatar}>
              <Text style={styles.avatarEmoji}>👨‍⚕️</Text>
            </View>
            <View>
              <Text style={[styles.pharmacistName, { color: theme.textPrimary }]}>Dr. Sharma, PharmD</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online • Official MedCart Pharmacist</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.messagesList} showsVerticalScrollIndicator={false}>
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <View 
                key={msg.id} 
                style={[
                  styles.msgBubble,
                  isUser ? styles.userBubble : [styles.pharmacistBubble, { backgroundColor: theme.card, borderColor: theme.border }]
                ]}
              >
                <Text style={[styles.msgText, { color: isUser ? '#FFFFFF' : theme.textPrimary }]}>
                  {msg.text}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.inputBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.textPrimary }]}
            placeholder="Ask pharmacist a question..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, { opacity: inputText.trim() ? 1 : 0.6 }]} 
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12
  },
  backBtn: {
    padding: 4
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  pharmacistAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarEmoji: {
    fontSize: 22
  },
  pharmacistName: {
    fontSize: 16,
    fontWeight: '800'
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E'
  },
  onlineText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600'
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12
  },
  msgBubble: {
    maxWidth: '82%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#22C55E',
    borderBottomRightRadius: 4
  },
  pharmacistBubble: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderBottomLeftRadius: 4
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 46,
    fontSize: 14
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
