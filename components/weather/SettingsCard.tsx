'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePreferences } from '@/lib/stores/preferences';

interface SettingsCardProps {
  className?: string;
}

export default function SettingsCard({ className = '' }: SettingsCardProps) {
  const { language, setLanguage } = usePreferences();
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">고급 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="language" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="language">언어</TabsTrigger>
          </TabsList>
          <TabsContent value="language" className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="language-select" className="text-sm font-medium">
                  언어 선택
                </label>
                <select
                  id="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                </select>
              </div>
              <p className="text-xs text-gray-500">
                선택한 언어는 날짜, 시간, 날씨 상태 등의 표시에 적용됩니다.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 