/**
 * Custom hook for content search functionality
 * Handles search across speakers, collections, and lectures
 */

import { useState, useMemo } from "react";

export interface SearchableContent {
  speakers: any[];
  collections: any[];
  lectures: any[];
}

export const useContentSearch = (speakers: any[] = []) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Transform speakers data to extract all lectures
  const allLectures = useMemo(() => {
    if (!speakers) return [];
    return speakers.flatMap(speaker => 
      (speaker.collections || []).flatMap((collection: any) => 
        (collection.lectures || []).map((lecture: any) => ({
          ...lecture,
          speakerName: speaker.name,
          collectionTitle: collection.title,
          speakerId: speaker.id,
          collectionId: collection.id,
        }))
      )
    );
  }, [speakers]);

  // Extract all collections
  const allCollections = useMemo(() => {
    if (!speakers) return [];
    return speakers.flatMap(speaker => 
      (speaker.collections || []).map((collection: any) => ({
        ...collection,
        speakerName: speaker.name,
        speakerId: speaker.id,
      }))
    );
  }, [speakers]);

  // Search results - optimized to avoid circular dependencies
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        speakers: speakers || [],
        collections: allCollections,
        lectures: allLectures,
      };
    }

    const query = searchQuery.toLowerCase().trim();

    // Filter speakers
    const filteredSpeakers = (speakers || []).filter(speaker =>
      speaker.name?.toLowerCase().includes(query) ||
      speaker.description?.toLowerCase().includes(query)
    );

    // Filter collections
    const collections = (speakers || []).flatMap(speaker =>
      (speaker.collections || [])
        .filter((collection: any) =>
          collection.title?.toLowerCase().includes(query) ||
          speaker.name?.toLowerCase().includes(query)
        )
        .map((collection: any) => ({
          ...collection,
          speakerName: speaker.name,
          speakerId: speaker.id,
        }))
    );

    // Filter lectures
    const lectures = allLectures.filter(lecture =>
      lecture.title?.toLowerCase().includes(query) ||
      lecture.speakerName?.toLowerCase().includes(query) ||
      lecture.collectionTitle?.toLowerCase().includes(query)
    );

    return { speakers: filteredSpeakers, collections, lectures };
  }, [searchQuery, speakers, allLectures, allCollections]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    allLectures,
    allCollections,
  };
};