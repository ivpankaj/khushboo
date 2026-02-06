import React, { useEffect, useState } from 'react';
import { getDashboardData, DashboardData } from '../services/trackingService';
import { LayoutDashboard, Users, Activity, MessageCircle, Clock, MapPin } from 'lucide-react';

const ResultPage: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'responses'>('overview');

    useEffect(() => {
        const fetchData = async () => {
            const dashboardData = await getDashboardData();
            setData(dashboardData);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        // Handle Firestore Timestamp
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Love Analytics 📊</h1>
                        <p className="text-slate-500">Real-time tracking of proposal interactions</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex gap-4">
                        <div className="text-center px-4 border-r border-slate-100">
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Visits</div>
                            <div className="text-2xl font-bold text-pink-600">{data.sessions.length}</div>
                        </div>
                        <div className="text-center px-4">
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Submissions</div>
                            <div className="text-2xl font-bold text-green-600">{data.faqResponses.length}</div>
                        </div>
                    </div>
                </header>

                {/* Navigation Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-4 px-2 font-medium transition-all ${activeTab === 'overview' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`pb-4 px-2 font-medium transition-all ${activeTab === 'sessions' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Sessions (Active Now)
                    </button>
                    <button
                        onClick={() => setActiveTab('responses')}
                        className={`pb-4 px-2 font-medium transition-all ${activeTab === 'responses' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Quiz Responses
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-blue-500" /> Recent Activity
                            </h2>
                            <div className="space-y-6">
                                {data.events.slice(0, 10).map((event) => (
                                    <div key={event.id} className="flex items-start gap-4 group">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            <Clock size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-slate-700">{event.name.replace(/_/g, ' ')}</span>
                                                <span className="text-xs text-slate-400">{formatDate(event.timestamp)}</span>
                                            </div>
                                            <div className="text-sm text-slate-500 mb-1">
                                                {event.ip} • {event.path}
                                            </div>
                                            {event.payload && Object.keys(event.payload).length > 0 && (
                                                <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 font-mono mt-1 overflow-x-auto">
                                                    {JSON.stringify(event.payload).slice(0, 100)}
                                                    {JSON.stringify(event.payload).length > 100 ? '...' : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Users size={20} className="text-purple-500" /> Visitors
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">User</th>
                                            <th className="px-4 py-3">Location</th>
                                            <th className="px-4 py-3">Device</th>
                                            <th className="px-4 py-3 rounded-r-lg">First Seen</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.sessions.slice(0, 10).map((session) => (
                                            <tr key={session.id} className="border-b border-slate-50 last:border-0">
                                                <td className="px-4 py-4 font-mono text-xs text-slate-500">
                                                    {session.sessionId.slice(0, 8)}...
                                                </td>
                                                <td className="px-4 py-4">
                                                    {session.ipInfo ? (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={14} className="text-slate-400" />
                                                            {session.ipInfo.city}, {session.ipInfo.country_name}
                                                        </div>
                                                    ) : 'Unknown'}
                                                </td>
                                                <td className="px-4 py-4 text-slate-500">
                                                    {session.deviceInfo?.platform || 'Web'}
                                                </td>
                                                <td className="px-4 py-4 text-slate-400">
                                                    {formatDate(session.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'responses' && (
                    <div className="space-y-6">
                        {data.faqResponses.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">No responses yet 😢</div>
                        ) : (
                            data.faqResponses.map((response) => (
                                <div key={response.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                                <MessageCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">New Submission</div>
                                                <div className="text-sm text-slate-500">{formatDate(response.timestamp)}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-mono bg-slate-100 px-3 py-1 rounded text-slate-500">
                                            ID: {response.id}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(response.answers || {}).map(([key, value]) => (
                                            <div key={key} className="bg-slate-50 p-4 rounded-xl">
                                                <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">
                                                    {key.replace(/guess|([A-Z])/g, ' $1').trim()}
                                                </div>
                                                <div className="text-slate-700 font-medium">
                                                    {String(value)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ResultPage;
