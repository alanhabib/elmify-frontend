import React from 'react';
import { Text, TextProps } from 'react-native';

interface HighlightedTextProps extends TextProps {
  text: string;
  searchQuery: string;
  highlightStyle?: object;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  searchQuery,
  highlightStyle = {},
  ...textProps
}) => {
  if (!searchQuery.trim()) {
    return <Text {...textProps}>{text}</Text>;
  }

  const query = searchQuery.toLowerCase().trim();
  const lowerText = text.toLowerCase();
  const parts: { text: string; isHighlighted: boolean }[] = [];
  
  let lastIndex = 0;
  let index = lowerText.indexOf(query);
  
  while (index !== -1) {
    // Add text before the match
    if (index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, index),
        isHighlighted: false,
      });
    }
    
    // Add the matched text
    parts.push({
      text: text.substring(index, index + query.length),
      isHighlighted: true,
    });
    
    lastIndex = index + query.length;
    index = lowerText.indexOf(query, lastIndex);
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isHighlighted: false,
    });
  }

  return (
    <Text {...textProps}>
      {parts.map((part, index) => (
        <Text
          key={index}
          style={part.isHighlighted ? { 
            backgroundColor: '#a855f7', 
            color: '#ffffff',
            fontWeight: '600',
            ...highlightStyle 
          } : undefined}
        >
          {part.text}
        </Text>
      ))}
    </Text>
  );
};