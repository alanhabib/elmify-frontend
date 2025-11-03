import { useRouter } from 'expo-router';
import { usePlayer } from '@/providers/PlayerProvider';
import type { UILecture } from '@/types/ui';

/**
 * Hook to handle playing lectures across the app
 * Centralizes the logic for setting lecture and navigating to player
 *
 * Usage:
 * const playLecture = useLecturePlayer();
 * playLecture({ id: '1', title: 'Lecture', speaker: 'Speaker', ... });
 */
export function useLecturePlayer() {
  const router = useRouter();
  const { setLecture } = usePlayer();

  return (lecture: UILecture | Omit<UILecture, 'audio_url'>) => {
    // Ensure audio_url exists (will be fetched from MinIO if empty)
    const fullLecture: UILecture = {
      audio_url: '',
      ...lecture,
    };

    setLecture(fullLecture);
    router.push('/player');
  };
}
