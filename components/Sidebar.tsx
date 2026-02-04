import {
    LayoutDashboard,
    LineChart,
    Wallet,
    Settings,
    Bell,
    Search,
    Menu
} from 'lucide-react';

interface SidebarProps {
    onConfigClick?: () => void;
}

export function Sidebar({ onConfigClick }: SidebarProps) {
    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-16 md:w-64 bg-card border-r border-border transition-all duration-300 flex flex-col">
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-border">
                <LineChart className="h-6 w-6 text-primary" />
                <span className="hidden md:block ml-3 font-bold tracking-wider text-sm uppercase">Prophet<span className="text-primary">Terminal</span></span>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-6 space-y-1 px-2 md:px-4">
                {[
                    { icon: LayoutDashboard, label: 'Overview', active: true, action: () => { } },
                    { icon: Settings, label: 'Model Config', active: false, action: onConfigClick },
                ].map((item) => (
                    <button
                        key={item.label}
                        onClick={item.action}
                        className={`
              w-full flex items-center justify-center md:justify-start px-2 md:px-4 py-3 
              text-sm font-medium transition-colors border-l-2
              ${item.active
                                ? 'bg-secondary/50 text-primary border-primary'
                                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/30'}
            `}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="hidden md:block ml-3">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Footer Info */}
            <div className="p-4 border-t border-border hidden md:block">
                <MarketStatus />
            </div>
        </aside>
    );
}

import { useEffect, useState } from 'react';
import { endpoints } from '@/lib/api';

function MarketStatus() {
    const [statuses, setStatuses] = useState<Array<{ isOpen: boolean; exchange: string }> | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await endpoints.getMarketStatus();
                setStatuses(data);
            } catch (error) {
                console.error("Failed to fetch market status", error);
                setStatuses([]);
            }
        };
        fetchStatus();
    }, []);

    if (statuses === null) return <div className="p-3 text-xs text-muted-foreground">Loading...</div>;

    return (
        <div className="bg-secondary/50 p-3 rounded-none border border-border space-y-2 mb-12">
            <p className="text-xs text-muted-foreground border-b border-border pb-1 mb-2">Market Status</p>

            {statuses.map((status) => (
                <div key={status.exchange} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground w-12">{status.exchange}</span>
                    <div className="flex items-center">
                        <div className={`h-1.5 w-1.5 rounded-full animate-pulse mr-2 ${status.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className={`text-[10px] font-mono font-bold uppercase ${status.isOpen ? 'text-emerald-500' : 'text-red-500'}`}>
                            {status.isOpen ? 'Open' : 'Closed'}
                        </span>
                    </div>
                </div>
            ))}

            {statuses.length === 0 && (
                <span className="text-xs text-red-500">Unavailable</span>
            )}
        </div>
    );
}
