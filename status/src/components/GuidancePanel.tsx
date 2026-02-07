import { FileText, Shield, Building2, Users, Briefcase, DollarSign, Home, Plane } from 'lucide-react';
import { CountryData, getRiskLevel, getGuidance } from '../data/visaData';

interface GuidancePanelProps {
  country: CountryData;
}

const iconMap: Record<string, React.ReactNode> = {
  'Valid passport with 6+ months validity': <Plane className="w-5 h-5" />,
  'Proof of ties to home country (employment letter, property)': <Home className="w-5 h-5" />,
  'Bank statements showing sufficient funds': <DollarSign className="w-5 h-5" />,
  'Travel itinerary and accommodation details': <Plane className="w-5 h-5" />,
  '3-6 months of detailed bank statements': <DollarSign className="w-5 h-5" />,
  'Employment verification with salary details': <Briefcase className="w-5 h-5" />,
  'Tax returns or proof of consistent income': <FileText className="w-5 h-5" />,
  'Property ownership or long-term lease documents': <Home className="w-5 h-5" />,
  'Family ties documentation (marriage certificate, children\'s records)': <Users className="w-5 h-5" />,
  'Comprehensive financial portfolio (6+ months statements)': <DollarSign className="w-5 h-5" />,
  'Notarized employment contract with return-to-work guarantee': <Briefcase className="w-5 h-5" />,
  'Proof of immediate family remaining in home country': <Users className="w-5 h-5" />,
  'Property deeds, vehicle registration, business ownership': <Building2 className="w-5 h-5" />,
  'Previous travel history to other countries (if positive)': <Plane className="w-5 h-5" />,
  'Detailed letter explaining purpose and itinerary': <FileText className="w-5 h-5" />,
  'Complete financial documentation (12+ months history)': <DollarSign className="w-5 h-5" />,
  'Professional employment letter with specific return date': <Briefcase className="w-5 h-5" />,
  'Evidence of strong family obligations in home country': <Users className="w-5 h-5" />,
  'Substantial assets: property, investments, business ownership': <Building2 className="w-5 h-5" />,
  'Consider consultation with immigration attorney': <Shield className="w-5 h-5" />,
  'Prepare detailed explanation letter addressing potential concerns': <FileText className="w-5 h-5" />,
  'Document any previous visa compliance (overstay history check)': <Shield className="w-5 h-5" />,
  'Provide sponsor information if applicable with their financials': <Users className="w-5 h-5" />,
};

export function GuidancePanel({ country }: GuidancePanelProps) {
  const riskLevel = getRiskLevel(country.refusalRate);
  const guidance = getGuidance(riskLevel);

  const getRiskStyles = () => {
    switch (riskLevel) {
      case 'low':
        return {
          border: 'border-green-200',
          bg: 'bg-green-50',
          headerBg: 'bg-green-100',
          text: 'text-green-900',
          icon: 'text-green-600'
        };
      case 'moderate':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          headerBg: 'bg-yellow-100',
          text: 'text-yellow-900',
          icon: 'text-yellow-600'
        };
      case 'high':
        return {
          border: 'border-orange-200',
          bg: 'bg-orange-50',
          headerBg: 'bg-orange-100',
          text: 'text-orange-900',
          icon: 'text-orange-600'
        };
      case 'very-high':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          headerBg: 'bg-red-100',
          text: 'text-red-900',
          icon: 'text-red-600'
        };
    }
  };

  const styles = getRiskStyles();

  return (
    <div className={`rounded-xl border ${styles.border} ${styles.bg} overflow-hidden`}>
      <div className={`px-6 py-4 ${styles.headerBg}`}>
        <h3 className={`text-lg font-semibold ${styles.text}`}>
          {guidance.title}
        </h3>
        <p className={`text-sm mt-1 ${styles.text} opacity-80`}>
          {guidance.description}
        </p>
      </div>

      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Recommended Documentation
        </h4>
        <ul className="space-y-3">
          {guidance.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className={`flex-shrink-0 p-2 rounded-lg bg-white ${styles.icon}`}>
                {iconMap[rec] || <FileText className="w-5 h-5" />}
              </div>
              <span className="text-gray-700 text-sm leading-relaxed pt-2">
                {rec}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {riskLevel === 'very-high' && (
        <div className="px-6 py-4 bg-red-100 border-t border-red-200">
          <p className="text-sm text-red-800 font-medium">
            Given the extremely high refusal rate for {country.country}, we strongly recommend consulting with an immigration attorney before applying. The investment in professional guidance may significantly improve your chances of approval.
          </p>
        </div>
      )}

      {riskLevel === 'high' && (
        <div className="px-6 py-4 bg-orange-100 border-t border-orange-200">
          <p className="text-sm text-orange-800">
            Applicants from {country.country} face significant scrutiny. Ensure all documentation is thorough, consistent, and clearly demonstrates strong ties to your home country.
          </p>
        </div>
      )}
    </div>
  );
}
