// utils/imageHelper.ts

const imageHelpers: { [key: string]: any } = {
  'ab_wheel_rollout': require('../assets/workout_images/ab-wheel-rollout.jpg'),
  'arnold_press': require('../assets/workout_images/arnold-press.png'),
  'sample': require('../assets/workout_images/sample.png'),
  // Add more mappings as needed

  //for the target muscles
  'side_bend': require('../assets/target_muscles/side-bend-target.png'),
};



export const getWorkoutImage = (name: string) => {
  const key = name.toLowerCase().replace(/ /g, '_');
  return imageHelpers[key] || require('@/assets/workout_images/sample.png');
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