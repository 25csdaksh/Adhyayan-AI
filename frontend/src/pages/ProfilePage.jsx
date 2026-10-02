import React from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  BookOpen,
  FileText,
  HelpCircle,
  Clock,
  HardDrive,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MOCK_USER, MOCK_NOTEBOOKS } from '../mock/mockData';

export const ProfilePage = () => {
  const { stats } = MOCK_USER;
  const storagePercent = Math.round((stats.storageUsedMB / stats.storageLimitMB) * 100);

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-150">
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E7E3] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={MOCK_USER.avatar}
            name={MOCK_USER.name}
            size="xl"
            status="online"
            className="ring-4 ring-[#E8F2EE]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#17211D]">{MOCK_USER.fullName}</h1>
              <Badge variant="forest" size="sm">Active Researcher</Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#6B756F] mt-0.5">{MOCK_USER.role}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-[#8E9993]">
              <span>{MOCK_USER.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {MOCK_USER.joinedDate}
              </span>
            </div>
          </div>
        </div>

        <Link to="/settings">
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>
        </Link>
      </div>

      {/* Research & Study Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#6B756F] font-medium">
            <BookOpen className="w-4 h-4 text-[#1F5E4B]" /> Notebooks
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{stats.notebooksCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">6 active subjects</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#6B756F] font-medium">
            <FileText className="w-4 h-4 text-[#1F5E4B]" /> Sources Indexed
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{stats.sourcesCount}</p>
          <span className="text-[11px] text-[#6B756F]">PDFs, DOCX, Web URLs</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#6B756F] font-medium">
            <Sparkles className="w-4 h-4 text-[#1F5E4B]" /> AI Queries
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{stats.questionsAsked}</p>
          <span className="text-[11px] text-emerald-600 font-medium">100% grounded</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#6B756F] font-medium">
            <Clock className="w-4 h-4 text-[#1F5E4B]" /> Study Time
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{stats.studyHours} hrs</p>
          <span className="text-[11px] text-[#6B756F]">This semester</span>
        </Card>
      </div>

      {/* Storage & Resource Quota */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#1F5E4B]" />
              Document Storage Quota
            </CardTitle>
            <span className="text-xs font-bold text-[#1F5E4B]">{storagePercent}% Used</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="w-full bg-[#E8EDE9] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#1F5E4B] h-full rounded-full transition-all duration-300"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#6B756F]">
            <span>{stats.storageUsedMB} MB of {stats.storageLimitMB} MB used</span>
            <span>415.8 MB available</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Workspaces List */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#17211D]">Active Study Workspaces</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOCK_NOTEBOOKS.slice(0, 4).map((nb) => (
            <Link
              key={nb.id}
              to={`/notebooks/${nb.id}`}
              className="p-4 rounded-xl bg-white border border-[#E2E7E3] hover:border-[#1F5E4B] shadow-2xs transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{
                    backgroundColor: `${nb.color}15`,
                    color: nb.color || '#1F5E4B',
                  }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#17211D] group-hover:text-[#1F5E4B] transition-colors">
                    {nb.title}
                  </h4>
                  <p className="text-xs text-[#6B756F]">{nb.sourceCount} sources • {nb.lastUpdated}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8E9993] group-hover:text-[#1F5E4B] group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
