import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme, lightTheme, darkTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Food {
  name: string;
  icon: string;
  selected?: boolean;
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  water: number;
}

interface Recipe {
  name: string;
  description: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
}

interface Ingredient {
  name: string;
  description: string;
  icon: string;
}

const Nutrition: React.FC = () => {
  const { isDarkMode } = useTheme();
  const colors = isDarkMode ? darkTheme : lightTheme;
  
  // State for the onboarding section
  const [foodPreferences, setFoodPreferences] = useState<Food[]>([
    { name: 'Cabbage', icon: '🥬' },
    { name: 'Chicken', icon: '🍗' },
    { name: 'Meat', icon: '🥩', selected: true },
    { name: 'Egg', icon: '🥚', selected: true },
    { name: 'Broccoli', icon: '🥦' },
    { name: 'Corn', icon: '🌽' },
    { name: 'Carrot', icon: '🥕' },
    { name: 'Sweet Potato', icon: '🍠' },
    { name: 'Lettuce', icon: '🥬', selected: true },
  ]);

  // State for the nutrition dashboard
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: 832,
    protein: 200,
    carbs: 56,
    water: 1000,
  });

  // State for the meal view
  const [activeTab, setActiveTab] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [currentMeal, setCurrentMeal] = useState<Recipe>({
    name: 'Meat rice with sauce',
    description: 'Fresh and low-calorie',
    image: require('@/assets/meal-image/apple-logo.png'),
    calories: 290,
    protein: 16,
    carbs: 56,
  });

  // State for the recipe details
  const [recipeIngredients, setRecipeIngredients] = useState<Ingredient[]>([
    { name: 'Shrimp', description: 'The shrimp is briefly fried, then add instant sauce to it.', icon: '🍤' },
    { name: 'Strawberry', description: 'To make your dish balanced, include natural sugar from this fruit.', icon: '🍓' },
    { name: 'Kale', description: 'Vegetables rich in nutrients that contain minerals and antioxidants.', icon: '🥬' },
    { name: 'Corn', description: 'Adds sweetness and texture to your salad.', icon: '🌽' },
  ]);

  // Toggle food selection
  const toggleFoodSelection = (index: number) => {
    const updatedPreferences = [...foodPreferences];
    updatedPreferences[index].selected = !updatedPreferences[index].selected;
    setFoodPreferences(updatedPreferences);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.content}>
          {/* Onboarding Section */}
          <View style={[
            styles.card, 
            { 
              backgroundColor: colors.card,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border
            }
          ]}>
            <View style={styles.lettuceContainer}>
              <Text style={{ fontSize: 32 }}>🥬</Text>
            </View>
            
            <View style={styles.headerContainer}>
              <Text style={[styles.headerText, { color: colors.text }]}>Lets Start..</Text>
              <TouchableOpacity>
                <Text style={[styles.skipText, { color: colors.secondaryText }]}>Skip</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.questionContainer}>
              <Text style={[styles.questionText, { color: colors.text }]}>What material you like the most</Text>
              <Text style={[styles.subtitleText, { color: colors.secondaryText }]}>You can choose more than 1 answer</Text>
              
              <View style={styles.foodGrid}>
                {foodPreferences.map((food, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => toggleFoodSelection(index)}
                    style={[
                      styles.foodItem,
                      food.selected 
                        ? [
                            styles.selectedFoodItem, 
                            { backgroundColor: isDarkMode ? 'rgba(255, 149, 0, 0.2)' : '#ecfccb' }
                          ] 
                        : [
                            styles.unselectedFoodItem,
                            { 
                              backgroundColor: colors.card,
                              borderColor: colors.border
                            }
                          ]
                    ]}
                  >
                    <Text style={styles.foodIcon}>{food.icon}</Text>
                    <Text style={[styles.foodName, { color: colors.text }]}>{food.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.nextButton,
                { backgroundColor: isDarkMode ? '#FF9500' : 'black' }
              ]}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
          
          {/* Dashboard Section */}
          <View style={[
            styles.card, 
            { 
              backgroundColor: colors.card,
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border
            }
          ]}>
            <View style={styles.userHeader}>
              <View style={[
                styles.avatar,
                { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }
              ]}>
                <Text>👤</Text>
              </View>
              <View>
                <Text style={[styles.greetingText, { color: colors.text }]}>
                  Hello, <Text style={styles.boldText}>Kaluna</Text>
                </Text>
                <Text style={[styles.headerText, { color: colors.text }]}>Complete your daily nutrition</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.iconButton, 
                  { 
                    marginLeft: 'auto',
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0'
                  }
                ]}
              >
                <Text>🔔</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.nutritionCards}>
              <View style={[
                styles.nutritionCard, 
                styles.calorieCard,
                { backgroundColor: isDarkMode ? 'rgba(254, 226, 226, 0.2)' : '#fee2e2' }
              ]}>
                <Text style={[styles.nutritionCardTitle, { color: colors.text }]}>Kalori</Text>
                <View style={styles.nutritionCardContent}>
                  <Text style={[styles.nutritionCardLabel, { color: colors.secondaryText }]}>Total cons</Text>
                  <Text style={[styles.nutritionCardValue, { color: colors.text }]}>
                    {nutritionData.calories}
                    <Text style={[styles.nutritionCardUnit, { color: colors.secondaryText }]}>kCal</Text>
                  </Text>
                </View>
              </View>
              
              <View style={[
                styles.nutritionCard, 
                styles.proteinCard,
                { backgroundColor: isDarkMode ? 'rgba(236, 252, 203, 0.2)' : '#ecfccb' }
              ]}>
                <Text style={[styles.nutritionCardTitle, { color: colors.text }]}>Protein</Text>
                <View style={styles.nutritionCardContent}>
                  <Text style={[styles.nutritionCardLabel, { color: colors.secondaryText }]}>Total cons</Text>
                  <Text style={[styles.nutritionCardValue, { color: colors.text }]}>
                    {nutritionData.protein}
                    <Text style={[styles.nutritionCardUnit, { color: colors.secondaryText }]}>gr</Text>
                  </Text>
                </View>
              </View>
              
              <View style={[
                styles.nutritionCard, 
                styles.waterCard,
                { backgroundColor: isDarkMode ? 'rgba(254, 243, 199, 0.2)' : '#fef3c7' }
              ]}>
                <Text style={[styles.nutritionCardTitle, { color: colors.text }]}>Water</Text>
                <View style={styles.nutritionCardContent}>
                  <Text style={[styles.nutritionCardLabel, { color: colors.secondaryText }]}>Total cons</Text>
                  <Text style={[styles.nutritionCardValue, { color: colors.text }]}>
                    {nutritionData.water}
                    <Text style={[styles.nutritionCardUnit, { color: colors.secondaryText }]}>ml</Text>
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.tabContainer}>
              {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                <TouchableOpacity
                  key={meal}
                  onPress={() => setActiveTab(meal as any)}
                  style={[
                    styles.tabButton,
                    activeTab === meal 
                      ? [
                          styles.activeTabButton,
                          { backgroundColor: isDarkMode ? '#FF9500' : 'black' }
                        ] 
                      : [
                          styles.inactiveTabButton,
                          { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }
                        ]
                  ]}
                >
                  <Text 
                    style={[
                      styles.tabButtonText,
                      activeTab === meal ? styles.activeTabButtonText : [
                        styles.inactiveTabButtonText,
                        { color: colors.secondaryText }
                      ]
                    ]}
                  >
                    {meal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.mealCard}>
              <Image 
                source={require('@/assets/meal-image/apple-logo.png')}
                style={styles.mealImage}
              />
              <View style={styles.mealOverlay}>
                <Text style={styles.mealTitle}>{currentMeal.name}</Text>
                <Text style={styles.mealDescription}>{currentMeal.description}</Text>
              </View>
              <TouchableOpacity style={styles.favoriteButton}>
                <Text>❤️</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.mealStats}>
              <View style={styles.mealStat}>
                <Text style={[styles.mealStatValue, { color: colors.text }]}>{currentMeal.calories}</Text>
                <Text style={[styles.mealStatLabel, { color: colors.secondaryText }]}>Calories</Text>
              </View>
              <View style={styles.mealStat}>
                <Text style={[styles.mealStatValue, { color: colors.text }]}>
                  {currentMeal.protein}
                  <Text style={[styles.mealStatUnit, { color: colors.secondaryText }]}>gr</Text>
                </Text>
                <Text style={[styles.mealStatLabel, { color: colors.secondaryText }]}>Protein</Text>
              </View>
              <View style={styles.mealStat}>
                <Text style={[styles.mealStatValue, { color: colors.text }]}>
                  {currentMeal.carbs}
                  <Text style={[styles.mealStatUnit, { color: colors.secondaryText }]}>gr</Text>
                </Text>
                <Text style={[styles.mealStatLabel, { color: colors.secondaryText }]}>Carbs</Text>
              </View>
            </View>
          </View>
          
          {/* Recipe Details Section */}
          <View style={[
            styles.card, 
            styles.recipeCard,
            { 
              backgroundColor: isDarkMode ? 'rgba(254, 243, 199, 0.2)' : '#fef3c7',
              borderWidth: isDarkMode ? 1 : 0,
              borderColor: colors.border
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.backButton,
                { backgroundColor: colors.card }
              ]}
            >
              <Text>←</Text>
            </TouchableOpacity>
            
            <Text style={[styles.recipeTitle, { color: colors.text }]}>Mix salad vegetables</Text>
            
            <View style={styles.recipeStats}>
              <View style={styles.recipeMainStat}>
                <Text style={[styles.recipeMainStatValue, { color: colors.text }]}>240</Text>
                <Text style={[styles.recipeMainStatLabel, { color: colors.secondaryText }]}>Calories</Text>
              </View>
              
              <View style={styles.recipeSubStats}>
                <View style={styles.recipeSubStat}>
                  <Text style={[styles.recipeSubStatValue, { color: colors.text }]}>
                    19
                    <Text style={[styles.recipeSubStatUnit, { color: colors.secondaryText }]}>gr</Text>
                  </Text>
                  <Text style={[styles.recipeSubStatLabel, { color: colors.secondaryText }]}>Protein</Text>
                </View>
                <View style={styles.recipeSubStat}>
                  <Text style={[styles.recipeSubStatValue, { color: colors.text }]}>
                    5
                    <Text style={[styles.recipeSubStatUnit, { color: colors.secondaryText }]}>gr</Text>
                  </Text>
                  <Text style={[styles.recipeSubStatLabel, { color: colors.secondaryText }]}>Carbs</Text>
                </View>
              </View>
            </View>
            
            <Image 
              source={require('@/assets/meal-image/apple-logo.png')} 
              style={styles.recipeImage}
            />
            
            <View style={[
              styles.ingredientsCard,
              { backgroundColor: colors.card }
            ]}>
              <View style={styles.ingredientsHeader}>
                <Text style={[styles.ingredientsTitle, { color: colors.text }]}>Ingredients</Text>
                <View style={styles.ingredientsActions}>
                  <TouchableOpacity 
                    style={[
                      styles.ingredientActionButton,
                      { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }
                    ]}
                  >
                    <Text>↻</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.ingredientActionButton,
                      { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }
                    ]}
                  >
                    <Text>↓</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={[styles.ingredientsSubtitle, { color: colors.secondaryText }]}>6 healthy ingredients</Text>
              
              <View style={styles.ingredientsList}>
                {recipeIngredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={[
                      styles.ingredientIcon,
                      { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0' }
                    ]}>
                      <Text style={{ fontSize: 18 }}>{ingredient.icon}</Text>
                    </View>
                    <View style={styles.ingredientDetails}>
                      <Text style={[styles.ingredientName, { color: colors.text }]}>{ingredient.name}</Text>
                      <Text style={[styles.ingredientDescription, { color: colors.secondaryText }]}>
                        {ingredient.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    flexDirection: 'column',
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lettuceContainer: {
    position: 'absolute',
    top: -16,
    left: -16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  skipText: {
    fontSize: 14,
  },
  questionContainer: {
    marginTop: 32,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    marginBottom: 24,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodItem: {
    width: '31%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedFoodItem: {},
  unselectedFoodItem: {
    borderWidth: 1,
  },
  foodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  foodName: {
    fontSize: 14,
  },
  nextButton: {
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 14,
  },
  boldText: {
    fontWeight: 'bold',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  nutritionCard: {
    width: '31%',
    borderRadius: 12,
    padding: 16,
  },
  calorieCard: {},
  proteinCard: {},
  waterCard: {},
  nutritionCardTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  nutritionCardContent: {
    marginTop: 12,
  },
  nutritionCardLabel: {
    fontSize: 12,
  },
  nutritionCardValue: {
    fontWeight: 'bold',
  },
  nutritionCardUnit: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  activeTabButton: {},
  inactiveTabButton: {},
  tabButtonText: {
    fontSize: 14,
  },
  activeTabButtonText: {
    color: 'white',
  },
  inactiveTabButtonText: {},
  mealCard: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mealImage: {
    width: '100%',
    height: 192,
  },
  mealOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  mealTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mealDescription: {
    color: 'white',
    opacity: 0.8,
    fontSize: 14,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  mealStat: {
    alignItems: 'center',
  },
  mealStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mealStatUnit: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  mealStatLabel: {
    fontSize: 12,
  },
  recipeCard: {},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  recipeStats: {
    marginTop: 24,
    marginBottom: 24,
  },
  recipeMainStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  recipeMainStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  recipeMainStatLabel: {
    fontSize: 14,
  },
  recipeSubStats: {
    flexDirection: 'row',
    gap: 32,
  },
  recipeSubStat: {},
  recipeSubStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  recipeSubStatUnit: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  recipeSubStatLabel: {
    fontSize: 12,
  },
  recipeImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 24,
  },
  ingredientsCard: {
    borderRadius: 12,
    padding: 16,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientsTitle: {
    fontWeight: 'bold',
  },
  ingredientsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  ingredientActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientsSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  ingredientsList: {
    gap: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    gap: 16,
  },
  ingredientIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientDetails: {
    flex: 1,
  },
  ingredientName: {
    fontWeight: '500',
  },
  ingredientDescription: {
    fontSize: 12,
  },
});

export default Nutrition;


// import React, { useState } from 'react';
// import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

// interface Food {
//   name: string;
//   icon: string;
//   selected?: boolean;
// }

// interface NutritionData {
//   calories: number;
//   protein: number;
//   carbs: number;
//   water: number;
// }

// interface Recipe {
//   name: string;
//   description: string;
//   image: string;
//   calories: number;
//   protein: number;
//   carbs: number;
// }

// interface Ingredient {
//   name: string;
//   description: string;
//   icon: string;
// }

// const Nutrition: React.FC = () => {
//   // State for the onboarding section
//   const [foodPreferences, setFoodPreferences] = useState<Food[]>([
//     { name: 'Cabbage', icon: '🥬' },
//     { name: 'Chicken', icon: '🍗' },
//     { name: 'Meat', icon: '🥩', selected: true },
//     { name: 'Egg', icon: '🥚', selected: true },
//     { name: 'Broccoli', icon: '🥦' },
//     { name: 'Corn', icon: '🌽' },
//     { name: 'Carrot', icon: '🥕' },
//     { name: 'Sweet Potato', icon: '🍠' },
//     { name: 'Lettuce', icon: '🥬', selected: true },
//   ]);

//   // State for the nutrition dashboard
//   const [nutritionData, setNutritionData] = useState<NutritionData>({
//     calories: 832,
//     protein: 200,
//     carbs: 56,
//     water: 1000,
//   });

//   // State for the meal view
//   const [activeTab, setActiveTab] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
//   const [currentMeal, setCurrentMeal] = useState<Recipe>({
//     name: 'Meat rice with sauce',
//     description: 'Fresh and low-calorie',
//     image: require('../../assets/meal-image/apple-logo.png'),
//     calories: 290,
//     protein: 16,
//     carbs: 56,
//   });

//   // State for the recipe details
//   const [recipeIngredients, setRecipeIngredients] = useState<Ingredient[]>([
//     { name: 'Shrimp', description: 'The shrimp is briefly fried, then add instant sauce to it.', icon: '🍤' },
//     { name: 'Strawberry', description: 'To make your dish balanced, include natural sugar from this fruit.', icon: '🍓' },
//     { name: 'Kale', description: 'Vegetables rich in nutrients that contain minerals and antioxidants.', icon: '🥬' },
//     { name: 'Corn', description: 'Adds sweetness and texture to your salad.', icon: '🌽' },
//   ]);

//   // Toggle food selection
//   const toggleFoodSelection = (index: number) => {
//     const updatedPreferences = [...foodPreferences];
//     updatedPreferences[index].selected = !updatedPreferences[index].selected;
//     setFoodPreferences(updatedPreferences);
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.content}>
//         {/* Onboarding Section */}
//         <View style={styles.card}>
//           <View style={styles.lettuceContainer}>
//             <Text style={{ fontSize: 32 }}>🥬</Text>
//           </View>
          
//           <View style={styles.headerContainer}>
//             <Text style={styles.headerText}>Lets Start..</Text>
//             <TouchableOpacity>
//               <Text style={styles.skipText}>Skip</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.questionContainer}>
//             <Text style={styles.questionText}>What material you like the most</Text>
//             <Text style={styles.subtitleText}>You can choose more than 1 answer</Text>
            
//             <View style={styles.foodGrid}>
//               {foodPreferences.map((food, index) => (
//                 <TouchableOpacity 
//                   key={index}
//                   onPress={() => toggleFoodSelection(index)}
//                   style={[
//                     styles.foodItem,
//                     food.selected ? styles.selectedFoodItem : styles.unselectedFoodItem
//                   ]}
//                 >
//                   <Text style={styles.foodIcon}>{food.icon}</Text>
//                   <Text style={styles.foodName}>{food.name}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>
          
//           <TouchableOpacity style={styles.nextButton}>
//             <Text style={styles.nextButtonText}>Next</Text>
//           </TouchableOpacity>
//         </View>
        
//         {/* Dashboard Section */}
//         <View style={styles.card}>
//           <View style={styles.userHeader}>
//             <View style={styles.avatar}>
//               <Text>👤</Text>
//             </View>
//             <View>
//               <Text style={styles.greetingText}>Hello, <Text style={styles.boldText}>Kaluna</Text></Text>
//               <Text style={styles.headerText}>Complete your daily nutrition</Text>
//             </View>
//             <TouchableOpacity style={[styles.iconButton, { marginLeft: 'auto' }]}>
//               <Text>🔔</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.nutritionCards}>
//             <View style={[styles.nutritionCard, styles.calorieCard]}>
//               <Text style={styles.nutritionCardTitle}>Kalori</Text>
//               <View style={styles.nutritionCardContent}>
//                 <Text style={styles.nutritionCardLabel}>Total cons</Text>
//                 <Text style={styles.nutritionCardValue}>
//                   {nutritionData.calories}<Text style={styles.nutritionCardUnit}>kCal</Text>
//                 </Text>
//               </View>
//             </View>
            
//             <View style={[styles.nutritionCard, styles.proteinCard]}>
//               <Text style={styles.nutritionCardTitle}>Protein</Text>
//               <View style={styles.nutritionCardContent}>
//                 <Text style={styles.nutritionCardLabel}>Total cons</Text>
//                 <Text style={styles.nutritionCardValue}>
//                   {nutritionData.protein}<Text style={styles.nutritionCardUnit}>gr</Text>
//                 </Text>
//               </View>
//             </View>
            
//             <View style={[styles.nutritionCard, styles.waterCard]}>
//               <Text style={styles.nutritionCardTitle}>Water</Text>
//               <View style={styles.nutritionCardContent}>
//                 <Text style={styles.nutritionCardLabel}>Total cons</Text>
//                 <Text style={styles.nutritionCardValue}>
//                   {nutritionData.water}<Text style={styles.nutritionCardUnit}>ml</Text>
//                 </Text>
//               </View>
//             </View>
//           </View>
          
//           <View style={styles.tabContainer}>
//             {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
//               <TouchableOpacity
//                 key={meal}
//                 onPress={() => setActiveTab(meal as any)}
//                 style={[
//                   styles.tabButton,
//                   activeTab === meal ? styles.activeTabButton : styles.inactiveTabButton
//                 ]}
//               >
//                 <Text 
//                   style={[
//                     styles.tabButtonText,
//                     activeTab === meal ? styles.activeTabButtonText : styles.inactiveTabButtonText
//                   ]}
//                 >
//                   {meal}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
          
//           <View style={styles.mealCard}>
//             <Image 
//               source={require('@/assets/meal-image/apple-logo.png')}
//               style={styles.mealImage}
//             />
//             <View style={styles.mealOverlay}>
//               <Text style={styles.mealTitle}>{currentMeal.name}</Text>
//               <Text style={styles.mealDescription}>{currentMeal.description}</Text>
//             </View>
//             <TouchableOpacity style={styles.favoriteButton}>
//               <Text>❤️</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.mealStats}>
//             <View style={styles.mealStat}>
//               <Text style={styles.mealStatValue}>{currentMeal.calories}</Text>
//               <Text style={styles.mealStatLabel}>Calories</Text>
//             </View>
//             <View style={styles.mealStat}>
//               <Text style={styles.mealStatValue}>
//                 {currentMeal.protein}<Text style={styles.mealStatUnit}>gr</Text>
//               </Text>
//               <Text style={styles.mealStatLabel}>Protein</Text>
//             </View>
//             <View style={styles.mealStat}>
//               <Text style={styles.mealStatValue}>
//                 {currentMeal.carbs}<Text style={styles.mealStatUnit}>gr</Text>
//               </Text>
//               <Text style={styles.mealStatLabel}>Carbs</Text>
//             </View>
//           </View>
//         </View>
        
//         {/* Recipe Details Section */}
//         <View style={[styles.card, styles.recipeCard]}>
//           <TouchableOpacity style={styles.backButton}>
//             <Text>←</Text>
//           </TouchableOpacity>
          
//           <Text style={styles.recipeTitle}>Mix salad vegetables</Text>
          
//           <View style={styles.recipeStats}>
//             <View style={styles.recipeMainStat}>
//               <Text style={styles.recipeMainStatValue}>240</Text>
//               <Text style={styles.recipeMainStatLabel}>Calories</Text>
//             </View>
            
//             <View style={styles.recipeSubStats}>
//               <View style={styles.recipeSubStat}>
//                 <Text style={styles.recipeSubStatValue}>
//                   19<Text style={styles.recipeSubStatUnit}>gr</Text>
//                 </Text>
//                 <Text style={styles.recipeSubStatLabel}>Protein</Text>
//               </View>
//               <View style={styles.recipeSubStat}>
//                 <Text style={styles.recipeSubStatValue}>
//                   5<Text style={styles.recipeSubStatUnit}>gr</Text>
//                 </Text>
//                 <Text style={styles.recipeSubStatLabel}>Carbs</Text>
//               </View>
//             </View>
//           </View>
          
//           <Image 
//             source={require('@/assets/meal-image/apple-logo.png')} 
//             style={styles.recipeImage}
//           />
          
//           <View style={styles.ingredientsCard}>
//             <View style={styles.ingredientsHeader}>
//               <Text style={styles.ingredientsTitle}>Ingredients</Text>
//               <View style={styles.ingredientsActions}>
//                 <TouchableOpacity style={styles.ingredientActionButton}>
//                   <Text>↻</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.ingredientActionButton}>
//                   <Text>↓</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//             <Text style={styles.ingredientsSubtitle}>6 healthy ingredients</Text>
            
//             <View style={styles.ingredientsList}>
//               {recipeIngredients.map((ingredient, index) => (
//                 <View key={index} style={styles.ingredientItem}>
//                   <View style={styles.ingredientIcon}>
//                     <Text style={{ fontSize: 18 }}>{ingredient.icon}</Text>
//                   </View>
//                   <View style={styles.ingredientDetails}>
//                     <Text style={styles.ingredientName}>{ingredient.name}</Text>
//                     <Text style={styles.ingredientDescription}>{ingredient.description}</Text>
//                   </View>
//                 </View>
//               ))}
//             </View>
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0f0f0',
//   },
//   content: {
//     padding: 16,
//     flexDirection: 'column',
//     gap: 16,
//   },
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 24,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   lettuceContainer: {
//     position: 'absolute',
//     top: -16,
//     left: -16,
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//     marginTop: 12,
//   },
//   headerText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   skipText: {
//     color: 'gray',
//   },
//   questionContainer: {
//     marginTop: 32,
//   },
//   questionText: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   subtitleText: {
//     fontSize: 14,
//     color: 'gray',
//     marginBottom: 24,
//   },
//   foodGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   foodItem: {
//     width: '31%',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   selectedFoodItem: {
//     backgroundColor: '#ecfccb',
//   },
//   unselectedFoodItem: {
//     backgroundColor: 'white',
//     borderColor: '#f0f0f0',
//     borderWidth: 1,
//   },
//   foodIcon: {
//     fontSize: 24,
//     marginBottom: 8,
//   },
//   foodName: {
//     fontSize: 14,
//   },
//   nextButton: {
//     backgroundColor: 'black',
//     borderRadius: 24,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginTop: 32,
//   },
//   nextButtonText: {
//     color: 'white',
//     fontWeight: '500',
//   },
//   userHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 16,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   greetingText: {
//     fontSize: 14,
//   },
//   boldText: {
//     fontWeight: 'bold',
//   },
//   iconButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   nutritionCards: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   nutritionCard: {
//     width: '31%',
//     borderRadius: 12,
//     padding: 16,
//   },
//   calorieCard: {
//     backgroundColor: '#fee2e2',
//   },
//   proteinCard: {
//     backgroundColor: '#ecfccb',
//   },
//   waterCard: {
//     backgroundColor: '#fef3c7',
//   },
//   nutritionCardTitle: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   nutritionCardContent: {
//     marginTop: 12,
//   },
//   nutritionCardLabel: {
//     fontSize: 12,
//     color: 'gray',
//   },
//   nutritionCardValue: {
//     fontWeight: 'bold',
//   },
//   nutritionCardUnit: {
//     fontSize: 12,
//     fontWeight: 'normal',
//     color: 'gray',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     marginBottom: 16,
//     gap: 8,
//   },
//   tabButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 24,
//   },
//   activeTabButton: {
//     backgroundColor: 'black',
//   },
//   inactiveTabButton: {
//     backgroundColor: '#f0f0f0',
//   },
//   tabButtonText: {
//     fontSize: 14,
//   },
//   activeTabButtonText: {
//     color: 'white',
//   },
//   inactiveTabButtonText: {
//     color: 'gray',
//   },
//   mealCard: {
//     borderRadius: 12,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   mealImage: {
//     width: '100%',
//     height: 192,
//   },
//   mealOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 16,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   mealTitle: {
//     color: 'white',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   mealDescription: {
//     color: 'white',
//     opacity: 0.8,
//     fontSize: 14,
//   },
//   favoriteButton: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'white',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   mealStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 16,
//   },
//   mealStat: {
//     alignItems: 'center',
//   },
//   mealStatValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   mealStatUnit: {
//     fontSize: 14,
//     fontWeight: 'normal',
//   },
//   mealStatLabel: {
//     fontSize: 12,
//     color: 'gray',
//   },
//   recipeCard: {
//     backgroundColor: '#fef3c7',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'white',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   recipeTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   recipeStats: {
//     marginTop: 24,
//     marginBottom: 24,
//   },
//   recipeMainStat: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 4,
//   },
//   recipeMainStatValue: {
//     fontSize: 28,
//     fontWeight: 'bold',
//   },
//   recipeMainStatLabel: {
//     fontSize: 14,
//     color: 'gray',
//   },
//   recipeSubStats: {
//     flexDirection: 'row',
//     gap: 32,
//   },
//   recipeSubStat: {},
//   recipeSubStatValue: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   recipeSubStatUnit: {
//     fontSize: 14,
//     fontWeight: 'normal',
//   },
//   recipeSubStatLabel: {
//     fontSize: 12,
//     color: 'gray',
//   },
//   recipeImage: {
//     width: '100%',
//     height: 160,
//     borderRadius: 12,
//     marginBottom: 24,
//   },
//   ingredientsCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//   },
//   ingredientsHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   ingredientsTitle: {
//     fontWeight: 'bold',
//   },
//   ingredientsActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   ingredientActionButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#f0f0f0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   ingredientsSubtitle: {
//     fontSize: 12,
//     color: 'gray',
//     marginBottom: 16,
//   },
//   ingredientsList: {
//     gap: 16,
//   },
//   ingredientItem: {
//     flexDirection: 'row',
//     gap: 16,
//   },
//   ingredientIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 8,
//     backgroundColor: '#f0f0f0',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   ingredientDetails: {
//     flex: 1,
//   },
//   ingredientName: {
//     fontWeight: '500',
//   },
//   ingredientDescription: {
//     fontSize: 12,
//     color: 'gray',
//   },
// });

// export default Nutrition;