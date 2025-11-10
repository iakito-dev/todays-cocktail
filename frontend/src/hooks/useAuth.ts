import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// =======================================
// Hook
// =======================================
// AuthContextの使用を簡単にし、Providerの外で呼ばれた場合は明示的にエラーにする
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
