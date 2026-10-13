import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { connectWallet, isWalletAvailable } from '../services/web3';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState({
    isConnected: false,
    address: null,
    chainId: null,
  });

  const loadUsersAndSession = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch available profiles
      const usersData = await api.getUsers().catch(() => ({ users: [] }));
      const usersList = usersData.users || [];
      setAvailableUsers(usersList);

      // Determine active user
      const storedId = api.getUserId();
      let active = usersList.find((u) => u.id === storedId);

      if (!active && usersList.length > 0) {
        active = usersList[0];
        api.setUserId(active.id);
      }

      if (active) {
        setCurrentUser(active);
      } else {
        // Fallback default
        const me = await api.getCurrentUser().catch(() => null);
        if (me?.user) setCurrentUser(me.user);
      }
    } catch (err) {
      console.warn('Auth loading issue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsersAndSession();
  }, [loadUsersAndSession]);

  const switchUser = (userId) => {
    api.setUserId(userId);
    const target = availableUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    } else {
      loadUsersAndSession();
    }
  };

  const handleConnectWallet = async () => {
    try {
      const res = await connectWallet();
      setWallet({
        isConnected: true,
        address: res.address,
        chainId: res.chainId,
      });

      // Update backend profile with linked wallet address if available
      if (currentUser && res.address) {
        await api.updateProfile({ wallet_address: res.address }).catch(() => {});
        setCurrentUser((prev) => (prev ? { ...prev, wallet_address: res.address } : null));
      }

      return res;
    } catch (err) {
      console.error('Wallet connection failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers,
        loading,
        switchUser,
        wallet,
        connectWallet: handleConnectWallet,
        isWalletAvailable: isWalletAvailable(),
        refreshUser: loadUsersAndSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
