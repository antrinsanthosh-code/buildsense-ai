import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import AnalysePlotScreen from './screens/AnalysePlotScreen';
import LayoutsScreen from './screens/LayoutsScreen';
import CostScreen from './screens/CostScreen';
import ModelViewerScreen from './screens/ModelViewerScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home')         iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Projects') iconName = focused ? 'folder' : 'folder-outline';
            else if (route.name === 'Analyse')  iconName = focused ? 'camera' : 'camera-outline';
            else if (route.name === 'Layouts')  iconName = focused ? 'grid' : 'grid-outline';
            else if (route.name === 'Cost')     iconName = focused ? 'calculator' : 'calculator-outline';
            else if (route.name === '3D View')  iconName = focused ? 'cube' : 'cube-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor  : '#e94560',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: {
            backgroundColor: '#1a1a2e',
            borderTopColor : '#333',
          },
          headerStyle           : { backgroundColor: '#1a1a2e' },
          headerTintColor       : '#fff',
          headerTitleStyle      : { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen name="Home"     component={HomeScreen}        options={{ title: 'BuildSense AI' }} />
        <Tab.Screen name="Projects" component={ProjectsScreen}    options={{ title: 'My Projects' }} />
        <Tab.Screen name="Analyse"  component={AnalysePlotScreen} options={{ title: 'Analyse Plot' }} />
        <Tab.Screen name="Layouts"  component={LayoutsScreen}     options={{ title: 'Layouts' }} />
        <Tab.Screen name="Cost"     component={CostScreen}        options={{ title: 'Cost Estimate' }} />
        <Tab.Screen name="3D View"  component={ModelViewerScreen} options={{ title: '3D House' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}