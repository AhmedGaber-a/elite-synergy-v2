// src/lib/data/notifications.ts

export type NotificationCategory = 'practical' | 'peers' | 'community'

export interface Notification {
  id: string
  sender: string
  category: NotificationCategory
  type: 'project' | 'review' | 'team_invite' | 'friend_request' | 'skill_swap' | 'community_post' | 'hub_invite'
  message: string
  messageAr?: string
  timeAgo: string
  timeAgoAr?: string
  avatar?: string
  avatarType?: 'niqab' | 'hijab' | 'male'
  unread?: boolean
  actionUrl?: string
}

export const NOTIFICATIONS: Notification[] = [
  // Practical Category
  {
    id: 'pr-1',
    sender: 'Dr. Romany',
    category: 'practical',
    type: 'review',
    message: 'Graded your Mega Project architecture: Excellent grade A+ (98%)!',
    messageAr: 'صحح تسليم هيكل المشروع الكبير: ممتاز جداً بتقدير امتياز A+ (98%)!',
    timeAgo: '15 mins ago',
    timeAgoAr: 'من ربع ساعة',
    avatarType: 'male',
    unread: true,
    actionUrl: '/practical/team/mega-iot-erp-flutter',
  },
  {
    id: 'pr-2',
    sender: 'الفراعنة (Team Alpha)',
    category: 'practical',
    type: 'team_invite',
    message: 'Invited you to take the IoT & Cloud Lead role in the 11-member Mega Project squad.',
    messageAr: 'بعتولك دعوة تمسك دور ليد الكلاود والـ IoT في تيم المشروع الكبير (11 عضو).',
    timeAgo: '1 hour ago',
    timeAgoAr: 'من ساعة',
    avatarType: 'hijab',
    unread: true,
    actionUrl: '/practical/team/mega-iot-erp-flutter',
  },
  {
    id: 'pr-3',
    sender: 'Dr. Hadeer',
    category: 'practical',
    type: 'project',
    message: 'Approved your solo practical case solution. 450 points added to your balance!',
    messageAr: 'اعتمدت حلك للكيس العملي الفردي، ونزل في رصيدك 450 نقطة!',
    timeAgo: '3 hours ago',
    timeAgoAr: 'من 3 ساعات',
    avatarType: 'hijab',
    unread: false,
    actionUrl: '/practical/solo',
  },
  {
    id: 'pr-4',
    sender: 'Dr. Radwa',
    category: 'practical',
    type: 'project',
    message: 'Posted new guidelines for the Financial Feasibility deliverables.',
    messageAr: 'نزلت تعليمات وملاحظات جديدة لتسليم دراسة الجدوى المالية.',
    timeAgo: 'Yesterday',
    timeAgoAr: 'إمبارح',
    avatarType: 'hijab',
    unread: false,
    actionUrl: '/practical/team',
  },

  // Peers Category
  {
    id: 'pe-1',
    sender: 'basmalha Ibrahim',
    category: 'peers',
    type: 'friend_request',
    message: 'Sent you a peer connection request for Power BI & Data Science collaboration.',
    messageAr: 'بعتتلك طلب إضافة عشان تذاكروا سوا Power BI وتحليل بيانات.',
    timeAgo: '20 mins ago',
    timeAgoAr: 'من 20 دقيقة',
    avatarType: 'hijab',
    unread: true,
    actionUrl: '/peers',
  },
  {
    id: 'pe-2',
    sender: 'Mohamed hamada',
    category: 'peers',
    type: 'skill_swap',
    message: 'Proposed a skill swap: He will teach you Arduino / IoT hardware, you teach Cloud.',
    messageAr: 'مقترح تبادل مهارات: يعلمك هاردوير الأردوينو والـ IoT وتعلّمه كلاود.',
    timeAgo: '45 mins ago',
    timeAgoAr: 'من 45 دقيقة',
    avatarType: 'male',
    unread: true,
    actionUrl: '/messages',
  },
  {
    id: 'pe-3',
    sender: 'Raneem Yasser',
    category: 'peers',
    type: 'friend_request',
    message: 'Accepted your peer connection! Start a chat to coordinate projects.',
    messageAr: 'وافقت على طلب التواصل! تقدر تبدأ شات معاها دلوقتي عشان تنسقوا مشاريع.',
    timeAgo: '2 hours ago',
    timeAgoAr: 'من ساعتين',
    avatarType: 'hijab',
    unread: false,
    actionUrl: '/messages',
  },
  {
    id: 'pe-4',
    sender: 'Dooa Abd-elftah',
    category: 'peers',
    type: 'friend_request',
    message: 'Shared a UML case template from BIS department with you.',
    messageAr: 'شاركت معاك تمبلت لمشروع الـ UML ونظم المعلومات بقسم الـ BIS.',
    timeAgo: 'Yesterday',
    timeAgoAr: 'إمبارح',
    avatarType: 'hijab',
    unread: false,
    actionUrl: '/peers',
  },

  // Community Category
  {
    id: 'co-1',
    sender: 'BIS Hub',
    category: 'community',
    type: 'hub_invite',
    message: 'New trending discussion: "Best ERP architecture practices for Egyptian start-ups".',
    messageAr: 'مناقشة جديدة قالعة نار في الهاب: "أحسن ممارسات هيكلة الـ ERP للشركات المصرية الناشئة".',
    timeAgo: '30 mins ago',
    timeAgoAr: 'من نص ساعة',
    avatarType: 'hijab',
    unread: true,
    actionUrl: '/community',
  },
  {
    id: 'co-2',
    sender: 'Computer Science Hub',
    category: 'community',
    type: 'community_post',
    message: 'Dr. Romany announced the Annual Hackathon: Registration is now open for all students!',
    messageAr: 'د. روماني أعلن عن الهاكاثون السنوي: التسجيل فتح رسمي لكل الطلاب!',
    timeAgo: '4 hours ago',
    timeAgoAr: 'من 4 ساعات',
    avatarType: 'male',
    unread: false,
    actionUrl: '/community',
  },
  {
    id: 'co-3',
    sender: 'Shahd Khamees',
    category: 'community',
    type: 'community_post',
    message: 'Commented on your post: "Great insights on cloud cost optimization!"',
    messageAr: 'علقت على بوستك: "عاش بجد، شرح مفيد جداً لطرق توفير تكاليف الكلاود!"',
    timeAgo: '5 hours ago',
    timeAgoAr: 'من 5 ساعات',
    avatarType: 'hijab',
    unread: false,
    actionUrl: '/community',
  },
  {
    id: 'co-4',
    sender: 'Malak Mahmouad',
    category: 'community',
    type: 'community_post',
    message: 'Liked your project presentation in the Financial Feasibility forum.',
    messageAr: 'عملت إعجاب لعرض مشروعك في منتدى دراسات الجدوى المالية.',
    timeAgo: 'Yesterday',
    timeAgoAr: 'إمبارح',
    avatarType: 'hijab',
    unread: false,
    actionUrl: '/community',
  },
]
