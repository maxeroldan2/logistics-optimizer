import React from 'react';
import { ArrowDown, BarChart2, BrainCircuit, Database, Lock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface PremiumFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const PremiumFeature: React.FC<PremiumFeatureProps> = ({ 
  icon, 
  title, 
  description,
  comingSoon = false
}) => (
  <div className="relative bg-white rounded-lg shadow-sm p-4 border border-gray-100">
    {comingSoon && (
      <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">
        Coming Soon
      </div>
    )}
    <div className="flex items-start">
      <div className="flex-shrink-0 bg-blue-100 rounded-full p-2 mr-3">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </div>
);

const PremiumFeatures: React.FC = () => {
  const { isPremiumUser } = useAppContext();
  
  if (isPremiumUser) return null;
  
  return (
    <div className="mt-8 mb-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Premium Features</h2>
        <p className="text-gray-600">Unlock these advanced features with a premium subscription</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PremiumFeature
          icon={<Database className="h-5 w-5 text-blue-600" />}
          title="Save & Compare Shipments"
          description="Save multiple shipments and compare their profitability side-by-side."
        />
        
        <PremiumFeature
          icon={<BrainCircuit className="h-5 w-5 text-blue-600" />}
          title="AI Dimension Autocompletion"
          description="Let AI automatically fill in product dimensions based on the name."
        />
        
        <PremiumFeature
          icon={<ArrowDown className="h-5 w-5 text-blue-600" />}
          title="Dumping Penalizer"
          description="Automatically adjust scores based on market saturation for more realistic profit estimates."
        />
        
        <PremiumFeature
          icon={<BarChart2 className="h-5 w-5 text-blue-600" />}
          title="Advanced Demand Models"
          description="Use exponential, elasticity-based, and econometric models to predict sales."
          comingSoon
        />
        
        <PremiumFeature
          icon={<Lock className="h-5 w-5 text-blue-600" />}
          title="40+ Market Presets"
          description="Access pre-configured market variables for 40 countries with editable parameters."
          comingSoon
        />
      </div>
    </div>
  );
};

export default PremiumFeatures;