'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuthProps {
  onAuthenticated: (userId: string, userName: string, isAdmin: boolean) => void;
}

type Step = 'password' | 'select-user' | 'register';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  initials: string;
  is_admin: boolean;
}

// ── Styles ───────────────────────────────────────────────────────────────────
const WIT_STYLES = `
  :root {
    --wit-bg: #F5F2EE;
    --wit-card: #FFFFFF;
    --wit-text: #2E2926;
    --wit-muted: #7A7370;
    --wit-accent: #9B2335;
    --wit-accent-hover: #7D1C2B;
    --wit-border: rgba(46,41,38,0.12);
    --wit-input-bg: #FAFAF9;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --wit-bg: #1C1917;
      --wit-card: #28231F;
      --wit-text: #EAE5DF;
      --wit-muted: #9E9690;
      --wit-accent: #7D1C2B;
      --wit-accent-hover: #6B1724;
      --wit-border: rgba(234,229,223,0.12);
      --wit-input-bg: #201C18;
    }
  }
  .wit-page {
    min-height: 100dvh;
    background: var(--wit-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    font-family: 'Inter', sans-serif;
  }
  .wit-card {
    background: var(--wit-card);
    border: 0.5px solid var(--wit-border);
    border-radius: 20px;
    padding: 2.5rem 2rem 2rem;
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.75rem;
  }
  .wit-logo {
    width: 220px;
    height: auto;
  }
  .wit-wordmark { fill: #2E2926; }
  @media (prefers-color-scheme: dark) {
    .wit-wordmark { fill: #EAE5DF; }
  }
  .wit-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }
  .wit-label {
    font-size: 13px;
    color: var(--wit-muted);
    text-align: center;
    line-height: 1.5;
  }
  .wit-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .wit-input-icon {
    position: absolute;
    left: 14px;
    color: var(--wit-muted);
    opacity: 0.5;
    pointer-events: none;
  }
  .wit-input {
    width: 100%;
    background: var(--wit-input-bg);
    border: 0.5px solid var(--wit-border);
    border-radius: 12px;
    padding: 14px 14px 14px 40px;
    font-size: 16px;
    color: var(--wit-text);
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.15s;
    -webkit-appearance: none;
  }
  .wit-input:focus { border-color: var(--wit-accent); }
  .wit-input::placeholder { color: transparent; }
  .wit-input-plain {
    width: 100%;
    background: var(--wit-input-bg);
    border: 0.5px solid var(--wit-border);
    border-radius: 12px;
    padding: 14px;
    font-size: 16px;
    color: var(--wit-text);
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.15s;
    -webkit-appearance: none;
  }
  .wit-input-plain:focus { border-color: var(--wit-accent); }
  .wit-input-plain::placeholder { color: var(--wit-muted); opacity: 0.6; }
  .wit-btn {
    width: 100%;
    background: var(--wit-accent);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 15px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background 0.15s, transform 0.1s;
    margin-top: 4px;
  }
  .wit-btn:hover:not(:disabled) { background: var(--wit-accent-hover); }
  .wit-btn:active:not(:disabled) { transform: scale(0.98); }
  .wit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .wit-error {
    font-size: 13px;
    color: var(--wit-accent);
    text-align: center;
  }
  .wit-user-grid {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .wit-user-btn {
    width: 100%;
    background: var(--wit-input-bg);
    border: 0.5px solid var(--wit-border);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 15px;
    color: var(--wit-text);
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s, background 0.15s;
  }
  .wit-user-btn:hover {
    border-color: var(--wit-accent);
    background: var(--wit-card);
  }
  .wit-section-label {
    font-size: 13px;
    color: var(--wit-muted);
    text-align: center;
    width: 100%;
  }
  .wit-link {
    background: none;
    border: none;
    color: var(--wit-accent);
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
  }
  .wit-divider {
    width: 100%;
    border: none;
    border-top: 0.5px solid var(--wit-border);
    margin: 0;
  }
`;

// ── Logo — outside Auth to avoid hook rule violations ────────────────────────
function Logo() {
  return (
    <svg className="wit-logo" viewBox="0 0 482 264" xmlns="http://www.w3.org/2000/svg" style={{fillRule:'evenodd',clipRule:'evenodd',strokeLinecap:'round',strokeLinejoin:'round'}}>
      <text x="73.771" y="182.897" className="wit-wordmark" style={{fontFamily:"'Inter',sans-serif",fontSize:'50px'}}>Words  Word</text>
      <g transform="matrix(0.87,0,0,1,7.73621,0)">
        <g transform="matrix(91.6667,0,0,91.6667,247.887,117.543)">
          <path d="M0.225,-0.002c-0.009,-0.003 -0.017,-0.006 -0.023,-0.01c-0.006,-0.003 -0.014,-0.009 -0.024,-0.018c-0.008,-0.011 -0.014,-0.021 -0.019,-0.03c-0.004,-0.009 -0.007,-0.02 -0.008,-0.033c-0.001,-0.012 -0.002,-0.028 -0.002,-0.047c-0,-0.008 0.001,-0.02 0.004,-0.036c0.003,-0.016 0.007,-0.033 0.011,-0.05c0.005,-0.018 0.009,-0.034 0.012,-0.048c0.004,-0.014 0.006,-0.023 0.007,-0.027c0.002,-0.009 -0.001,-0.014 -0.01,-0.015c-0.009,-0.001 -0.018,-0.002 -0.029,-0.001c-0.01,-0 -0.017,-0.001 -0.02,-0.003c-0.003,-0.001 -0.004,-0.002 -0.004,-0.003l-0,-0.003c-0,-0.003 -0,-0.004 -0.001,-0.005c0,-0.001 -0.001,-0.004 -0.003,-0.007c-0.001,-0.003 -0.001,-0.006 0.002,-0.011c0.003,-0.005 0.009,-0.009 0.016,-0.01c0.006,-0.001 0.014,-0.002 0.024,-0.003c0.011,-0.001 0.021,-0.004 0.032,-0.007c0.011,-0.004 0.019,-0.01 0.026,-0.018c0.006,-0.015 0.013,-0.031 0.021,-0.049c0.008,-0.018 0.016,-0.034 0.023,-0.048c0.008,-0.015 0.013,-0.024 0.016,-0.027c0.011,-0.006 0.02,-0.008 0.025,-0.007c0.005,0.001 0.011,0.006 0.018,0.017c0.003,0.005 0.006,0.008 0.007,0.011c0.002,0.003 0.002,0.007 0.001,0.012c-0.001,0.005 -0.005,0.014 -0.011,0.025c-0.005,0.011 -0.014,0.028 -0.025,0.049c-0.003,0.007 -0.006,0.013 -0.009,0.018c-0.003,0.005 -0.004,0.007 -0.004,0.007c0.003,0.001 0.007,0.001 0.012,0.001c0.005,0 0.012,-0 0.02,-0.001c0.007,-0.001 0.017,-0.002 0.028,-0.003c0.011,-0.001 0.02,-0.001 0.027,0c0.015,0 0.027,0.003 0.034,0.009c0.007,0.005 0.011,0.015 0.012,0.028c0.001,0.007 -0,0.012 -0.005,0.013c-0.004,0.001 -0.015,0.002 -0.033,0.002c-0.006,0 -0.015,0 -0.028,0.001c-0.013,0.001 -0.026,0.001 -0.04,0.002c-0.013,0.001 -0.025,0.002 -0.035,0.003c-0.009,0.001 -0.014,0.002 -0.014,0.003c-0.002,0.001 -0.005,0.008 -0.01,0.019c-0.004,0.011 -0.008,0.024 -0.013,0.038c-0.004,0.015 -0.008,0.028 -0.011,0.039c-0.005,0.023 -0.008,0.045 -0.011,0.068c-0.002,0.023 -0.002,0.042 -0.001,0.059c0.001,0.017 0.005,0.028 0.011,0.035c0.006,0.006 0.018,0.007 0.035,0.003c0.017,-0.003 0.031,-0.009 0.042,-0.018c0.012,-0.01 0.022,-0.015 0.029,-0.015c0.008,-0 0.012,0.003 0.013,0.01c0.001,0.007 -0.002,0.017 -0.011,0.03c-0.008,0.012 -0.018,0.023 -0.03,0.032c-0.012,0.009 -0.025,0.015 -0.038,0.019c-0.013,0.003 -0.025,0.003 -0.036,0Z" style={{fill:'#9b2335',fillRule:'nonzero'}}/>
        </g>
        <g transform="matrix(91.6667,0,0,91.6667,278.228,117.543)">
          <path d="M0.448,-0.022c-0.013,0.003 -0.022,0.004 -0.028,0.003c-0.006,-0.001 -0.014,-0.006 -0.024,-0.016c-0.006,-0.009 -0.011,-0.018 -0.016,-0.025c-0.005,-0.007 -0.008,-0.02 -0.009,-0.039c-0.001,-0.013 0,-0.027 0.003,-0.042c0.002,-0.014 0.003,-0.025 0.002,-0.032c0.005,-0.025 0.008,-0.044 0.007,-0.059c-0.001,-0.016 -0.004,-0.023 -0.007,-0.023c-0.007,-0.001 -0.02,0.006 -0.039,0.021c-0.019,0.016 -0.041,0.037 -0.065,0.062c-0.025,0.025 -0.049,0.051 -0.073,0.078c-0.013,0.017 -0.022,0.03 -0.027,0.039c-0.005,0.008 -0.009,0.012 -0.012,0.012c-0.005,0 -0.011,-0.002 -0.019,-0.005c-0.008,-0.003 -0.015,-0.007 -0.021,-0.012c-0.006,-0.005 -0.009,-0.01 -0.01,-0.014c0,-0.003 0.002,-0.01 0.005,-0.021c0.003,-0.012 0.008,-0.026 0.013,-0.041c0.005,-0.015 0.009,-0.03 0.013,-0.043c0.004,-0.013 0.007,-0.023 0.009,-0.028c0.006,-0.017 0.013,-0.039 0.022,-0.064c0.008,-0.025 0.015,-0.047 0.022,-0.066c0.003,-0.009 0.007,-0.021 0.014,-0.037c0.007,-0.017 0.013,-0.033 0.02,-0.05c0.007,-0.017 0.011,-0.029 0.014,-0.037c0.002,-0.005 0.022,-0.057 0.029,-0.074c0.006,-0.017 0.012,-0.032 0.017,-0.047c0.006,-0.014 0.01,-0.024 0.012,-0.031c-0.001,-0.006 -0,-0.011 0.001,-0.017c0.002,-0.005 0.004,-0.008 0.006,-0.011c0.003,0 0.006,-0 0.009,-0c0.003,-0.001 0.005,-0.001 0.005,-0.001c-0,-0.001 0.003,0 0.008,0.004c0.005,0.004 0.01,0.009 0.015,0.014c0.005,0.006 0.008,0.011 0.008,0.015c0.003,0.009 0.004,0.02 0.001,0.033c-0.003,0.014 -0.01,0.035 -0.021,0.062c-0.007,0.011 -0.015,0.027 -0.022,0.048c-0.007,0.021 -0.013,0.039 -0.02,0.054c-0.003,0.005 -0.008,0.015 -0.015,0.03c-0.007,0.015 -0.015,0.033 -0.024,0.054c-0.008,0.021 -0.017,0.042 -0.025,0.063c-0.008,0.02 -0.014,0.039 -0.019,0.056c-0.007,0.016 -0.009,0.027 -0.007,0.032c0.002,0.005 0.01,-0.001 0.024,-0.018c0.019,-0.02 0.038,-0.04 0.059,-0.061c0.021,-0.021 0.04,-0.038 0.058,-0.052c0.019,-0.015 0.034,-0.021 0.045,-0.02c0.006,0.001 0.013,0.005 0.02,0.012c0.007,0.007 0.013,0.014 0.02,0.023c0.007,0.009 0.011,0.017 0.014,0.025c0.003,0.01 0.004,0.019 0.005,0.026c0.002,0.007 0.002,0.018 0.001,0.032c-0.001,0.015 -0.002,0.037 -0.005,0.068c-0.004,0.023 -0.007,0.039 -0.008,0.048c-0.001,0.01 -0.001,0.017 0.001,0.021c0.003,0.004 0.007,0.008 0.012,0.013c0.01,0.008 0.015,0.015 0.015,0.021c0.001,0.006 -0.004,0.012 -0.013,0.017Z" style={{fill:'#9b2335',fillRule:'nonzero'}}/>
        </g>
        <g transform="matrix(91.6667,0,0,91.6667,319.845,117.543)">
          <path d="M0.196,0.003c-0.029,0 -0.053,-0.011 -0.072,-0.034c-0.019,-0.022 -0.028,-0.05 -0.027,-0.083c0.001,-0.024 0.006,-0.05 0.014,-0.078c0.009,-0.027 0.02,-0.054 0.034,-0.08c0.014,-0.025 0.029,-0.048 0.046,-0.067c0.017,-0.019 0.034,-0.033 0.052,-0.041c0.007,-0.003 0.014,-0.006 0.022,-0.008c0.007,-0.002 0.015,-0.003 0.023,-0.003c0.007,0 0.015,0.001 0.023,0.004c0.008,0.002 0.015,0.004 0.02,0.007c0.011,0.005 0.02,0.01 0.026,0.017c0.006,0.007 0.011,0.017 0.016,0.031c0.002,0.013 0.003,0.022 0.003,0.027c-0,0.005 -0.002,0.013 -0.005,0.024c-0.008,0.024 -0.018,0.045 -0.031,0.062c-0.013,0.017 -0.03,0.032 -0.051,0.044c-0.005,0.003 -0.012,0.006 -0.019,0.007c-0.007,0.002 -0.014,0.003 -0.021,0.003c-0.013,-0 -0.026,-0.003 -0.039,-0.008c-0.012,-0.005 -0.022,-0.012 -0.029,-0.022l-0.007,-0.008l-0.003,0.008c-0.007,0.018 -0.012,0.035 -0.016,0.05c-0.003,0.015 -0.005,0.029 -0.005,0.042c-0,0.008 0.001,0.016 0.002,0.023c0.002,0.007 0.005,0.014 0.008,0.019c0.003,0.004 0.007,0.007 0.013,0.008c0.007,0.002 0.014,0.003 0.021,0.003c0.005,-0 0.009,-0 0.014,-0.001c0.005,0 0.01,-0.001 0.015,-0.003c0.011,-0.004 0.02,-0.008 0.027,-0.013c0.007,-0.005 0.015,-0.01 0.022,-0.015l0.004,-0.002l-0.001,-0c0.008,-0.004 0.015,-0.008 0.021,-0.012c0.007,-0.004 0.01,-0.006 0.01,-0.006c0.003,-0 0.005,-0.002 0.008,-0.005c0.005,-0.003 0.012,-0.002 0.02,0.003c0.009,0.005 0.013,0.011 0.013,0.018c-0.001,0.003 -0.004,0.008 -0.009,0.015c-0.005,0.007 -0.011,0.014 -0.018,0.02c-0.006,0.006 -0.011,0.009 -0.015,0.01c-0.001,0.001 -0.003,0.002 -0.007,0.003c-0.004,0.002 -0.007,0.004 -0.008,0.005l0.001,-0c-0.006,0.008 -0.012,0.012 -0.018,0.012l-0.008,-0c-0.003,0.005 -0.011,0.01 -0.026,0.015c-0.015,0.006 -0.029,0.009 -0.043,0.009Zm0.045,-0.22c0.012,-0 0.022,-0.004 0.031,-0.011c0.009,-0.007 0.017,-0.014 0.024,-0.023c0.013,-0.018 0.021,-0.036 0.023,-0.053c0.003,-0.017 0.001,-0.028 -0.006,-0.035c-0.004,-0.002 -0.008,-0.003 -0.011,-0.004c-0.003,0 -0.008,0.001 -0.017,0.004c-0.006,0.001 -0.014,0.006 -0.025,0.015c-0.011,0.009 -0.021,0.018 -0.032,0.029c-0.01,0.011 -0.018,0.02 -0.023,0.027l-0.013,0.021c0.005,-0.002 0.01,-0.003 0.015,-0.004c0.005,0 0.008,0.001 0.009,0.002c-0,0.006 0.001,0.011 0.003,0.016c0.003,0.005 0.006,0.009 0.009,0.012c0.004,0.003 0.008,0.004 0.013,0.004Z" style={{fill:'#9b2335',fillRule:'nonzero'}}/>
        </g>
        <text x="167.312" y="117.543" style={{fontFamily:"'Caveat',cursive",fontSize:'91.667px',fill:'#9b2335'}}>in</text>
      </g>
      <g>
        <path d="M183.383,120.264c17.046,7.96 49.964,47.94 50.125,48.056" style={{fill:'none',stroke:'#9b2335',strokeWidth:'4.58px'}}/>
        <path d="M283.633,120.264c-17.046,7.96 -49.965,47.94 -50.125,48.056" style={{fill:'none',stroke:'#9b2335',strokeWidth:'4.58px'}}/>
      </g>
    </svg>
  );
}

// ── Card wrapper — outside Auth, renders styles on every step ────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="wit-page">
      <style>{WIT_STYLES}</style>
      <div className="wit-card">
        <Logo />
        {children}
      </div>
    </div>
  );
}

// ── Main Auth component ───────────────────────────────────────────────────────
export default function Auth({ onAuthenticated }: AuthProps) {
  const [step, setStep] = useState<Step>('password');
  const [groupKey, setGroupKey] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 'select-user') {
      fetchUsers();
    }
  }, [step]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, first_name, last_name, initials, is_admin')
      .order('first_name');
    if (data) setUsers(data);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: groupData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'group_password')
      .single();

    setLoading(false);

    if (groupData && groupData.value === groupKey) {
      setStep('select-user');
    } else {
      setError('Incorrect group key. Please try again.');
    }
  };

  const handleUserSelect = (user: User) => {
    const fullName = `${user.first_name} ${user.last_name}`;
    const isAdmin = user.is_admin === true;
    sessionStorage.setItem('userId', user.id);
    sessionStorage.setItem('userName', fullName);
    sessionStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    onAuthenticated(user.id, fullName, isAdmin);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();

    const { data: existingUser } = await supabase
      .from('users')
      .select('initials')
      .eq('initials', initials)
      .single();

    let finalInitials = initials;
    if (existingUser) {
      finalInitials = initials + '2';
    }

    const { data, error: insertError } = await supabase
      .from('users')
      .insert({ first_name: firstName, last_name: lastName, initials: finalInitials })
      .select()
      .single();

    setLoading(false);

    if (insertError || !data) {
      setError('Unable to register. Please try again.');
      return;
    }

    handleUserSelect(data);
  };

  // ── Step 1: Group key ───────────────────────────────────────────────────
  if (step === 'password') {
    return (
      <Card>
        <form className="wit-form" onSubmit={handlePasswordSubmit}>
          <div className="wit-label">Enter your group key to begin reading together</div>
          <div className="wit-input-wrap">
            <svg className="wit-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="15" r="5"/>
              <path d="M21 2l-9.3 9.3"/>
              <path d="M15 8l3 3"/>
            </svg>
            <input
              className="wit-input"
              type="password"
              value={groupKey}
              onChange={(e) => setGroupKey(e.target.value)}
              required
            />
          </div>
          {error && <p className="wit-error">{error}</p>}
          <button className="wit-btn" type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'Join your group'}
          </button>
        </form>
      </Card>
    );
  }

  // ── Step 2: Select user ─────────────────────────────────────────────────
  if (step === 'select-user') {
    return (
      <Card>
        <div className="wit-user-grid">
          <div className="wit-section-label">Who are you?</div>
          {users.map((user) => (
            <button
              key={user.id}
              className="wit-user-btn"
              onClick={() => handleUserSelect(user)}
            >
              {user.first_name} {user.last_name}
            </button>
          ))}
        </div>
        <hr className="wit-divider" />
        <button className="wit-link" onClick={() => setStep('register')}>
          I&rsquo;m new — create my account
        </button>
      </Card>
    );
  }

  // ── Step 3: Register ────────────────────────────────────────────────────
  return (
    <Card>
      <form className="wit-form" onSubmit={handleRegister}>
        <div className="wit-label">Create your account</div>
        <input
          className="wit-input-plain"
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          className="wit-input-plain"
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        {error && <p className="wit-error">{error}</p>}
        <button className="wit-btn" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Join your group'}
        </button>
      </form>
      <button className="wit-link" onClick={() => setStep('select-user')}>
        ← Back
      </button>
    </Card>
  );
}
