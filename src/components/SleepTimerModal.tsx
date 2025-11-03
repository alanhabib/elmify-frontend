import { Modal, View, Text, Pressable } from 'react-native';

const SLEEP_TIMER_PRESETS = [5, 10, 15, 30, 45, 60];

type SleepTimerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelectTimer: (minutes: number) => void;
  onCancelTimer: () => void;
  hasActiveTimer: boolean;
};

export function SleepTimerModal({
  visible,
  onClose,
  onSelectTimer,
  onCancelTimer,
  hasActiveTimer,
}: SleepTimerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className='flex-1 bg-black/70 justify-center items-center'
      >
        <Pressable onPress={(e) => e.stopPropagation()} className='bg-gray-800 rounded-xl p-6 w-80'>
          <Text className='text-white text-xl font-bold mb-4 text-center'>
            Sleep Timer
          </Text>

          <View className='gap-3'>
            {SLEEP_TIMER_PRESETS.map((minutes) => (
              <Pressable
                key={minutes}
                onPress={() => onSelectTimer(minutes)}
                className='bg-gray-700 px-6 py-4 rounded-lg active:bg-gray-600'
              >
                <Text className='text-white text-center text-lg font-semibold'>
                  {minutes} minutes
                </Text>
              </Pressable>
            ))}

            {hasActiveTimer && (
              <Pressable
                onPress={onCancelTimer}
                className='bg-red-600 px-6 py-4 rounded-lg active:bg-red-700 mt-2'
              >
                <Text className='text-white text-center text-lg font-semibold'>
                  Cancel Timer
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
