import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { BookOpen, Upload, ArrowRight, Users, User } from 'lucide-react';
import RecentActivity from '../components/home/RecentActivity';
import useAuthStore from '../store/useAuthStore';

const HomePage = () => {
  console.log('HomePage rendering');
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  
  const features = [
    {
      title: 'Upload',
      description: 'Upload your study materials and let AI help you learn.',
      icon: Upload,
      action: () => navigate('/upload'),
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Study',
      description: 'Access your study materials and track your progress.',
      icon: BookOpen,
      action: () => navigate('/study'),
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Library',
      description: 'Access your saved study materials and resources.',
      icon: BookOpen,
      action: () => navigate('/library'),
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Profile',
      description: 'View your learning progress and customize settings.',
      icon: User,
      action: () => navigate('/profile'),
      color: 'bg-indigo-100 text-indigo-800'
    },
  ];
  
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8">
      {/* Hero Section */}
      <section className="mb-8 md:mb-12">
        <Card className="p-6 md:p-8 lg:p-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h1 className="font-handwriting text-3xl md:text-4xl lg:text-5xl mb-4">
                {currentUser ? `Welcome back, ${currentUser.name}!` : 'Your AI Study Companion'}
              </h1>
              <p className="text-base md:text-lg mb-6 text-text opacity-80">
                Transform your study materials into interactive learning experiences with the power of AI. 
                Upload your documents and let Study Flares do the rest.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <Button 
                  size="md" 
                  onClick={() => navigate('/upload')}
                  leftIcon={<Upload size={18} />}
                  className="text-sm md:text-base"
                >
                  Upload Materials
                </Button>
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={() => navigate('/study')}
                  className="text-sm md:text-base"
                >
                  Explore Features
                </Button>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="aspect-video bg-leather bg-opacity-20 rounded-xl flex items-center justify-center">
                <p className="font-handwriting text-lg md:text-xl text-leather">
                  [Illustration: Student with AI assistant]
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>
      
      {/* Recent Activity Section */}
      <section className="mb-8 md:mb-12">
        <RecentActivity maxItems={3} showViewAll={true} />
      </section>
      
      {/* Features */}
      <section>
        <h2 className="font-handwriting text-2xl md:text-3xl mb-4 md:mb-6">Explore Features</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-4 md:p-6 h-full" 
              interactive 
              onClick={feature.action}
            >
              <div className="flex items-start">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${feature.color} flex items-center justify-center mr-3 md:mr-4`}>
                  <feature.icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-handwriting text-lg md:text-xl mb-1 md:mb-2">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-text opacity-70">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
