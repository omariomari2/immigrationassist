import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, MapPin, Calendar, Upload, FileText, ChevronDown, ChevronUp, ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { QuantroLogo } from '../icons/QuantroLogo';
import { useUser } from '../UserContext';
import { SignupData, ImmigrationDocument, VISA_STATUS_OPTIONS } from '../../userTypes';

interface SignupPageProps {
    onSwitchToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin }) => {
    const { signup } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<SignupData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        visaStatus: '',
        location: '',
        visaExpirationDate: '',
        immigrationDocuments: []
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showCustomizations, setShowCustomizations] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const updateField = (field: keyof SignupData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newDocs: ImmigrationDocument[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            await new Promise<void>((resolve) => {
                reader.onload = () => {
                    newDocs.push({
                        id: `doc_${Date.now()}_${i}`,
                        name: file.name,
                        type: file.type,
                        uploadDate: new Date().toISOString(),
                        data: reader.result as string
                    });
                    resolve();
                };
                reader.readAsDataURL(file);
            });
        }

        setFormData(prev => ({
            ...prev,
            immigrationDocuments: [...(prev.immigrationDocuments || []), ...newDocs]
        }));
    };

    const removeDocument = (docId: string) => {
        setFormData(prev => ({
            ...prev,
            immigrationDocuments: prev.immigrationDocuments?.filter(d => d.id !== docId) || []
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        const result = signup(formData);

        if (!result.success) {
            setError(result.error || 'Signup failed');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-bgPrimary flex items-center justify-center p-4 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-lg"
            >
                <div className="bg-white p-8 rounded-3xl shadow-soft">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <QuantroLogo className="text-textPrimary w-8 h-8" />
                        <span className="font-semibold text-xl tracking-tight text-textPrimary">Immigration</span>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-medium text-textPrimary mb-2">Create your account</h1>
                        <p className="text-sm text-textSecondary">Join Quantro to manage your immigration journey</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                    First Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => updateField('firstName', e.target.value)}
                                        placeholder="First name"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-transparent focus:border-gray-200 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                    Last Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => updateField('lastName', e.target.value)}
                                        placeholder="Last name"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-transparent focus:border-gray-200 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-transparent focus:border-gray-200 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                Password *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => updateField('password', e.target.value)}
                                    placeholder="Create a password"
                                    required
                                    className="w-full pl-10 pr-12 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-transparent focus:border-gray-200 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                Phone Number
                                <span className="text-gray-300 ml-1">(Optional)</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    placeholder="Enter phone number"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-transparent focus:border-gray-200 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCustomizations(!showCustomizations)}
                                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    Better Customizations
                                </span>
                                {showCustomizations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            <AnimatePresence>
                                {showCustomizations && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4 space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                                    Visa Status
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={formData.visaStatus}
                                                        onChange={(e) => updateField('visaStatus', e.target.value)}
                                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-transparent focus:border-gray-200 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Select visa status</option>
                                                        {VISA_STATUS_OPTIONS.map(status => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                                    Location
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        value={formData.location}
                                                        onChange={(e) => updateField('location', e.target.value)}
                                                        placeholder="City, State"
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-transparent focus:border-gray-200 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                                    Visa Expiration Date
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="date"
                                                        value={formData.visaExpirationDate}
                                                        onChange={(e) => updateField('visaExpirationDate', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 border border-transparent focus:border-gray-200 focus:bg-white focus:outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                                                    Immigration Documents
                                                </label>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl text-sm text-gray-500 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Upload documents
                                                </button>

                                                {formData.immigrationDocuments && formData.immigrationDocuments.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {formData.immigrationDocuments.map(doc => (
                                                            <div
                                                                key={doc.id}
                                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-xs text-gray-600 truncate max-w-[200px]">{doc.name}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeDocument(doc.id)}
                                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                                >
                                                                    <X className="w-3 h-3 text-gray-400" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 py-3 bg-black text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-textSecondary">
                            Already have an account?{' '}
                            <button
                                onClick={onSwitchToLogin}
                                className="text-black font-medium hover:underline"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
