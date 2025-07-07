"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Activity, ActivityType } from '@/types';
import { api } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  MessageSquare, 
  FileText,
  UserPlus,
  RefreshCw
} from 'lucide-react';

// Activity icon mapping
const activityIcons = {
  [ActivityType.TASK_CREATED]: <Plus className="h-5 w-5 text-green-500" />,
  [ActivityType.TASK_UPDATED]: <RefreshCw className="h-5 w-5 text-blue-500" />,
  [ActivityType.TASK_COMPLETED]: <CheckCircle className="h-5 w-5 text-green-500" />,
  [ActivityType.TASK_ASSIGNED]: <UserPlus className="h-5 w-5 text-indigo-500" />,
  [ActivityType.COMMENT_ADDED]: <MessageSquare className="h-5 w-5 text-yellow-500" />,
  [ActivityType.DOCUMENT_UPLOADED]: <FileText className="h-5 w-5 text-purple-500" />,
  [ActivityType.COMPLIANCE_CHECK]: <AlertTriangle className="h-5 w-5 text-red-500" />,
  [ActivityType.STATUS_CHANGED]: <RefreshCw className="h-5 w-5 text-orange-500" />,
};

interface ActivityFeedProps {
  initialActivities?: Activity[];
  title?: string;
  limit?: number;
}

export function ActivityFeed({ 
  initialActivities, 
  title = "Posledná aktivita", 
  limit = 5 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities || []);
  const [loading, setLoading] = useState(!initialActivities);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch activities if not provided
  useEffect(() => {
    if (!initialActivities) {
      fetchActivities();
    }
  }, [initialActivities]);
  
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const data = await api.activities.getActivities({ limit: limit.toString() });
      setActivities(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Nepodarilo sa načítať aktivity. Skúste to znova neskôr.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: sk
      });
    } catch (error) {
      return 'Neznámy čas';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md">
            {error}
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          /* Activity list */
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  {/* Activity icon */}
                  <div className="mt-1">
                    {activityIcons[activity.type] || <Clock className="h-5 w-5 text-gray-500" />}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    {/* User avatar and activity description */}
                    <div className="flex items-center space-x-2">
                      {activity.user && (
                        <Avatar className="h-6 w-6">
                          {activity.user.avatar ? (
                            <img src={activity.user.avatar} alt={activity.user.name} />
                          ) : (
                            <div className="bg-primary/10 text-primary flex items-center justify-center h-full w-full text-xs">
                              {activity.user.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </Avatar>
                      )}
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.user?.name || 'Systém'}
                        </span>{' '}
                        {activity.description}
                      </p>
                    </div>
                    
                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Žiadne aktivity neboli nájdené.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

