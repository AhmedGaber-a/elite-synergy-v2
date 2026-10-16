// src/lib/data/messages.ts

export interface Message {
  id: string
  text: string
  sender: 'me' | 'them'
  senderName: string
  senderRole: string
  timestamp: string
}

export interface Conversation {
  id: string
  name: string
  role: string
  avatar?: string
  avatarType?: 'niqab' | 'hijab' | 'male'
  lastMessage: string
  time: string
  unread: number
  isOnline: boolean
  isGroup: boolean
  messages: Message[]
  contextType?: 'peer' | 'project'
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Mohamed hamada',
    role: 'IoT & Embedded Systems',
    avatarType: 'male',
    lastMessage: 'All set! The MQTT bridge is transmitting data to our server.',
    time: '10:41 AM',
    unread: 1,
    isOnline: true,
    isGroup: false,
    messages: [
      { id: 'm1', text: 'Hey Mohamed! Did you calibrate the sensor thresholds for the Mega Project?', sender: 'me', senderName: 'Mariem ahmed', senderRole: 'Cloud Architect', timestamp: '10:32 AM' },
      { id: 'm2', text: 'Yes, I finished testing them on Arduino and pushed the topic definitions.', sender: 'them', senderName: 'Mohamed hamada', senderRole: 'IoT Engineer', timestamp: '10:35 AM' },
      { id: 'm3', text: 'Awesome! I will connect our backend endpoint to read from those topics.', sender: 'me', senderName: 'Mariem ahmed', senderRole: 'Cloud Architect', timestamp: '10:38 AM' },
      { id: 'm4', text: 'All set! The MQTT bridge is transmitting data to our server.', sender: 'them', senderName: 'Mohamed hamada', senderRole: 'IoT Engineer', timestamp: '10:41 AM' },
    ],
  },
  {
    id: '2',
    name: 'basmalha Ibrahim',
    role: 'BI & Data Analytics',
    avatarType: 'hijab',
    lastMessage: 'I reviewed the charts, they look great!',
    time: 'Yesterday',
    unread: 0,
    isOnline: true,
    isGroup: false,
    messages: [
      { id: 'm1', text: 'Hey Basmalha, could you check the Power BI report schema?', sender: 'me', senderName: 'Mariem ahmed', senderRole: 'Cloud Architect', timestamp: 'Yesterday' },
      { id: 'm2', text: 'I reviewed the charts, they look great!', sender: 'them', senderName: 'basmalha Ibrahim', senderRole: 'Data Analyst', timestamp: 'Yesterday' },
    ],
  },
  {
    id: '3',
    name: 'Team Alpha (الفراعنة) — Mega Squad',
    role: '11 Members · Mega Project',
    avatarType: 'hijab',
    lastMessage: 'Dr. Romany meeting scheduled for tomorrow at 3 PM',
    time: 'Yesterday',
    unread: 3,
    isOnline: true,
    isGroup: true,
    messages: [
      { id: 'm1', text: 'Dr. Romany meeting scheduled for tomorrow at 3 PM', sender: 'them', senderName: 'Raneem Yasser', senderRole: 'Frontend Lead', timestamp: 'Yesterday' },
    ],
  },
  {
    id: '4',
    name: 'Rahma',
    role: 'Flutter Mobile Developer',
    avatarType: 'hijab',
    lastMessage: 'The Flutter UI is connected to the API gateway now.',
    time: 'Tuesday',
    unread: 0,
    isOnline: false,
    isGroup: false,
    messages: [
      { id: 'm1', text: 'The Flutter UI is connected to the API gateway now.', sender: 'them', senderName: 'Rahma', senderRole: 'Mobile Dev', timestamp: 'Tuesday' },
    ],
  },
]
