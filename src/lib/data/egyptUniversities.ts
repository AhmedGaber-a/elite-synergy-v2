// src/lib/data/egyptUniversities.ts
// Egyptian universities offered at registration. Students can also type a name that is not listed.
// Source: public list of Egyptian universities (Wikipedia), plus government universities it omits.

export const EGYPT_UNIVERSITY_GROUPS = [
  {
    key: 'GOV',
    label: 'Governmental (حكومية)',
    items: [
      'Ain Shams University', 'Al-Azhar University', 'Alexandria University', 'Aswan University',
      'Assiut University', 'Banha University', 'Beni-Suef University', 'Cairo University',
      'Damanhour University', 'Damietta University', 'Fayoum University', 'Helwan University',
      'Kafrelsheikh University', 'Luxor University', 'Mansoura University', 'Matrouh University',
      'Minia University', 'Menoufia University', 'New Valley University', 'Port Said University',
      'Sohag University', 'South Valley University', 'Suez Canal University', 'Suez University',
      'Tanta University', 'University of Sadat City', 'Zagazig University', 'Arish University',
      'Military Technical College', 'Sadat Academy for Management Sciences', 'Capital University',
    ],
  },
  {
    key: 'NATIONAL',
    label: 'National (أهلية)',
    items: [
      'Ain Shams National University', 'Alexandria National University', 'Assiut National University',
      'Benha National University', 'Beni Suef National University', 'Cairo National University',
      'Damanhour National University', 'Damietta National University', 'East Port Said National University',
      'Fayoum National University', 'Helwan National University', 'Kafrelsheikh National University',
      'Luxor National University', 'Mansoura National University', 'Menoufia National University',
      'Minya National University', 'National University of Sadat City', 'New Valley National University',
      'New Ismailia National University', 'Sohag National University', 'South Valley National University',
      'Suez National University', 'Tanta National University', 'Zagazig National University',
    ],
  },
  {
    key: 'PRIVATE',
    label: 'Private (خاصة)',
    items: [
      'Ahram Canadian University', 'Al Hayah University in Cairo', 'Al Ryada University for Science and Technology',
      'Al Salam University in Egypt', 'Arab Academy for Science, Technology and Maritime Transport',
      'Arab Open University', 'Badr University in Cairo', 'Badr University in Assiut', 'Badya University',
      'British University in Egypt', 'Canadian International College', 'City University of Cairo',
      'Delta University for Science and Technology', 'Deraya University in Minya', 'Egyptian Chinese University',
      'Egyptian Russian University', 'El Saleheya El Gadida University', 'El Sewedy University of Technology',
      'El Shorouk Academy', 'European Universities in Egypt', 'French University of Egypt', 'Future University in Egypt',
      'German International University', 'German University in Cairo', 'Heliopolis University',
      'Hertfordshire University in Egypt', 'Horus University', 'Innovation University', 'Lotus University in Minya',
      'May University in Cairo', 'Memphis University', 'Merit University', 'Misr International University',
      'Misr University for Science and Technology', 'Modern Sciences and Arts University',
      'Modern University for Technology and Information', 'Nahda University', 'Newgiza University',
      'Nile Valley University', 'October 6 University', 'Pharos University in Alexandria', 'Rashid University',
      'Saxony Egypt University', 'Sinai University', 'Sphinx University', 'The American University in Cairo',
      'Toronto Metropolitan University Cairo', 'University of Prince Edward Island', 'ESLSCA University',
    ],
  },
  {
    key: 'INTERNATIONAL',
    label: 'International & Research (دولية وبحثية)',
    items: [
      'Alamein International University', 'Egypt-Japan University of Science and Technology',
      'Egypt University of Informatics', 'Galala University', 'King Salman International University',
      'New Mansoura University', 'Nile University', 'The Egyptian E-learning University',
      'Zewail City of Science, Technology and Innovation',
    ],
  },
] as const;

export const OTHER_UNIVERSITY = 'OTHER';
