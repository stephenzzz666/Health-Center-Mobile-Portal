import React from 'react';
import LoginScreen from './LoginScreen'; // Adjust path if LoginScreen is in the same folder

export default function AuthScreen({ setName, setRole, setScreen, setActiveTab }) {
  return (
    <LoginScreen
      setName={setName}
      setRole={setRole}
      setScreen={setScreen}
      setActiveTab={setActiveTab}
    />
  );
}