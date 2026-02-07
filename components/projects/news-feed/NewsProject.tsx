import { NewsFeed } from "./NewsFeed";
import { UserProfile } from "./types";

const DEFAULT_PROFILE: UserProfile = {
    name: "User",
    visaType: "F-1"
};

export function NewsProject() {
    return (
        <div className="px-6 py-8 max-w-3xl mx-auto">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-baseline border-b-4 border-black pb-4">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter">IMMIGRANT NEWS</h1>
                    <span className="mt-2 md:mt-0 font-mono text-xs md:text-sm font-bold bg-black text-white px-2 py-1 uppercase">
                        {DEFAULT_PROFILE.visaType}
                    </span>
                </div>

                <NewsFeed profile={DEFAULT_PROFILE} />
            </div>
        </div>
    );
}
