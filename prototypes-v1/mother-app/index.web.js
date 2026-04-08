import { AppRegistry } from 'react-native';
import App from './App.web';

// Register the app
AppRegistry.registerComponent('NutriSaktiMother', () => App);

// Run the app in the browser
AppRegistry.runApplication('NutriSaktiMother', {
  rootTag: document.getElementById('root'),
});
