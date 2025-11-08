import { useState, useCallback } from 'react';
import { getPersonById } from 'shared/api/persons';
import type { Person } from 'shared/types';
import type { QuizPerson } from '../types';

/**
 * Hook for managing PersonPanel state and loading full person data
 */
export const usePersonPanel = () => {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const handlePersonInfoClick = useCallback(async (person: QuizPerson) => {
    try {
      // Получаем полную информацию о персоне из API
      const fullPerson = await getPersonById(person.id);
      if (fullPerson) {
        setSelectedPerson(fullPerson);
      } else {
        if (import.meta.env.MODE !== 'production') {
          console.error('Person not found:', person.id);
        }
      }
    } catch (error) {
      if (import.meta.env.MODE !== 'production') {
        console.error('Failed to load person:', error);
      }
    }
  }, []);

  const closePersonPanel = useCallback(() => {
    setSelectedPerson(null);
  }, []);

  return {
    selectedPerson,
    setSelectedPerson,
    handlePersonInfoClick,
    closePersonPanel,
  };
};





