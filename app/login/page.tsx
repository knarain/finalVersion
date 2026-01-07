'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface ModalState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [modal, setModal] = useState<ModalState>({ show: false, type: 'success', message: '' });
  const router = useRouter();

  // Load CAPTCHA on mount
  useEffect(() => {
    loadCaptcha();
  }, []);

  // Auto-hide modal after 2 seconds
  useEffect(() => {
    if (modal.show) {
      const timer = setTimeout(() => {
        setModal({ ...modal, show: false });
        // If success, redirect after modal disappears
        if (modal.type === 'success') {
          router.push('/admin');
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [modal, router]);

  const loadCaptcha = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/captcha`);
      if (res.data.results) {
        setCaptchaId(res.data.results.captcha_id);
        setCaptchaImage(res.data.results.captcha_image);
        setCaptchaText('');
        setError('');
      }
    } catch (err) {
      setError('Failed to load CAPTCHA');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        captcha_id: captchaId,
        captcha_text: captchaText,
      };

      // Add 2FA data if we're verifying 2FA
      if (requires2FA) {
        payload['2fa_code'] = twoFactorCode;
        payload['admin_id'] = adminId;
      } else {
        // Otherwise send username and password
        payload['username'] = username;
        payload['password'] = password;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/login`,
        payload,
        {
          withCredentials: true,
        }
      );

      if (res.data.results?.requires_2fa) {
        // Need 2FA
        setAdminId(res.data.results.admin_id);
        setRequires2FA(true);
        setTwoFactorCode('');
        setError('2FA code sent to your email');
        // Don't reset attempts here, keep showing current attempts
        return;
      }

      if (res.data.results?.token) {
        // ✅ Save token to localStorage
        localStorage.setItem('adminToken', res.data.results.token);
        localStorage.setItem('adminUsername', res.data.results.admin.username);

        // Show success modal (auto-redirects after 2 seconds)
        setModal({ 
          show: true, 
          type: 'success', 
          message: 'Login successful! Redirecting...' 
        });
        setError('');
        setUsername('');
        setPassword('');
        setCaptchaText('');
        setTwoFactorCode('');
      } else {
        setModal({ 
          show: true, 
          type: 'error', 
          message: res.data.message || 'Login failed' 
        });
        loadCaptcha();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorData = err.response?.data;
      const errorMsg = errorData?.message || err.message || 'Login failed. Please try again.';
      const attempts = errorData?.results?.attempts_left ?? attemptsLeft;
      
      setAttemptsLeft(attempts);
      
      // Format error message with attempts
      let displayMsg = errorMsg;
      if (errorMsg.toLowerCase().includes('invalid credentials') || errorMsg.toLowerCase().includes('invalid 2fa')) {
        displayMsg = `${errorMsg}\n\nAttempts left: ${attempts}`;
      }
      
      setModal({ 
        show: true, 
        type: 'error', 
        message: displayMsg 
      });
      
      // Only reload CAPTCHA if not in 2FA mode
      if (!requires2FA) {
        loadCaptcha();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
        <h1 className="text-3xl font-extrabold mb-6 text-center">Admin Login</h1>

        {error && <div className="bg-red-900 px-4 py-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          {!requires2FA ? (
            <>
              <div>
                <label className="block mb-1 text-sm font-medium">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
                  required
                />
              </div>

              {/* CAPTCHA */}
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <label className="block mb-2 text-sm font-medium">CAPTCHA</label>
                {captchaImage && (
                  <img 
                    src={captchaImage} 
                    alt="CAPTCHA" 
                    className="w-full max-w-xs mx-auto mb-3 rounded bg-white p-1 border border-gray-600"
                  />
                )}
                <input
                  type="text"
                  value={captchaText}
                  onChange={e => setCaptchaText(e.target.value.toUpperCase())}
                  placeholder="Enter CAPTCHA text"
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 uppercase text-center tracking-widest"
                  maxLength={5}
                  required
                />
                <button
                  type="button"
                  onClick={loadCaptcha}
                  className="mt-2 text-xs text-yellow-400 hover:text-yellow-300 w-full text-center"
                >
                  Get new CAPTCHA
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !captchaId}
                className="w-full py-2 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-600 transition disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </>
          ) : (
            <>
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-200">Enter the 2FA code sent to your email</p>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">2FA Code</label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <div className="text-sm text-gray-400">
                Attempts left: <span className={attemptsLeft <= 2 ? 'text-red-400 font-bold' : 'text-gray-300'}>{attemptsLeft}</span>
              </div>

              <button
                type="submit"
                disabled={loading || twoFactorCode.length !== 6}
                className="w-full py-2 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-600 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify 2FA'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setTwoFactorCode('');
                  setAdminId('');
                  loadCaptcha();
                }}
                className="w-full py-2 text-gray-400 hover:text-white text-sm"
              >
                Back to Login
              </button>
            </>
          )}
        </form>
      </div>

      {/* Success/Error Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-8 max-w-sm w-full mx-4 text-center ${
            modal.type === 'success' 
              ? 'bg-green-900/80 border border-green-600' 
              : 'bg-red-900/80 border border-red-600'
          }`}>
            <div className="text-4xl mb-4">
              {modal.type === 'success' ? '✓' : '✗'}
            </div>
            <p className="text-white font-semibold whitespace-pre-line">{modal.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
