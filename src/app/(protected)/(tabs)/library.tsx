import React, { useState, useMemo } from "react";
import { Text, View, ScrollView, Pressable, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useFavorites } from "@/queries/hooks/favorites";
import { useDownloads } from "@/hooks/useDownload";
import { LectureListWithProgress, LectureWithProgress } from "@/components/lectures/LectureListWithProgress";
import { LectureGridView } from "@/components/library/LectureGridView";
import { SegmentedControl, SegmentOption } from "@/components/ui/SegmentedControl";
import { useContinueListening } from "@/queries/hooks/playback";
import { useGuestMode } from "@/hooks/useGuestMode";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

type ViewMode = 'list' | 'grid';
type SortOption = 'recent' | 'az' | 'speaker';
type TabOption = 'favorites' | 'downloaded' | 'history';

const TAB_OPTIONS: SegmentOption[] = [
  { value: 'favorites', label: 'Favorites' },
  { value: 'downloaded', label: 'Downloaded' },
  { value: 'history', label: 'History' },
];

export default function Library() {
  const { isSignedIn } = useAuth();
  const { disableGuestMode } = useGuestMode();
  const [selectedTab, setSelectedTab] = useState<TabOption>('favorites');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { data: favorites = [], isLoading, error } = useFavorites({ enabled: !!isSignedIn });
  const { downloads, isLoading: downloadsLoading, refreshDownloads } = useDownloads();
  const { data: continueListening = [] } = useContinueListening({ enabled: !!isSignedIn });

  // Guest mode - show sign in prompt
  if (!isSignedIn) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <View className="bg-card rounded-2xl p-8 items-center border border-border w-full max-w-sm">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
            <Feather name="book-open" size={40} color="#a855f7" />
          </View>
          <Text className="text-foreground text-2xl font-bold text-center mb-3">
            Sign In Required
          </Text>
          <Text className="text-muted-foreground text-center mb-8 leading-6">
            Create a free account to save favorites, track your downloads, and sync your listening history across devices.
          </Text>
          <TouchableOpacity
            onPress={() => {
              disableGuestMode();
              router.push('/sign-in');
            }}
            className="bg-primary w-full py-4 rounded-xl items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-primary-foreground font-semibold text-base">
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              disableGuestMode();
              router.push('/sign-up');
            }}
            className="w-full py-4 rounded-xl items-center border border-border"
            activeOpacity={0.8}
          >
            <Text className="text-foreground font-medium text-base">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Refresh downloads when switching to Downloaded tab
  React.useEffect(() => {
    if (selectedTab === 'downloaded') {
      refreshDownloads();
    }
  }, [selectedTab, refreshDownloads]);

  // Transform favorites to LectureWithProgress format
  const transformedFavorites: LectureWithProgress[] = useMemo(() => {
    return favorites.map((fav: any) => ({
      id: fav.lecture.id,
      title: fav.lecture.title || 'Untitled',
      description: fav.lecture.description,
      speakerName: fav.lecture.speakerName || fav.lecture.speaker || fav.lecture.author,
      thumbnailUrl: fav.lecture.thumbnailUrl || fav.lecture.thumbnail_url,
      filePath: fav.lecture.filePath,
      audio_url: '', // Will be fetched dynamically by PlayerProvider
      duration: fav.lecture.duration,
      progress: fav.lecture.progress || 0,
    }));
  }, [favorites]);

  // Transform downloads to LectureWithProgress format
  // Cross-reference with continueListening to get progress
  const transformedDownloads: LectureWithProgress[] = useMemo(() => {
    return downloads.map((download: any) => {
      // Find matching lecture in continueListening for progress
      const continueData = continueListening.find(
        (cl: any) => cl.lecture?.id?.toString() === download.lectureId
      );

      return {
        id: download.lectureId,
        title: download.title || 'Untitled',
        speakerName: download.speaker || 'Unknown Speaker',
        thumbnailUrl: download.thumbnail_url,
        filePath: download.filePath,
        audio_url: download.filePath, // Use local file path for downloaded lectures
        duration: download.duration || 0,
        progress: continueData?.currentPosition || 0,
      };
    });
  }, [downloads, continueListening]);

  // Sort lectures based on selected option
  const sortedFavorites = useMemo(() => {
    const lectures = [...transformedFavorites];

    switch (sortBy) {
      case 'az':
        return lectures.sort((a, b) => a.title.localeCompare(b.title));
      case 'speaker':
        return lectures.sort((a, b) =>
          (a.speakerName || '').localeCompare(b.speakerName || '')
        );
      case 'recent':
      default:
        return lectures; // Already in recent order from API
    }
  }, [transformedFavorites, sortBy]);

  const sortedDownloads = useMemo(() => {
    const lectures = [...transformedDownloads];

    switch (sortBy) {
      case 'az':
        return lectures.sort((a, b) => a.title.localeCompare(b.title));
      case 'speaker':
        return lectures.sort((a, b) =>
          (a.speakerName || '').localeCompare(b.speakerName || '')
        );
      case 'recent':
      default:
        return lectures; // Already in recent order (by download date)
    }
  }, [transformedDownloads, sortBy]);

  // Filter by selected tab
  const displayedLectures = useMemo(() => {
    switch (selectedTab) {
      case 'favorites':
        return sortedFavorites;
      case 'downloaded':
        return sortedDownloads;
      case 'history':
        // TODO: Filter for history when backend supports it
        return [];
      default:
        return sortedFavorites;
    }
  }, [selectedTab, sortedFavorites, sortedDownloads]);

  // Calculate loading progress
  const loadingStates = [!isLoading, !downloadsLoading];
  const completedCount = loadingStates.filter(Boolean).length;
  const loadingProgress = Math.round((completedCount / loadingStates.length) * 100);

  if (loadingProgress < 100) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-4">
        <Text className="text-destructive text-lg text-center">
          Failed to load library
        </Text>
        <Text className="text-muted-foreground text-sm mt-2 text-center">
          {error instanceof Error ? error.message : "Please try again later"}
        </Text>
      </View>
    );
  }

  const getEmptyMessage = () => {
    switch (selectedTab) {
      case 'favorites':
        return 'No favorite lectures yet';
      case 'downloaded':
        return 'No downloaded lectures';
      case 'history':
        return 'No listening history';
      default:
        return 'No lectures available';
    }
  };

  const renderHeader = () => (
    <>
      {/* Header */}
      <View className="pt-4 px-4 mb-6">
        <Text className="text-2xl font-bold text-foreground mb-1">Library</Text>
        <Text className="text-muted-foreground text-base">
          {displayedLectures.length} {displayedLectures.length === 1 ? 'lecture' : 'lectures'}
        </Text>
      </View>

      {/* Tabs */}
      <View className="px-4 mb-6">
        <SegmentedControl
          options={TAB_OPTIONS}
          selectedValue={selectedTab}
          onChange={(value) => setSelectedTab(value as TabOption)}
        />
      </View>

      {/* Controls Row */}
      <View className="flex-row items-center justify-between px-4 mb-6">
        {/* Sort Button */}
        <Pressable
          onPress={() => setShowSortMenu(!showSortMenu)}
          className="flex-row items-center gap-2 bg-card px-4 py-2 rounded-lg active:opacity-70"
        >
          <Ionicons name="swap-vertical" size={18} color="#a855f7" />
          <Text className="text-foreground text-sm font-medium">
            {sortBy === 'recent' ? 'Recent' : sortBy === 'az' ? 'A-Z' : 'Speaker'}
          </Text>
        </Pressable>

        {/* View Toggle */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary' : 'bg-card'}`}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === 'list' ? '#000' : '#a855f7'}
            />
          </Pressable>
          <Pressable
            onPress={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary' : 'bg-card'}`}
          >
            <Ionicons
              name="grid"
              size={20}
              color={viewMode === 'grid' ? '#000' : '#a855f7'}
            />
          </Pressable>
        </View>
      </View>

      {/* Sort Menu (if open) */}
      {showSortMenu && (
        <View className="px-4 mb-6">
          <View className="bg-card rounded-lg overflow-hidden">
            <Pressable
              onPress={() => {
                setSortBy('recent');
                setShowSortMenu(false);
              }}
              className="flex-row items-center justify-between px-4 py-3 border-b border-border active:bg-muted"
            >
              <Text className="text-foreground">Recent</Text>
              {sortBy === 'recent' && (
                <Ionicons name="checkmark" size={20} color="#a855f7" />
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setSortBy('az');
                setShowSortMenu(false);
              }}
              className="flex-row items-center justify-between px-4 py-3 border-b border-border active:bg-muted"
            >
              <Text className="text-foreground">A-Z</Text>
              {sortBy === 'az' && (
                <Ionicons name="checkmark" size={20} color="#a855f7" />
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setSortBy('speaker');
                setShowSortMenu(false);
              }}
              className="flex-row items-center justify-between px-4 py-3 active:bg-muted"
            >
              <Text className="text-foreground">Speaker</Text>
              {sortBy === 'speaker' && (
                <Ionicons name="checkmark" size={20} color="#a855f7" />
              )}
            </Pressable>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View className="flex-1 bg-background">
      {viewMode === 'list' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderHeader()}
          <View className="px-4 pb-6">
            <LectureListWithProgress
              lectures={displayedLectures}
              collectionId={selectedTab} // Use tab as collection identifier for library
              emptyMessage={getEmptyMessage()}
              emptyIcon="heart-outline"
              showHeader={false}
            />
          </View>
        </ScrollView>
      ) : (
        <LectureGridView
          lectures={displayedLectures}
          emptyMessage={getEmptyMessage()}
          ListHeaderComponent={renderHeader()}
        />
      )}
    </View>
  );
}
