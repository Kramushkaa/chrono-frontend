import React from 'react';
import { PersonPanel } from 'features/persons/components/PersonPanel';
import { getGroupColor, getPersonGroup } from 'features/persons/utils/groupingUtils';
import { getCategoryColor } from 'shared/utils/categoryColors';
import type { Person } from 'shared/types';

interface QuizPersonPanelProps {
  selectedPerson: Person | null;
  onClose: () => void;
}

/**
 * Wrapper for PersonPanel with pre-configured quiz-specific props
 * Reduces duplication across quiz pages
 */
export const QuizPersonPanel: React.FC<QuizPersonPanelProps> = ({ 
  selectedPerson, 
  onClose 
}) => {
  if (!selectedPerson) return null;

  return (
    <PersonPanel
      selectedPerson={selectedPerson}
      onClose={onClose}
      getGroupColor={getGroupColor}
      getPersonGroup={(person) => getPersonGroup(person, 'none')}
      getCategoryColor={getCategoryColor}
    />
  );
};





