"use client"
import { BsChatDotsFill } from 'react-icons/bs';

const Logo = ({ size = 'default', showText = true, className = '' }) => {
    const sizes = {
        small: { icon: 'w-6 h-6', text: 'text-lg' },
        default: { icon: 'w-8 h-8', text: 'text-xl' },
        large: { icon: 'w-12 h-12', text: 'text-3xl' },
        xl: { icon: 'w-16 h-16', text: 'text-4xl' }
    };

    const sizeConfig = sizes[size] || sizes.default;

    return (
        <div className={`flex items-center space-x-3 ${className}`}>
            <div className={`${sizeConfig.icon} bg-blue-600 rounded-xl flex items-center justify-center shadow-sm`}>
                <BsChatDotsFill className="text-white" />
            </div>
            {showText && (
                <div className="flex flex-col">
                    <span className={`${sizeConfig.text} font-semibold text-gray-900`}>
                        ChatFlow
                    </span>
                    {size === 'xl' && (
                        <span className="text-xs text-gray-500 font-normal">Real-time messaging</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default Logo;

