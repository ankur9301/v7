const videoHelpers: { [key: string]: any } = {
    'arnold_press': require('../assets/workoutVideos/arnold_press.mp4'),
    'ab_wheel_rollout': require('../assets/workoutVideos/ab-wheel-rollout.mp4'),
    'sample': require('../assets/workoutVideos/sample.mp4'),
    // Add more mappings as needed
  };
  
  export const getWorkoutVideo = (name: string) => {
    const key = name.toLowerCase().replace(/ /g, '_');
    return videoHelpers[key] || require('../assets/workoutVideos/sample.mp4');
  };
  

  
  