import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { Person } from 'shared/types';

interface PersonStructuredDataProps {
  person: Person;
}

export const PersonStructuredData: React.FC<PersonStructuredDataProps> = ({ person }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    birthDate: person.birthYear ? `${person.birthYear}` : undefined,
    deathDate: person.deathYear ? `${person.deathYear}` : undefined,
    description: person.description || undefined,
    image: person.imageUrl || undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    jobTitle: person.category || undefined,
    nationality: person.country || undefined,
    ...(person.wikiLink && {
      sameAs: [person.wikiLink]
    })
  };

  // Remove undefined values
  const cleanedData = JSON.parse(JSON.stringify(structuredData));

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(cleanedData)}
      </script>
    </Helmet>
  );
};

