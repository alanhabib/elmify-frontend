import React from 'react';
import { View, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const islamicReminders = [
  {
    title: "Remember Allah Often",
    verse: "وَاذْكُرُوا اللَّهَ كَثِيرًا لَّعَلَّكُمْ تُفْلِحُونَ",
    translation: "And remember Allah often that you may succeed.",
    reference: "Quran 62:10"
  },
  {
    title: "Seek Forgiveness",
    verse: "وَاسْتَغْفِرُوا اللَّهَ إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ",
    translation: "And seek forgiveness of Allah. Indeed, Allah is Forgiving and Merciful.",
    reference: "Quran 73:20"
  },
  {
    title: "Be Patient",
    verse: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ",
    translation: "And be patient, and your patience is not but through Allah.",
    reference: "Quran 16:127"
  },
  {
    title: "Trust in Allah",
    verse: "وَعَلَى اللَّهِ فَتَوَكَّلُوا إِن كُنتُم مُّؤْمِنِينَ",
    translation: "And upon Allah rely, if you should be believers.",
    reference: "Quran 5:23"
  },
  {
    title: "Give Charity",
    verse: "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ",
    translation: "And establish prayer and give zakah.",
    reference: "Quran 2:43"
  }
];

export const WeeklyReminderCard = () => {
  // Get reminder based on current week number to rotate weekly
  const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const reminder = islamicReminders[currentWeek % islamicReminders.length];

  return (
    <View className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-6 mb-8">
      <View className="flex-row gap-4">
        {/* Icon */}
        <View className="flex-shrink-0">
          <View className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <AntDesign name="heart" size={24} color="white" />
          </View>
        </View>
        
        {/* Content */}
        <View className="flex-1 space-y-3">
          {/* Header */}
          <View className="flex-row items-center gap-2">
            <AntDesign name="calendar" size={16} color="#a855f7" />
            <Text className="text-sm text-purple-400 font-medium">Weekly Reminder</Text>
          </View>
          
          {/* Title */}
          <Text className="text-lg font-semibold text-white mb-2">
            {reminder.title}
          </Text>
          
          {/* Arabic Verse */}
          <Text className="text-right text-lg text-purple-200 font-arabic mb-2 leading-relaxed">
            {reminder.verse}
          </Text>
          
          {/* Translation */}
          <Text className="text-gray-300 italic mb-2">
            "{reminder.translation}"
          </Text>
          
          {/* Reference */}
          <Text className="text-sm text-purple-400">
            — {reminder.reference}
          </Text>
        </View>
      </View>
    </View>
  );
};