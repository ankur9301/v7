// templateService.ts

import { supabase } from "@/src/supabaseClient";
import { useUserStore } from "@/store/useUserStore";
import type { Workout } from "@/types/types";

// Save template
export const saveTemplateToSupabase = async (title: string, workouts: Workout[]) => {
  const { user } = useUserStore.getState();
  if (!user?.id) throw new Error("User not logged in");

  const { data: template, error: templateError } = await supabase
    .from("workout_templates")
    .insert({ title, user_id: user.id })
    .select()
    .single();

  if (templateError) throw templateError;

  const exercises = workouts.map((w) => ({
    template_id: template.id,
    name: w.name,
    muscle: w.muscle,
    level: w.level,
    sets: w.sets,
    reps: w.reps,
    image_url: typeof w.image === "string" ? w.image : null,
  }));

  const { error: exerciseError } = await supabase
    .from("template_exercises")
    .insert(exercises);

  if (exerciseError) throw exerciseError;

  return true;
};

// Fetch templates
export const fetchTemplates = async () => {
  const { user } = useUserStore.getState();
  if (!user?.id) throw new Error("User not logged in");

  const { data, error } = await supabase
    .from("workout_templates")
    .select("*, template_exercises(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((template) => ({
    id: template.id,
    title: template.title,
    workouts: template.template_exercises.map((ex: { id: number; name: string; muscle: string; level: string; sets: number; reps: number; image_url: string | null }) => ({
      id: ex.id,
      name: ex.name,
      muscle: ex.muscle,
      level: ex.level,
      sets: ex.sets,
      reps: ex.reps,
      imageUrl: ex.image_url,
    })),
  }));
};



export const deleteTemplate = async (templateId: string) => {
    const { error } = await supabase
      .from("workout_templates")
      .delete()
      .eq("id", templateId);
  
    if (error) throw error;
  };
  
  export const clearAllTemplates = async () => {
    const { user } = useUserStore.getState();
    if (!user?.id) throw new Error("User not logged in");
  
    const { error } = await supabase
      .from("workout_templates")
      .delete()
      .eq("user_id", user.id);
  
    if (error) throw error;
  };