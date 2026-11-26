import { getClasses } from "@/api/classes.api";
import type { SegmentOption } from "@/components/ui/AppSegmentedControl";
import { useIsPremium } from "@/hooks/useCurrentUser";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Fetches classes and tracks the selected one for the class switcher
 * (audio lectures, MCQ practice, keyword revision).
 */
export const useClasses = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
  });
  const { classes = [] } = data?.data || {};
  const isPremiumUser = useIsPremium();

  const classOptions: SegmentOption<string>[] = classes.map((c) => ({
    label: c.name,
    value: c.id,
    isPremium: c.isPremium && !isPremiumUser,
  }));

  const [selectedClassId, setSelectedClassId] = useState<string>();
  const classId = selectedClassId ?? classes[0]?.id;
  const selectedClass = classes.find((c) => c.id === classId);

  return {
    classes,
    classOptions,
    classId,
    selectedClass,
    className: selectedClass?.name,
    setSelectedClassId,
    isLoading,
    isError,
    refetch,
  };
};
