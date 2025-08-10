import { fetchCurrentRules } from '@/lib/api';
import { RulesCategory } from '@/lib/api-types-generated';
import { queryKeys } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const queryKey = ['selected-rules-category'];

export default function useRules() {
  const client = useQueryClient();
  const { data: selectedCategory } = useQuery<RulesCategory>({
    queryKey,
    initialData: 'general',
    queryFn: () => Promise.resolve('general'),
    enabled: false,
  });

  const setSelectedCategory = (category: RulesCategory) => {
    client.setQueryData(queryKey, category);
  };

  const { data: rulesData, isLoading } = useQuery({
    queryKey: queryKeys.currentRulesVersion,
    queryFn: fetchCurrentRules,
  });

  const generalRules = rulesData?.versions.find(rule => rule.category === 'general');
  const gameplayRules = rulesData?.versions.find(rule => rule.category === 'gameplay');
  const donationsRules = rulesData?.versions.find(rule => rule.category === 'donations');

  const rules = {
    general: generalRules,
    gameplay: gameplayRules,
    donations: donationsRules,
  };

  return {
    isLoading,
    selectedCategory,
    setSelectedCategory,
    rules: rules[selectedCategory] || undefined,
  };
}
