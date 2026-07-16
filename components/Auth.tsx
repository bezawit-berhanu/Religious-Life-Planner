import React, { useState } from 'react';
import { User, Gender } from '../types';
import { Cross, ArrowRight, AlertCircle, Facebook, ArrowLeft, User as UserIcon, Loader2 } from 'lucide-react';
import { storage, t } from '../utils';

interface AuthProps {
  onLogin: (user: User, isNew: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'passcode'>('passcode');

  // Check for saved users on mount
  React.useEffect(() => {
      const db = storage.getUsersDB();
      if (db.length > 0) {
          // Auto-fill email of last user if available
          setEmail(db[db.length - 1].email);
      }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (isLogin) {
        if (loginMethod === 'passcode') {
            const result = storage.authenticatePasscode(email, passcode);
            if (result.success && result.user) {
                onLogin(result.user, false);
            } else {
                if (result.error === 'not_found') {
                    setError("Account not found. Please create an account.");
                } else {
                    setError("Incorrect passcode.");
                }
            }
        } else {
            const result = storage.authenticate(email, password);
            if (result.success && result.user) {
                onLogin(result.user, false);
            } else {
                if (result.error === 'not_found') {
                    setError("Account not found. Please create an account.");
                } else {
                    setError("Incorrect password.");
                }
            }
        }
    } else {
        // Registration
        if (!username.trim()) {
            setError('Username is required');
            setLoading(false);
            return;
        }

        const passwordRegex = /^[a-zA-Z0-9]+$/;
        if (!passwordRegex.test(password)) {
            setError('Password must contain only letters and numbers.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        if (passcode.length !== 4 || isNaN(Number(passcode))) {
            setError('Passcode must be exactly 4 digits.');
            setLoading(false);
            return;
        }

        const newUser: User = {
          id: Date.now().toString(),
          name: name || 'Faithful User',
          username: username || 'user',
          email: email,
          password: password,
          passcode: passcode,
          age: parseInt(age) || 25,
          gender: gender,
          isRegistered: true,
          followers: 0,
          following: 0,
          bio: 'Orthodox Christian',
          lastActive: Date.now(),
          hasSeenOnboarding: false 
        };

        const success = storage.registerUser(newUser);
        if (success) {
            onLogin(newUser, true);
        } else {
            setError("Email already registered. Please log in.");
        }
    }
    setLoading(false);
  };

  const initiateSocialLogin = (provider: string) => {
      // Simulate OAuth Popup Flow
      const width = 600;
      const height = 700;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2;
      
      // In a real app, this would be the provider's OAuth URL
      // For this demo, we'll open a blank window and simulate the callback
      const popup = window.open(
          'about:blank', 
          'oauth_popup', 
          `width=${width},height=${height},top=${top},left=${left}`
      );

      if (popup) {
          popup.document.write(`
              <html>
                  <head><title>${provider} Login</title></head>
                  <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f0f2f5;">
                      <h2 style="color: #333;">Connecting to ${provider}...</h2>
                      <div style="margin-top: 20px; width: 40px; height: 40px; border: 4px solid #ddd; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                      <script>
                          setTimeout(() => {
                              window.opener.postMessage({ type: 'OAUTH_SUCCESS', provider: '${provider}' }, '*');
                              window.close();
                          }, 1500);
                      </script>
                  </body>
              </html>
          `);
      }
  }

  React.useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'OAUTH_SUCCESS') {
              const provider = event.data.provider;
              // Simulate getting user info from provider
              const mockName = provider === 'Google' ? 'Abebe Kebede' : 'Sara Tesfaye';
              completeSocialLogin(mockName, provider);
          }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
  }, []);

  const completeSocialLogin = async (accountName: string, provider: string) => {
      setLoading(true);
      
      const email = `${accountName.toLowerCase().replace(' ', '.')}@${provider.toLowerCase()}.com`;
      
      // Check if user exists in DB
      const db = storage.getUsersDB();
      let user = db.find(u => u.email === email);
      let isNew = false;

      if (!user) {
          // Create new social user
          user = {
            id: Date.now().toString(),
            name: accountName,
            username: `${accountName.toLowerCase().replace(' ', '_')}_${provider.toLowerCase()}`,
            email: email,
            age: 25,
            gender: 'Male',
            isRegistered: true,
            followers: 0,
            following: 0,
            bio: `Joined via ${provider}`,
            lastActive: Date.now(),
            hasSeenOnboarding: false,
            passcode: '0000' // Default passcode for social login
          };
          storage.registerUser(user);
          isNew = true;
      }

      onLogin(user, isNew);
      setLoading(false);
  }

  return (
    <div className="min-h-screen bg-ols-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-ols-accent/20 animate-fade-in relative">
        <div className="bg-ols-primary p-8 text-center text-white relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
            
             {!isLogin && (
                 <button 
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className="absolute left-4 top-4 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold"
                 >
                     <ArrowLeft size={16} /> Back
                 </button>
             )}

            <div className="w-16 h-16 bg-ols-secondary rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20">
                <Cross size={32} className="text-ols-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-2">ORTHODOX</h1>
            <p className="text-ols-secondary text-sm font-medium tracking-wide">LIFE SYSTEM</p>
        </div>

        <div className="p-8">
            <h2 className="text-xl font-bold text-ols-primary text-center mb-6">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="animate-fade-in space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-ols-muted uppercase mb-1">Full Name</label>
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-ols-secondary focus:ring-1 focus:ring-ols-secondary outline-none transition-all"
                                placeholder="Abebe Bikila"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-ols-muted uppercase mb-1">Username</label>
                            <input 
                                type="text" 
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-ols-secondary focus:ring-1 focus:ring-ols-secondary outline-none transition-all"
                                placeholder="@username"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                             <div className="flex-1">
                                <label className="block text-xs font-bold text-ols-muted uppercase mb-1">Age</label>
                                <input 
                                    type="number" 
                                    required
                                    min="13"
                                    max="120"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-ols-secondary outline-none"
                                />
                             </div>
                             <div className="flex-1">
                                <label className="block text-xs font-bold text-ols-muted uppercase mb-1">Gender</label>
                                <select 
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value as Gender)}
                                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-ols-secondary outline-none appearance-none"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                             </div>
                        </div>
                    </div>
                )}
                
                <div>
                    <label className="block text-xs font-bold text-ols-muted uppercase mb-1">Email</label>
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-ols-secondary focus:ring-1 focus:ring-ols-secondary outline-none transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                {isLogin ? (
                    <div className="space-y-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg mb-2">
                            <button
                                type="button"
                                onClick={() => setLoginMethod('passcode')}
                                className={`flex-1 py-1 text-sm font-bold rounded-md transition-all ${loginMethod === 'passcode' ? 'bg-white shadow-sm text-ols-primary' : 'text-gray-500'}`}
                            >
                                Passcode
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('password')}
                                className={`flex-1 py-1 text-sm font-bold rounded-md transition-all ${loginMethod === 'password' ? 'bg-white shadow-sm text-ols-primary' : 'text-gray-500'}`}
                            >
                                Password
                            </button>
                        </div>

                        {loginMethod === 'passcode' ? (
                            <div>
                                <label className="block text-xs font-bold text-ols-muted uppercase mb-1">Enter 4-Digit Passcode</label>
                                <input 
                                    type="password" 
                                    required
                                    maxLength={4}
                                    value={passcode}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setPasscode(val);
                                    }}
                                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-ols-secondary focus:ring-1 focus:ring-ols-secondary outline-none transition-all text-center tracking-[0.5em] text-xl font-mono"
                                    placeholder="••••"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-ols-muted uppercase mb-1">Password</label>
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-ols-secondary focus:ring-1 focus:ring-ols-secondary outline-none transition-all"
                                    placeholder="Enter your password"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-ols-muted uppercase mb-1">Create Password</label>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-ols-secondary focus:ring-1 focus:ring-ols-secondary outline-none transition-all"
                                placeholder="Numbers & letters only"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-ols-muted uppercase mb-1">Create 4-Digit Passcode</label>
                            <input 
                                type="password" 
                                required
                                maxLength={4}
                                value={passcode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setPasscode(val);
                                }}
                                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:border-ols-secondary focus:ring-1 focus:ring-ols-secondary outline-none transition-all text-center tracking-[0.5em] text-xl font-mono"
                                placeholder="••••"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Use this for quick login later.</p>
                        </div>
                    </>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
                        <AlertCircle size={16} />
                        {error}
                        {error.includes("Account not found") && (
                             <button 
                                onClick={() => { setIsLogin(false); setError(''); }}
                                className="underline font-bold ml-1 hover:text-red-800"
                             >
                                 Create one?
                             </button>
                        )}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-ols-primary text-white py-3 rounded-lg font-bold shadow-lg hover:bg-[#3E2723] transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (isLogin ? (loginMethod === 'passcode' ? 'Quick Login' : 'Sign In') : 'Create Account')}
                    {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
                <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={() => initiateSocialLogin('Google')}
                    className="flex-1 py-2 rounded-lg border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                    <span className="font-bold text-gray-700">Google</span>
                </button>
                <button 
                     onClick={() => initiateSocialLogin('Facebook')}
                    className="flex-1 py-2 rounded-lg border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                    <Facebook size={18} className="text-blue-600" />
                    <span className="font-bold text-gray-700">Facebook</span>
                </button>
            </div>

            <div className="mt-6 text-center">
                <p className="text-sm text-ols-muted">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-ols-secondary font-bold ml-1 hover:underline"
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;