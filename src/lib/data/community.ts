// src/lib/data/community.ts
import { CURRENT_USER } from './mock-user';

export interface Post {
  id: string;
  author: string;
  authorAvatar?: string;
  authorAvatarType?: 'niqab' | 'hijab' | 'male';
  role?: string;
  content: string;
  contentAr?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  likes: string[];
  comments: Comment[];
  timeAgo: string;
  timeAgoAr?: string;
}

export interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  authorAvatarType?: 'niqab' | 'hijab' | 'male';
  text: string;
  textAr?: string;
  timeAgo?: string;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  author: string;
  authorAvatar?: string;
  authorAvatarType?: 'niqab' | 'hijab' | 'male';
  text: string;
  textAr?: string;
}

export const POSTS: Post[] = [
  {
    id: '1',
    author: CURRENT_USER.name,
    authorAvatarType: CURRENT_USER.avatarType,
    role: 'CS · Cloud Architecture & Software Engineering',
    content:
      'Just deployed our 11-member Mega Project pipeline integrating IoT telemetry with an ERP back-office and Flutter mobile app! Huge thanks to Dr. Romany and Dr. Radwa for their continuous guidance. Teamwork really makes the dream work! 🚀',
    contentAr:
      'الحمد لله خلصنا رفع بايبلاين المشروع الكبير (تيم من 11 عضو) اللي بيربط حساسات الـ IoT مع سيستم الـ ERP وتطبيق فلاتر للموبايل! شكراً جداً لدكتور روماني ودكتورة رضوى على متابعتهم وتشجيعهم المستمر لينا. الشغل كفريق بيفرق جداً بجد! 🚀',
    mediaType: 'image',
    mediaUrl: '/assets/illustrations/feature_practical.jpg',
    likes: ['Mohamed hamada', 'basmalha Ibrahim', 'Raneem Yasser', 'Dooa Abd-elftah'],
    comments: [
      {
        id: 'c1',
        author: 'Mohamed hamada',
        authorAvatarType: 'male',
        text: 'The MQTT sensor bridge is running super smoothly. Proud of our squad!',
        textAr: 'حساسات الـ MQTT شغالة زي الفل وبتبعت الداتا بأعلى كفاءة. فخور بتيمنا والله!',
        replies: [
          {
            id: 'r1',
            author: CURRENT_USER.name,
            authorAvatarType: CURRENT_USER.avatarType,
            text: "You nailed the hardware integration, Mohamed! Couldn't have done it without you.",
            textAr: 'تسلم إيدك يا محمد، إنت ظبطت الهاردوير ع الفرازة!',
          },
        ],
      },
      {
        id: 'c2',
        author: 'basmalha Ibrahim',
        authorAvatarType: 'hijab',
        text: 'The Power BI executive summary dashboard is ready for our presentation!',
        textAr: 'داشبورد الـ Power BI للملخص التنفيذي جهز خلاص للعرض!',
      },
    ],
    timeAgo: '2 hours ago',
    timeAgoAr: 'من ساعتين',
  },
  {
    id: '2',
    author: 'Dooa Abd-elftah',
    authorAvatarType: 'hijab',
    role: 'BIS · Systems Analysis',
    content:
      'Finished modeling the business workflow diagrams for the Supply Chain Case. Any peers free today to review the BPMN notation together?',
    contentAr:
      'خلصت نمذجة مخططات البيزنس لمشروع سلاسل الإمداد. فيه حد من زمايلي فاضي النهاردة نراجع مع بعض الـ BPMN؟',
    likes: ['Nada Elsayed', 'Rania Khaled'],
    comments: [
      {
        id: 'c3',
        author: 'Rania Khaled',
        authorAvatarType: 'hijab',
        text: 'I can review it with you around 4 PM in the study room!',
        textAr: 'أنا فاضية أراجع معاكي الساعة 4 في قاعة المذاكرة!',
      },
    ],
    timeAgo: '4 hours ago',
    timeAgoAr: 'من 4 ساعات',
  },
];

export const MY_COMMUNITIES = [
  { id: '1', name: 'Raneem Yasser', avatarType: 'hijab' as const },
  { id: '2', name: 'Rania Khaled', avatarType: 'hijab' as const },
  { id: '3', name: 'basmalha Ibrahim', avatarType: 'hijab' as const },
  { id: '4', name: 'Malak Mahmouad', avatarType: 'hijab' as const },
  { id: '5', name: 'Mohamed hamada', avatarType: 'male' as const },
];

export const COMMUNITY_GROUPS = [
  { id: 'all', label: 'All Community', labelAr: 'كل المجتمع', icon: '🏠' },
  { id: 'bis', label: 'BIS Hub', labelAr: 'هاب نظم BIS', icon: '📚' },
  { id: 'cs', label: 'CS Hub', labelAr: 'هاب علوم حاسب CS', icon: '💻' },
  { id: 'business', label: 'Accounting Hub', labelAr: 'هاب المحاسبة', icon: '💼' },
];

export const PEOPLE_YOU_MAY_KNOW = [
  { id: 'p-1', name: 'Shahd Khamees', role: 'Auditing & Compliance Student', roleAr: 'طالبة مراجعة وحوكمة', avatarType: 'hijab' as const },
  { id: 'p-2', name: 'Rahma', role: 'Mobile App Developer (Flutter)', roleAr: 'مطورة تطبيقات موبايل فلاتر', avatarType: 'hijab' as const },
  { id: 'p-3', name: 'Nada Elsayed', role: 'ERP Systems & Odoo Specialist', roleAr: 'أخصائية نظم ERP وأودو', avatarType: 'hijab' as const },
  { id: 'p-4', name: 'Shahd Mohamed', role: 'Cloud Security & Networking', roleAr: 'أمن سحابي وشبكات', avatarType: 'hijab' as const },
];

export const MOCK_POSTS = POSTS;