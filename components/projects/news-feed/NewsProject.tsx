import { NewsFeed } from "./NewsFeed";
import { UserProfile } from "./types";

const DEFAULT_PROFILE: UserProfile = {
    name: "User",
    visaType: "F-1"
};

export function NewsProject() {
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
                        {DEFAULT_PROFILE.visaType} Visa
                    </span>
                </div>

                <NewsFeed profile={DEFAULT_PROFILE} />
            </div>
        </div>
    );
}
