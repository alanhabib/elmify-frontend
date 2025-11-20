/**
 * LectureListWithProgress Component
 * Reusable lecture list with progress bars and play/pause buttons
 * Used in Collection and Library screens
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePlayer } from '@/providers/PlayerProvider';
import { usePlaybackPosition } from '@/queries/hooks/playback';
import { DownloadButton } from '@/components/ui/DownloadButton';

export interface LectureWithProgress {
  id: number | string;
  title: string;
  description?: string;
  duration?: number; // in seconds
  progress?: number; // percentage (0-100)
  speakerName?: string;
  thumbnailUrl?: string;
  filePath?: string;
  audio_url?: string;
  author?: string;
  speaker?: string;
  lectureNumber?: number;
}

interface LectureItemProps {
  lecture: LectureWithProgress;
  allLectures: LectureWithProgress[];
  collectionSpeakerName?: string;
  collectionCoverUrl?: string;
}

const LectureItem: React.FC<LectureItemProps> = React.memo(({ lecture, allLectures, collectionSpeakerName, collectionCoverUrl }) => {
  const router = useRouter();
  const { lecture: currentLecture, setLecture, addToQueue, play, pause, isPlaying, currentTime, duration } = usePlayer();

  // Fetch playback position for this lecture
  const { data: playbackPosition } = usePlaybackPosition(lecture.id.toString());

  // Check if this lecture is currently playing
  const isCurrentlyPlaying = currentLecture?.id === lecture.id.toString() && isPlaying;

  // Calculate progress percent - use live progress if playing, otherwise use saved
  const progressPercent = useMemo(() => {
    if (isCurrentlyPlaying && duration > 0) {
      return (currentTime / duration) * 100;
    }

    // Use playback position from API if available
    if (playbackPosition?.currentPosition && lecture.duration) {
      const currentPositionSeconds = playbackPosition.currentPosition / 1000;
      return Math.min((currentPositionSeconds / lecture.duration) * 100, 100);
    }

    // Fallback to lecture's own progress
    return lecture.progress || 0;
  }, [isCurrentlyPlaying, currentTime, duration, playbackPosition, lecture.duration, lecture.progress]);

  // Calculate remaining time
  const { displayMinutes, timeLabel } = useMemo(() => {
    const totalDuration = lecture.duration || 0;

    let currentPositionSeconds = 0;
    if (isCurrentlyPlaying && duration > 0) {
      currentPositionSeconds = currentTime;
    } else if (playbackPosition?.currentPosition) {
      currentPositionSeconds = playbackPosition.currentPosition / 1000;
    }

    const remainingSeconds = Math.max(0, totalDuration - currentPositionSeconds);
    const hasStarted = currentPositionSeconds > 0;

    const displayMins = hasStarted
      ? Math.ceil(remainingSeconds / 60)
      : Math.ceil(totalDuration / 60);

    const label = hasStarted
      ? `${displayMins} min left`
      : `${displayMins} min`;

    return { displayMinutes: displayMins, timeLabel: label };
  }, [isCurrentlyPlaying, currentTime, duration, playbackPosition, lecture.duration]);

  const handleLecturePress = () => {
    router.push(`/lecture/${lecture.id}`);
  };

  const handlePlayPause = async () => {
    const lectureFormat = {
      id: lecture.id.toString(),
      title: lecture.title,
      speaker: lecture.speakerName || collectionSpeakerName || '',
      author: lecture.speakerName || collectionSpeakerName || '',
      audio_url: '', // Will be fetched dynamically by PlayerProvider
      thumbnail_url: lecture.thumbnailUrl || collectionCoverUrl,
    };

    if (currentLecture?.id !== lectureFormat.id) {
      // Convert all lectures to queue format and set the queue
      const queueLectures = allLectures.map(l => ({
        id: l.id.toString(),
        title: l.title,
        speaker: l.speakerName || collectionSpeakerName || '',
        author: l.speakerName || collectionSpeakerName || '',
        audio_url: '', // Will be fetched dynamically
        thumbnail_url: l.thumbnailUrl || collectionCoverUrl,
      }));

      // Set the queue with all lectures from this collection
      addToQueue(queueLectures);

      // Start playing the selected lecture
      setLecture(lectureFormat);
    } else {
      if (isPlaying) {
        await pause();
      } else {
        await play();
      }
    }
  };

  return (
    <Pressable
      key={lecture.id}
      onPress={handleLecturePress}
      className="mb-3 active:opacity-70"
    >
      <View className="flex-row items-center p-4 bg-card rounded-lg">
        {/* Lecture Info */}
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-foreground mb-1" numberOfLines={2}>
            {lecture.title}
          </Text>
          {lecture.description ? (
            <Text className="text-sm text-muted-foreground mb-2" numberOfLines={1}>
              {lecture.description}
            </Text>
          ) : null}

          <View className="flex-row items-center gap-2">
            {/* Progress Bar - 1/3 width */}
            <View className="h-1 bg-muted rounded-full overflow-hidden flex-1 max-w-[33%]">
              <View
                className="h-full bg-primary"
                style={{ width: `${progressPercent}%` }}
              />
            </View>

            {/* Time remaining/total */}
            <Text className="text-xs text-muted-foreground">
              {timeLabel}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row items-center gap-2 flex-shrink-0">
          {/* Download Button */}
          <DownloadButton
            lecture={{
              id: lecture.id.toString(),
              title: lecture.title,
              author: lecture.speakerName || collectionSpeakerName || '',
              audio_url: lecture.audio_url || '', // DownloadService will fetch presigned URL
              thumbnail_url: lecture.thumbnailUrl || collectionCoverUrl,
              duration: lecture.duration,
            }}
            size="small"
            variant="icon"
          />

          {/* Play/Pause Button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            className="w-10 h-10 rounded-full bg-primary items-center justify-center"
          >
            {isCurrentlyPlaying ? (
              <Ionicons name="pause" size={20} color="black" />
            ) : (
              <Ionicons name="play" size={20} color="black" style={{ marginLeft: 2 }} />
            )}
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

LectureItem.displayName = 'LectureItem';

interface LectureListWithProgressProps {
  lectures: LectureWithProgress[];
  emptyMessage?: string;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
  showHeader?: boolean;
  collectionSpeakerName?: string;
  collectionCoverUrl?: string;
}

export const LectureListWithProgress: React.FC<LectureListWithProgressProps> = ({
  lectures,
  emptyMessage = 'No lectures available',
  emptyIcon = 'musical-notes-outline',
  showHeader = true,
  collectionSpeakerName,
  collectionCoverUrl,
}) => {
  // Sort lectures by lectureNumber (or title as fallback)
  const sortedLectures = useMemo(() => {
    return [...lectures].sort((a, b) => {
      // Primary sort: by lectureNumber if available
      if (a.lectureNumber !== undefined && b.lectureNumber !== undefined) {
        return a.lectureNumber - b.lectureNumber;
      }
      // If only one has lectureNumber, it comes first
      if (a.lectureNumber !== undefined) return -1;
      if (b.lectureNumber !== undefined) return 1;
      // Fallback: sort by title
      return a.title.localeCompare(b.title);
    });
  }, [lectures]);

  if (sortedLectures.length === 0) {
    return (
      <View className="py-12 items-center">
        <Ionicons name={emptyIcon} size={48} color="#9ca3af" />
        <Text className="text-muted-foreground mt-4">{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View>
      {showHeader && (
        <Text className="text-xl font-bold text-foreground mb-4">
          Lectures ({sortedLectures.length})
        </Text>
      )}

      {sortedLectures.map((lecture) => (
        <LectureItem
          key={lecture.id}
          lecture={lecture}
          allLectures={sortedLectures}
          collectionSpeakerName={collectionSpeakerName}
          collectionCoverUrl={collectionCoverUrl}
        />
      ))}
    </View>
  );
};
