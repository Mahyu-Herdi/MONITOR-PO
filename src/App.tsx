/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { OperatorForm } from './components/OperatorForm';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicOverview } from './components/PublicOverview';
import { LogIn, Lock, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { GAS_URL } from './lib/utils';

type Role = 'GUEST' | 'OPERATOR' | 'ADMIN';

export default function App() {
  const [appAuthenticated, setAppAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('app_authenticated') === 'true';
  });
  const [appPassword, setAppPassword] = useState('');
  const [appLoginError, setAppLoginError] = useState('');
  const [isAppLoggingIn, setIsAppLoggingIn] = useState(false);

  const [role, setRole] = useState<Role>(() => {
    const savedRole = localStorage.getItem('app_role');
    return (savedRole as Role) || 'GUEST';
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSetRole = (newRole: Role) => {
    setRole(newRole);
    localStorage.setItem('app_role', newRole);
  };

  const handleAppLogout = () => {
    setAppAuthenticated(false);
    localStorage.removeItem('app_authenticated');
    localStorage.removeItem('admin_authenticated');
    setAppPassword('');
    setRole('GUEST');
    localStorage.setItem('app_role', 'GUEST');
  };

  const handleAppLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppLoginError('');
    setIsAppLoggingIn(true);
    
    if (!GAS_URL) {
      setAppLoginError('URL Server belum dikonfigurasi!');
      setIsAppLoggingIn(false);
      return;
    }

    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append('action', 'app_login');
      bodyParams.append('password', appPassword);

      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams,
      });
      const data = await res.json();
      if (data.success) {
        setAppAuthenticated(true);
        localStorage.setItem('app_authenticated', 'true');
        handleSetRole('GUEST');
      } else {
        setAppLoginError(data.message || 'Sandi aplikasi salah!');
      }
    } catch (err) {
      setAppLoginError('Terjadi kesalahan koneksi server.');
    } finally {
      setIsAppLoggingIn(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    if (!GAS_URL) {
      setLoginError('URL Server belum dikonfigurasi!');
      setIsLoggingIn(false);
      return;
    }

    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append('action', 'login');
      bodyParams.append('password', adminPassword);

      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams,
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('admin_authenticated', 'true');
        handleSetRole('ADMIN');
        setShowAdminLogin(false);
        setAdminPassword('');
      } else {
        setLoginError(data.message || 'Password salah!');
      }
    } catch (err) {
      setLoginError('Terjadi kesalahan koneksi server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!appAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 w-full max-w-md mx-auto">
        <div className="neo-card p-8 w-full text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="w-8 h-8 text-blue-custom" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-blue-custom tracking-tight leading-none mb-2">MONITORING DISTRIBUSI</h1>
          <p className="text-xs font-bold text-muted mb-6 uppercase tracking-wider">Akses Aplikasi Terkunci</p>
          
          <form onSubmit={handleAppLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                value={appPassword}
                onChange={e => setAppPassword(e.target.value)}
                placeholder="Masukkan Sandi Aplikasi" 
                className="neo-input w-full p-4 rounded-xl text-center font-bold text-lg min-h-[56px]"
              />
            </div>
            {appLoginError && <p className="text-red-500 font-bold text-sm">{appLoginError}</p>}
            <button 
              disabled={isAppLoggingIn} 
              type="submit" 
              className="neo-btn-primary w-full p-4 rounded-xl font-bold text-lg h-14 flex items-center justify-center gap-2"
            >
              {isAppLoggingIn ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Membuka...</>
              ) : (
                "BUKA APLIKASI"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 pb-24 w-full xl:max-w-none xl:px-12 mx-auto">
      {/* HEADER */}
      <header className="neo-card p-4 md:p-6 mb-6 md:mb-8 w-full relative flex flex-col lg:flex-row items-center justify-center gap-4">
        <div className="hidden lg:block lg:flex-1"></div>
        
        <div className="text-center z-10">
          <h1 className="text-xl md:text-2xl font-black text-blue-custom m-0 tracking-tight">MONITORING DISTRIBUSI</h1>
          <p className="text-xs md:text-sm font-bold text-muted mt-1">Sistem Input & Validasi PO Dapur</p>
        </div>
        
        <div className="flex-1 flex flex-row justify-center lg:justify-end items-center gap-3 sm:gap-4 z-10 w-full lg:w-auto flex-wrap">
          {role === 'GUEST' && !showAdminLogin ? (
            <>
               <button 
                  onClick={() => handleSetRole('OPERATOR')}
                  className="neo-btn blue px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Masuk Operator
                </button>
                <button 
                  onClick={() => {
                    if (localStorage.getItem('admin_authenticated') === 'true') {
                      handleSetRole('ADMIN');
                    } else {
                      setShowAdminLogin(true);
                    }
                  }}
                  className="neo-btn green px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Masuk Admin
                </button>
            </>
          ) : (
            <button 
              onClick={() => { 
                if (role === 'ADMIN') {
                  localStorage.removeItem('admin_authenticated');
                }
                handleSetRole('GUEST'); 
                setShowAdminLogin(false); 
              }}
              className="neo-btn red px-4 py-2.5 text-xs sm:text-sm flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> {showAdminLogin && role === 'GUEST' ? 'KEMBALI' : 'KELUAR'}
            </button>
          )}
        </div>
      </header>

      <main className="w-full">
        {role === 'GUEST' && !showAdminLogin && (
          <div className="animate-in fade-in duration-500">
            <PublicOverview onLogout={handleAppLogout} />
          </div>
        )}

        {showAdminLogin && role === 'GUEST' && (
          <div className="neo-card p-8 max-w-md mx-auto mt-16 text-center animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-xl font-black text-blue-custom mb-6">Login Super Admin</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password" 
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Masukkan Password" 
                className="neo-input w-full p-4 rounded-xl text-center font-bold text-lg min-h-[56px]"
              />
              {loginError && <p className="text-red-500 font-bold text-sm">{loginError}</p>}
              <button disabled={isLoggingIn} type="submit" className="neo-btn green w-full p-4 rounded-xl font-bold text-lg h-14 flex items-center justify-center gap-2">
                {isLoggingIn ? <><Loader2 className="w-5 h-5 animate-spin" /> Sedang Login...</> : "LOGIN ADMIN"}
              </button>
            </form>
          </div>
        )}

        {role === 'OPERATOR' && <OperatorForm />}
        
        {role === 'ADMIN' && <AdminDashboard />}
      </main>
    </div>
  );
}
