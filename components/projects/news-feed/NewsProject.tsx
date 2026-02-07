import { useUser } from "../../UserContext";
import { NewsFeed } from "./NewsFeed";
import { UserProfile } from "./types";

export function NewsProject() {
    const { user } = useUser();

    // Default to F-1 if no visa status is set
    const currentVisaType = user?.visaStatus || "F-1";

    const profile: UserProfile = {
        name: user ? `${user.firstName} ${user.lastName}` : "Guest",
        visaType: currentVisaType
    };

    return (
        <div className="p-6">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Immigration Updates
                        </h3>
                        <h2 className="text-xl font-semibold text-gray-800">
                            News Feed
                        </h2>
                    </div>
                    <span className="text-xs font-medium bg-gray-800 text-white px-3 py-1.5 rounded-lg">
                        {currentVisaType} Visa
                    </span>
                </div>

                <NewsFeed profile={profile} />
            </div>
        </div>
    );
}
