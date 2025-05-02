import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import useAuthStore from '../../store/useAuthStore.ts';
import { universities } from '../../data/universities';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-hot-toast';

interface SignUpFormProps {
  onToggleForm: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleForm }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [school, setSchool] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const { signUp, login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSchoolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSchool(value);
    
    if (value.length > 0) {
      const filtered = universities.filter(uni => 
        uni.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSchools(filtered.slice(0, 5)); // Limit to 5 results
      setShowSchoolDropdown(true);
    } else {
      setShowSchoolDropdown(false);
    }
  };

  const handleSelectSchool = (selectedSchool: string) => {
    setSchool(selectedSchool);
    setShowSchoolDropdown(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Check password strength
    if (value.length === 0) {
      setPasswordStrength(null);
    } else if (value.length < 8) {
      setPasswordStrength('weak');
    } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)) {
      setPasswordStrength('strong');
    } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value)) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('weak');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordStrength === 'weak') {
      toast.error('Please use a stronger password');
      return;
    }
    
    try {
      // Pass arguments individually as expected by useAuthStore
      await signUp(email, password, name, school, avatarFile);

      // Attempt automatic login after successful signup
      try {
        // Pass email and password as individual arguments to match useAuthStore.login definition
        await login(email, password);
        toast.success('Account created successfully! Logging you in...');
        navigate('/'); // Navigate to home page after successful auto-login
      } catch (loginError: any) {
        // If auto-login fails (should be rare after signup), log error and send to login page
        console.error('Auto-login after signup failed:', loginError);
        toast.error(`Account created, but auto-login failed: ${loginError.message}. Please log in manually.`);
        navigate('/auth?mode=login');
      }
    } catch (err: any) {
      // Error during signUp is handled by useAuthStore
      console.error("Signup form handleSubmit error caught:", err);
      // No navigation change here, error is displayed via useAuthStore
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await loginWithGoogle();
      // OAuth flow handles redirect, no navigation needed here
    } catch (err: any) {
      toast.error(`Google Sign Up failed: ${err.message}`);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="font-handwriting text-3xl text-center mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg border border-secondary bg-paper"
            placeholder="John Doe"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-secondary bg-paper"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium mb-1">School/University</label>
          <input
            type="text"
            value={school}
            onChange={handleSchoolChange}
            className="w-full p-3 rounded-lg border border-secondary bg-paper"
            placeholder="Start typing your school name"
            required
          />
          
          {showSchoolDropdown && filteredSchools.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-paper border border-secondary rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredSchools.map((uni, index) => (
                <div 
                  key={index}
                  className="p-3 hover:bg-secondary cursor-pointer"
                  onClick={() => handleSelectSchool(uni)}
                >
                  {uni}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Avatar</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="w-full p-2 rounded-lg border border-secondary bg-paper"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className="w-full p-3 rounded-lg border border-secondary bg-paper"
            placeholder="••••••••"
            required
            minLength={8}
          />
          {password.length > 0 && (
            <div className="mt-1">
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getPasswordStrengthColor()}`}
                  style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }}
                ></div>
              </div>
              <p className="text-xs mt-1">
                {passwordStrength === 'weak' && 'Weak - Use at least 8 characters with uppercase, lowercase, numbers, and symbols'}
                {passwordStrength === 'medium' && 'Medium - Add special characters for stronger security'}
                {passwordStrength === 'strong' && 'Strong password'}
              </p>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-secondary bg-paper"
            placeholder="••••••••"
            required
            minLength={8}
          />
        </div>
        
        <Button
          variant="primary"
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-paper text-text">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
        >
          <FcGoogle size={20} />
          <span>Sign up with Google</span>
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-text">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggleForm}
            className="text-leather hover:underline"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
