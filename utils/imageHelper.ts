// utils/imageHelper.ts

const imageHelpers: { [key: string]: any } = {
  'ab_wheel_rollout': require('../assets/workout_images/ab_wheel_rollout.png'),
  'arnold_press': require('../assets/workout_images/arnold_press.png'),
  'sample': require('../assets/workout_images/sample.png'),
  // Add more mappings as needed
};



export const getWorkoutImage = (name: string) => {
  const key = name.toLowerCase().replace(/ /g, '_');
  return imageHelpers[key] || require('../assets/workout_images/sample.png');
};


// const videoHelpers: { [key: string]: any } = {
//   'arnold_press': require('../assets/workoutVideos/arnold_press.mp4'),
//   'sample': require('../assets/workoutVideos/sample.mp4'),
//   // Add more mappings as needed
// };


// export const getWorkoutVideo = (name: string) => {
//   const key = name.toLowerCase().replace(/ /g, '_');
//   return imageHelpers[key] || require('../assets/workoutVideos/sample.mp4');
// };