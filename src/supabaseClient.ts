import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import NetInfo from '@react-native-community/netinfo';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Custom fetch with retry & timeout
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const networkState = await NetInfo.fetch();
  
  if (!networkState.isConnected) {
    console.log('Network is not connected, cannot make request');
    throw new Error('No network connection');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sec timeout
    const signal = init?.signal || controller.signal;

    const response = await fetch(input, {
      ...init,
      signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: customFetch,
  },
});



// import { createClient } from '@supabase/supabase-js';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import 'react-native-url-polyfill/auto';
// import NetInfo from '@react-native-community/netinfo';

// const supabaseUrl = 'https://thlknwmuvubzifvruqty.supabase.co';
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRobGtud211dnViemlmdnJ1cXR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMjA1NzAsImV4cCI6MjA2MDY5NjU3MH0.LhUxm2_D0H390yppD58-WgzTlG0qFbXqQ2mLmE6m5YM';

// // Create custom fetch implementation with retry logic and network detection
// const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
//   // Check for network connectivity
//   const networkState = await NetInfo.fetch();
  
//   if (!networkState.isConnected) {
//     console.log('Network is not connected, cannot make request');
//     throw new Error('No network connection');
//   }
  
//   try {
//     // Add timeout to prevent hanging requests
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
//     // We need to be careful not to override the signal if it's already set
//     const signal = init?.signal || controller.signal;
    
//     // Make the fetch request with the original init parameters
//     // Don't modify the headers at all - let Supabase handle this
//     const response = await fetch(input, {
//       ...init,
//       signal,
//     });
    
//     clearTimeout(timeoutId);
//     return response;
//   } catch (error) {
//     console.error('Fetch error:', error);
//     throw error;
//   }
// };

// // Create Supabase client with React Native specific configuration
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
//   global: {
//     fetch: customFetch,
//   },
// });
