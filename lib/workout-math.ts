/**
 * METs (Metabolic Equivalent of Task) Calculation Reference
 */
export const calculateBurnedCaloriesAdvanced = (
  durationMins: number,
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string,
  workoutType: string,
  intensity: 'Low' | 'Medium' | 'High'
): number => {
  let met = 5.0; // default medium general

  if (workoutType === 'Run' || workoutType.toLowerCase().includes('run') || workoutType.toLowerCase().includes('cardio')) {
    switch(intensity) {
      case 'Low': met = 4.0; break; // brisk walking
      case 'Medium': met = 7.0; break; // jogging
      case 'High': met = 10.0; break; // running fast
    }
  } else if (workoutType === 'Weight Lifting' || workoutType.toLowerCase().includes('weight')) {
    switch(intensity) {
      case 'Low': met = 3.5; break; // light effort
      case 'Medium': met = 5.0; break; // moderate effort
      case 'High': met = 6.0; break; // vigorous effort
    }
  }

  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5; // Default Male
  if (gender.toLowerCase() === 'female') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }

  // Formula: Calories = BMR * (MET / 24) * (Duration in hours)
  const durationHours = durationMins / 60;
  const calories = bmr * (met / 24) * durationHours;
  
  return Math.max(0, Math.round(calories));
};
