import React, { useEffect, useState } from 'react';
import { RegisterForm } from 'features/auth/components/RegisterForm';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from 'shared/layout/AppHeader';
import { Breadcrumbs } from 'shared/ui/Breadcrumbs';
import { useFilters } from '../../../shared/hooks/useFilters';
import { getCategories, getCountries } from 'shared/api/api';
import { getGroupColor } from 'features/persons/utils/groupingUtils';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { filters, setFilters, groupingType, setGroupingType, yearInputs, setYearInputs, applyYearFilter, handleYearKeyPress, resetAllFilters } = useFilters();
  const [categories, setCategories] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, cntrs] = await Promise.all([getCategories(), getCountries()]);
        if (!mounted) return;
        setCategories(cats || []);
        setCountries(cntrs || []);
      } catch {}
    })();
    const onScroll = () => setIsScrolled((window.pageYOffset || document.documentElement.scrollTop) > 50);
    window.addEventListener('scroll', onScroll);
    return () => { mounted = false; window.removeEventListener('scroll', onScroll); };
  }, []);

  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Хронониндзя — Регистрация">
      <AppHeader
        isScrolled={isScrolled}
        showControls={showControls}
        setShowControls={setShowControls}
        mode="minimal"
        filters={filters}
        setFilters={setFilters}
        groupingType={groupingType}
        setGroupingType={setGroupingType}
        allCategories={categories}
        allCountries={countries}
        yearInputs={yearInputs}
        setYearInputs={setYearInputs}
        applyYearFilter={applyYearFilter}
        handleYearKeyPress={handleYearKeyPress}
        resetAllFilters={resetAllFilters}
        getCategoryColor={getGroupColor}
        sortedData={[]}
        handleSliderMouseDown={() => {}}
        handleSliderMouseMove={() => {}}
        handleSliderMouseUp={() => {}}
        isDraggingSlider={false}
      />
      <Breadcrumbs />
      <div style={{ maxWidth: 960, margin: '40px auto', padding: '0 16px' }}>
        <h1 style={{ marginBottom: 16 }}>Регистрация</h1>
        <RegisterForm onSuccess={() => navigate('/profile')} />
      </div>
    </div>
  );
}


